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
    let bank = getBankData(thisMessage);
    let messageType = getMessageType(messageContent, bank);
    let receivedTime = thisMessage.time;
    Logger.log(messageType + " message:");
    Logger.log(messageContent);
    let messageUpdateValues = getUpdatesFromThisMessage(
      messageType,
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

function getBankData(message) {
  for (const [bank, bankValues] of Object.entries(BANKS)) {
    if (bankValues.SENDER === message.from) {
      return bankValues;
    }
  }
  addError(new Error("Bank update email sender address not recognized"));
}

function getMessageType(messageContent, bank) {
  if (bank.BALANCE && messageContent.match(bank.BALANCE.IS_TYPE)) {
    return "Balance";
  } else if (
    bank.TRANS_TYPE &&
    findMatchingTransactionType(messageContent, bank)
  ) {
    return "Transaction";
  } else if (bank.NON_UPDATE.some((regex) => regex.test(messageContent))) {
    return "Other Alert";
  }
  addError(new Error("Message type not recognized"));
}

function findMatchingTransactionType(content, bank) {
  return Object.entries(bank.TRANS_TYPE).find(([typeKey, regex]) =>
    regex.test(content)
  );
}

function getUpdatesFromThisMessage(
  messageType,
  messageContent,
  receivedTime,
  bank
) {
  let allValuesFromAllUpdatesInThisMessage = [];
  try {
    if (messageType === "Transaction") {
      let transactionUpdateValues = getTransactionUpdateValues(
        messageContent,
        receivedTime,
        bank
      );
      if (transactionUpdateValues) {
        allValuesFromAllUpdatesInThisMessage.push(...transactionUpdateValues);
      } else {
        addError(new Error("Transaction values not found"));
      }
    } else if (messageType === "Balance") {
      let balanceUpdateValues = getBalanceUpdateValues(
        messageContent,
        receivedTime,
        bank
      );
      if (balanceUpdateValues) {
        allValuesFromAllUpdatesInThisMessage.push(balanceUpdateValues);
      } else {
        addError(new Error("Balance values not found"));
      }
    }
  } catch (error) {
    addError(error, "Error occured while getting update values");
  }
  return allValuesFromAllUpdatesInThisMessage;
}

function getTransactionUpdateValues(messageContent, receivedTime, bank) {
  let allTransactionUpdateValuesFromThisMessage = [];
  let messageTransType = getTransactionTypeName(messageContent, bank);
  if (messageTransType === "Payment") {
    let transactionUpdateValues = getPaymentTransactionUpdateValues(
      messageContent,
      receivedTime,
      bank
    );
    if (transactionUpdateValues) {
      allTransactionUpdateValuesFromThisMessage.push(transactionUpdateValues);
    } else {
      addError(new Error("Payment values not found"));
    }
  } else {
    let messageSections = messageContent.split(bank.SECTION_DELIMITER);
    messageSections.forEach((thisSection) => {
      let transactionUpdateValues = getStandardTransactionUpdateValues(
        thisSection,
        receivedTime,
        bank
      );
      if (transactionUpdateValues) {
        allTransactionUpdateValuesFromThisMessage.push(transactionUpdateValues);
      } else if (!bank.OTHER_CONTENT?.test(thisSection)) {
        addError(new Error("Unrecognized transaction section"));
      }
    });
  }
  return allTransactionUpdateValuesFromThisMessage;
}

function getTransactionTypeName(section, bank) {
  const matchingTransType = findMatchingTransactionType(section, bank);
  if (matchingTransType) {
    const [typeKey, regex] = matchingTransType;
    const matchingName = Object.entries(TRANSACTION_NAMES).find(
      ([nameKey]) => nameKey === typeKey
    );
    return matchingName ? matchingName[1] : null;
  }
  return null;
}

function getPaymentTransactionUpdateValues(messageSection, receivedTime, bank) {
  let accountNum = messageSection.match(bank.PAYMENT.ACCOUNT_NUM)[0];
  let dollarAmount = messageSection
    .match(bank.PAYMENT.AMOUNT)[0]
    .replace("$", "")
    .trim();
  let transDescription = messageSection
    .match(bank.PAYMENT.DESCRIPTION)[0]
    .trim();
  return [
    receivedTime,
    bank.SHORT_NAME,
    accountNum,
    "Payment",
    dollarAmount,
    transDescription,
  ];
}

function getStandardTransactionUpdateValues(
  messageSection,
  receivedTime,
  bank
) {
  let transType = getTransactionTypeName(messageSection, bank);
  let accountNum = messageSection.match(bank.ACCOUNT_NUM)[0];
  let dollarAmount = messageSection
    .match(bank.AMOUNT)[0]
    .replace("$", "")
    .trim();
  if (
    [TRANSACTION_NAMES.EXPENSE, TRANSACTION_NAMES.PENDING_EXPENSE].includes(
      transType
    )
  ) {
    dollarAmount = "-" + dollarAmount;
  }
  let transDescription = messageSection.match(bank.DESCRIPTION)[0].trim();
  return [
    receivedTime,
    bank.SHORT_NAME,
    accountNum,
    transType,
    dollarAmount,
    transDescription,
  ];
}

function getBalanceUpdateValues(messageSection, receivedTime, bank) {
  let balance = messageSection
    .match(bank.BALANCE.AMOUNT)[0]
    .replace("$", "")
    .trim();
  let accountNum = messageSection.match(bank.BALANCE.ACCOUNT_NUM)[0];
  let updateType = "Balance";
  let description = messageSection.match(bank.BALANCE.DESCRIPTION)[0].trim();
  if (balance && accountNum && description) {
    return [
      receivedTime,
      bank.SHORT_NAME,
      accountNum,
      updateType,
      balance,
      description,
    ];
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
