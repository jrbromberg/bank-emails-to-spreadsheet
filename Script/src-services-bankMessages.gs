// this is the heart of the app.  bank emails are processed here.

function getPreppedMessages() {
  if (GLOBAL_CONST.MESSAGE_SOURCE === "email") {
    return prepMessagesFromEmail();
  } else if (GLOBAL_CONST.MESSAGE_SOURCE === "test-data") {
    return prepMessagesFromTestData();
  } else {
    addError(new Error("Unexpected message source specified"));
  }
}

function prepMessagesFromEmail() {
  let preppedMessages = [];
  GLOBAL_CONST.STARRED_MESSAGES.forEach((starredMessage) => {
    let fromEmail = starredMessage.getFrom().match(/(?<=\<).*(?=\>)/)[0];
    let receivedTime = starredMessage.getDate();
    let messageContent = starredMessage.getPlainBody();
    let preppedMessage = {
      from: fromEmail,
      time: receivedTime,
      content: messageContent,
    };
    preppedMessages.push(preppedMessage);
  });
  return preppedMessages;
}

function processMessages(preppedMessages) {
  try {
    let financialUpdates =
      getFinancialUpdatesFromPreppedMessages(preppedMessages);
    // need to ensure that these are in reverse row order
    // so that rows pending deletion aren't re-ordered (got bottom to top)
    // seems this happen by accident but want to ensure it
    financialUpdates.forEach((financialUpdate) => {
      writeToTransactionsSheet(financialUpdate);
    });
    Logger.log("Financial updates added to sheet");
    runPostUpdatePendingReview();
    updateStars();
  } catch (error) {
    addError(error, "Error occurred while processing messages");
  }
}

function getFinancialUpdatesFromPreppedMessages(preppedMessages) {
  let allFinancialUpdates = [];
  for (let preppedMessage of preppedMessages) {
    try {
      let messageContent = preppedMessage.content;
      let bank = getBankData(messageContent, preppedMessage.from);
      let receivedTime = preppedMessage.time;
      Logger.log("Message:");
      Logger.log(messageContent);
      if (notMessageToIgnore(messageContent, bank)) {
        let financialUpdatesFromMessage = getFinancialUpdatesFromMessage(
          messageContent,
          receivedTime,
          bank
        );
        allFinancialUpdates.push(...financialUpdatesFromMessage);
      } else {
        Logger.log("This is a message to ignore");
      }
    } catch (error) {
      addError(
        error,
        "Error occured while getting financial updates from a prepped message"
      );
      continue;
    }
  }
  Logger.log(allFinancialUpdates.length + " financial updates found");
  Logger.log("Financial updates:");
  Logger.log(allFinancialUpdates);
  return allFinancialUpdates;
}

function getBankData(messageContent, sender) {
  let bankData =
    Object.values(BANKS).find((bank) => bank.SENDERS.DIRECT.includes(sender)) ||
    Object.values(BANKS).find((bank) =>
      bank.SENDERS.FORWARDED.some((forwarded) =>
        messageContent.includes(forwarded)
      )
    );
  return bankData
    ? bankData
    : addError(
        new Error(
          [
            "Email origin not recognized in message content",
            "---start message content---",
            messageContent,
            "---end message content---",
          ].join("\n")
        )
      );
}

function notMessageToIgnore(messageContent, bank) {
  return bank.MESSAGES_TO_IGNORE
    ? bank.MESSAGES_TO_IGNORE.every(
        (messageToIgnore) => !messageToIgnore.test(messageContent)
      )
    : true;
}

function getFinancialUpdatesFromMessage(messageContent, receivedTime, bank) {
  let financialUpdatesFromMessage = [];
  try {
    messageFormat = getMessageFormat(messageContent, bank);
    let messageSections =
      messageFormat && messageFormat.DELIMITER
        ? messageContent.split(messageFormat.DELIMITER)
        : [messageContent];
    messageSections.forEach((messageSection) => {
      let financialUpdatesFromSection = getFinancialUpdatesFromMessageSection(
        messageSection,
        messageFormat,
        receivedTime,
        bank
      );
      if (financialUpdatesFromSection) {
        financialUpdatesFromMessage.push(financialUpdatesFromSection);
      } else if (notAnExtraMessageSection(messageFormat, messageSection)) {
        addError(new Error("Unrecognized section in financial update message"));
      }
    });
  } catch (error) {
    addError(
      error,
      [
        "Error occured while getting financial updates from a prepped message",
        "---start message content---",
        messageContent,
        "---end message content---",
      ].join("\n")
    );
  }
  return financialUpdatesFromMessage;
}

function getMessageFormat(messageContent, bank) {
  let messageFormat = Object.values(bank.FINANCIAL_UPDATE_MESSAGE_FORMATS).find(
    (messageFormat) =>
      Object.values(messageFormat.FINANCIAL_UPDATE_TYPES).some(
        (financialUpdateType) => messageContent.match(financialUpdateType.REGEX)
      )
  );
  return messageFormat
    ? messageFormat
    : addError(new Error("Message format not found"));
}

function getFinancialUpdatesFromMessageSection(
  messageSection,
  messageFormat,
  receivedTime,
  bank
) {
  let financialUpdateType = getFinancialUpdateType(
    messageSection,
    messageFormat
  );
  if (financialUpdateType) {
    let accountNum = smartMatch(messageSection, messageFormat.ACCOUNT_NUM);
    let description = smartMatch(messageSection, messageFormat.DESCRIPTION);
    let dollarAmount = smartMatch(messageSection, messageFormat.AMOUNT);
    if (
      dollarAmount != null &&
      [
        FINANCIAL_UPDATE_TYPES.EXPENSE,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
      ].includes(financialUpdateType)
    ) {
      dollarAmount = `-${dollarAmount}`;
    }
    if (
      [
        receivedTime,
        bank?.NAME?.SHORT,
        accountNum,
        financialUpdateType,
        dollarAmount,
        description,
      ].every((value) => value != null)
    ) {
      return [
        receivedTime,
        bank.NAME.SHORT,
        accountNum,
        financialUpdateType,
        dollarAmount,
        description,
      ];
    }
  }
  return null;
}

function notAnExtraMessageSection(messageFormat, messageSection) {
  return !messageFormat.EXTRA_SECTION.REGEX?.test(messageSection);
}

function getFinancialUpdateType(messageSection, messageFormat) {
  const matchingUpdateType = Object.entries(
    messageFormat.FINANCIAL_UPDATE_TYPES
  ).find(([_, type]) => type.REGEX.test(messageSection));
  if (matchingUpdateType) {
    const [typeKey, _] = matchingUpdateType;
    const matchingName = Object.entries(FINANCIAL_UPDATE_TYPES).find(
      ([nameKey]) => nameKey === typeKey
    );
    return matchingName ? matchingName[1] : null;
  }
  return null;
}

function writeToTransactionsSheet(financialUpdates) {
  GLOBAL_CONST.WRITE_SHEET.insertRowBefore(2);
  GLOBAL_CONST.WRITE_SHEET.getRange(2, 1, 1, financialUpdates.length).setValues(
    [financialUpdates]
  );
}
