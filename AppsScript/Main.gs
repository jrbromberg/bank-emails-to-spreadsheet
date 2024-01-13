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
    let receivedTime = thisMessage.getDate();
    let messageContent = thisMessage.getPlainBody();
    let thisMessagePrepped = [receivedTime, messageContent];
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function processMessages(preppedMessages) {
  try {
    let transactionValues = getTransactionsFromAllMessages(preppedMessages);
    // need to ensure that these are in reverse row order
    // so that rows pending deletion aren't re-ordered (got bottom to top)
    // seems this happen by accident but want to ensure it
    transactionValues.forEach((thisTransaction) => {
      writeToTransactionsSheet(
        thisTransaction,
        GLOBAL_CONST.TRANSACTIONS_SHEET
      );
    });
    Logger.log("Transactions added to sheet");
    runPostUpdatePendingReview();
    updateStars();
  } catch (error) {
    addError(error, "Error occursed while processing the email alerts");
  }
}

function getTransactionsFromAllMessages(preppedMessages) {
  let allTransactionValues = [];
  preppedMessages.forEach((thisMessage) => {
    let receivedTime = thisMessage[0];
    let messageContent = thisMessage[1];
    Logger.log("Message:");
    Logger.log(messageContent);
    let messageSections = messageContent.split(
      new RegExp(`(?<=${GLOBAL_CONST.REGEX.AMOUNT.source})`, "g")
    );
    let messageTransactionValues = getTransactionsFromThisMessage(
      messageSections,
      receivedTime
    );
    allTransactionValues.push(...messageTransactionValues);
  });
  Logger.log(allTransactionValues.length + " transactions found");
  Logger.log("Transactions:");
  Logger.log(allTransactionValues);
  return allTransactionValues;
}

function getTransactionsFromThisMessage(messageSections, receivedTime) {
  let valuesFromAllMessageTransactions = [];
  messageSections.forEach((thisSection) => {
    try {
      if (GLOBAL_CONST.REGEX.TRANS_TYPE.test(thisSection)) {
        let accountNum = thisSection
          .match(GLOBAL_CONST.REGEX.ACCOUNT_NUM)[0]
          .slice(0, 4);
        let transType = thisSection
          .match(GLOBAL_CONST.REGEX.TRANS_TYPE)[0]
          .replace("Large ", "");
        let dollarAmount = thisSection
          .match(GLOBAL_CONST.REGEX.AMOUNT)[0]
          .replace("$", "");
        if (GLOBAL_CONST.REGEX.EXPENSE.test(transType)) {
          dollarAmount = "-" + dollarAmount;
        }
        let transDescription = thisSection
          .match(GLOBAL_CONST.REGEX.DESCRIPTION)[0]
          .slice(1)
          .slice(0, -1);
        let valuesfromTransaction = [
          receivedTime,
          accountNum,
          transType,
          dollarAmount,
          transDescription,
        ];
        valuesFromAllMessageTransactions.push(valuesfromTransaction);
      } else if (GLOBAL_CONST.REGEX.NON_TRANS_TYPE.test(thisSection)) {
        Logger.log("Non transaction email alert");
      } else if (!GLOBAL_CONST.REGEX.OTHER_CONTENT.test(thisSection)) {
        addError(new Error("Unexpected content in email"));
      }
    } catch (error) {
      addError(error, "Error occured while getting values via regex");
    }
  });
  return valuesFromAllMessageTransactions;
}

function writeToTransactionsSheet(transactionValues, sheet) {
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 5).setValues([transactionValues]);
}

function updateStars() {
  GmailApp.unstarMessages(GLOBAL_CONST.STARRED_MESSAGES);
  Logger.log("Message stars updated");
}
