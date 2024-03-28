function checkForNewAlerts(setting) {
  try {
    setting = typeof setting !== "string" ? "production" : setting;
    setGlobalValues(setting);
    const preppedMessages = getPreppedMessages();
    const newAlertsCount = preppedMessages.length;
    if (newAlertsCount > 0) {
      Logger.log(newAlertsCount + " new alert messages found");
      processMessages(preppedMessages);
    } else {
      Logger.log("No new alerts");
    }
  } catch (error) {
    addError(error, "The script was not able to run");
  }
  if (GLOBAL_VAR.ERROR_OCCURRED) {
    sendErrorAlertEmail();
  }
}

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
  GLOBAL_CONST.STARRED_MESSAGES.forEach((thisMessage) => {
    let fromEmail = thisMessage.getFrom().match(/(?<=\<).*(?=\>)/)[0];
    let receivedTime = thisMessage.getDate();
    let messageContent = thisMessage.getPlainBody();
    let thisMessagePrepped = {
      from: fromEmail,
      time: receivedTime,
      content: messageContent,
    };
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function processMessages(preppedMessages) {
  try {
    let updateValues = getUpdatesFromAllMessages(preppedMessages);
    // need to ensure that these are in reverse row order
    // so that rows pending deletion aren't re-ordered (got bottom to top)
    // seems this happen by accident but want to ensure it
    updateValues.forEach((thisUpdate) => {
      writeToTransactionsSheet(thisUpdate, GLOBAL_CONST.TRANSACTIONS_SHEET);
    });
    Logger.log("Updates added to sheet");
    runPostUpdatePendingReview();
    updateStars();
  } catch (error) {
    addError(error, "Error occursed while processing the email alerts");
  }
}

function getUpdatesFromAllMessages(preppedMessages) {
  let allUpdateValues = [];
  preppedMessages.forEach((thisMessage) => {
    let messageContent = thisMessage.content;
    let bank = getBankData(messageContent, thisMessage.from);
    let receivedTime = thisMessage.time;
    Logger.log("Message:");
    Logger.log(messageContent);
    let messageUpdateValues = getUpdatesFromThisMessage(
      messageContent,
      receivedTime,
      bank
    );
    allUpdateValues.push(...messageUpdateValues);
  });
  Logger.log(allUpdateValues.length + " updates found");
  Logger.log("Updates:");
  Logger.log(allUpdateValues);
  return allUpdateValues;
}

function getBankData(messageContent, sender) {
  let bankValues =
    Object.values(BANKS).find((bank) => bank.SENDERS.DIRECT.includes(sender)) ||
    Object.values(BANKS).find((bank) =>
      bank.SENDERS.FORWARDED.some((forwarded) =>
        messageContent.includes(forwarded)
      )
    );
  return bankValues
    ? bankValues
    : addError(new Error("Email alert origin not recognized"));
}

function getUpdatesFromThisMessage(messageContent, receivedTime, bank) {
  let allValuesFromAllUpdatesInThisMessage = [];
  try {
    messageFormat = getMessageFormat(messageContent, bank);
    let messageSections = messageFormat.DELIMITER
      ? messageContent.split(messageFormat.DELIMITER)
      : [messageContent];
    messageSections.forEach((thisSection) => {
      let updateValuesFromSection = getUpdateValuesFromSection(
        thisSection,
        messageFormat,
        receivedTime,
        bank
      );
      if (updateValuesFromSection) {
        allValuesFromAllUpdatesInThisMessage.push(updateValuesFromSection);
      } else if (!messageFormat.EXTRA_SECTION?.test(thisSection)) {
        addError(new Error("Unrecognized transaction section"));
      }
    });
  } catch (error) {
    addError(error, "Error occured while getting update values");
  }
  return allValuesFromAllUpdatesInThisMessage;
}

function getMessageFormat(messageContent, bank) {
  return Object.values(bank.UPDATES).find((messageFormat) =>
    Object.values(messageFormat.HAS_TYPE).some((updateType) =>
      messageContent.match(updateType)
    )
  );
}

function getUpdateValuesFromSection(
  section,
  messageFormat,
  receivedTime,
  bank
) {
  let updateType = getUpdateTypeName(section, messageFormat);
  if (updateType) {
    let accountNum = smartMatch(section, messageFormat.ACCOUNT_NUM);
    let updateDescription = smartMatch(section, messageFormat.DESCRIPTION);
    let dollarAmount = smartMatch(section, messageFormat.AMOUNT);
    if (
      [UPDATE_TYPES.EXPENSE, UPDATE_TYPES.PENDING_EXPENSE].includes(updateType)
    ) {
      dollarAmount = `-${dollarAmount}`;
    }
    return [
      receivedTime,
      bank.NAME.SHORT,
      accountNum,
      updateType,
      dollarAmount,
      updateDescription,
    ];
  }
  return null;
}

function smartMatch(stringToSearch, regex) {
  let simpleMatch = stringToSearch.match(regex);
  if (!simpleMatch) {
    addError(new Error("Failed to match regex " + regex));
  }
  let matchToReturn = simpleMatch
    ? simpleMatch[simpleMatch.length > 1 ? 1 : 0]
    : undefined;
  matchToReturn =
    typeof matchToReturn === "string" ? matchToReturn.trim() : matchToReturn;
  if (matchToReturn) return matchToReturn;
  addError(new Error("smartMatch failed \nsimpleMatch: " + simpleMatch));
}

function getUpdateTypeName(section, messageFormat) {
  const matchingUpdateType = Object.entries(messageFormat.HAS_TYPE).find(
    ([_, regex]) => regex.test(section)
  );
  if (matchingUpdateType) {
    const [typeKey, _] = matchingUpdateType;
    const matchingName = Object.entries(UPDATE_TYPES).find(
      ([nameKey]) => nameKey === typeKey
    );
    return matchingName ? matchingName[1] : null;
  }
  return null;
}

function writeToTransactionsSheet(updateValues, sheet) {
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 6).setValues([updateValues]);
}

function updateStars() {
  GmailApp.unstarMessages(GLOBAL_CONST.STARRED_MESSAGES);
  Logger.log("Message stars updated");
}
