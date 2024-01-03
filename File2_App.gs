function checkForNewAlerts(setting) {
  if (setting === undefined || typeof setting !== 'string') {
    setting = 'production';
  }
  setGlobalValues(setting);
  const preppedMessages = getPreppedMessages();
  const newAlertsCount = preppedMessages.length;
  if (newAlertsCount > 0) {
    Logger.log(newAlertsCount + ' new alert messages found');
    processBankAlerts(preppedMessages);
  } else {
    Logger.log('No new alerts');
  }
}

function getPreppedMessages() {
  if (GLOBAL_CONST.MESSAGE_SOURCE === 'email') {
    return prepMessagesFromEmail();
  } else if (GLOBAL_CONST.MESSAGE_SOURCE === 'test-data') {
    return prepMessagesFromTestData();
  } else {
    // throw error
  }
}

function prepMessagesFromEmail() {
  let preppedMessages = [];
  const allMessages = GmailApp.getMessagesForThreads(GLOBAL_CONST.UNPROCESSED_ALERTS);
  allMessages.forEach(thisMessage => {
    let receivedTime = thisMessage[0].getDate();
    let messageContent = thisMessage[0].getPlainBody();
    let thisMessagePrepped = [receivedTime, messageContent];
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function processBankAlerts(preppedMessages) {
  try {
    let transactionValues = getTransactionsFromAllMessages(preppedMessages);
    transactionValues.allNew.forEach(thisTransaction => {
      writeToTransactionsSheet(thisTransaction, GLOBAL_CONST.TRANSACTIONS_SHEET);
    });
    Logger.log('Transactions added to sheet');
    reviewPendingTransactionsFromSheet(transactionValues.newCompleted);
    updateLabels();
  } catch (error) {
    GLOBAL_VAR.ERROR_OCCURRED = true;
    console.error('Error:', error.message);
    console.error(error.stack);
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push('An error occured while trying to process one or more bank alerts.');
  }
  if (GLOBAL_VAR.ERROR_OCCURRED) {
    sendErrorAlertEmail();
  }
}

function getTransactionsFromAllMessages(preppedMessages) {
  let allTransactionValues = {
    allNew: [],
    newCompleted: []
  }
  preppedMessages.forEach(thisMessage => {
    let receivedTime = thisMessage[0]
    let messageContent = thisMessage[1]
    Logger.log('Message:');
    Logger.log(messageContent);
    let messageSections = messageContent.split(new RegExp(`(?<=${GLOBAL_CONST.REGEX.AMOUNT.source})`, "g"));
    let messageTransactionValues = getTransactionsFromThisMessage(messageSections, receivedTime);
    allTransactionValues.allNew.push(...messageTransactionValues.allNew);
    allTransactionValues.newCompleted.push(...messageTransactionValues.newCompleted);
  });
  Logger.log(allTransactionValues.allNew.length + ' transactions found');
  Logger.log('Transactions:');
  Logger.log(allTransactionValues.allNew);
  return allTransactionValues;
}

function getTransactionsFromThisMessage(messageSections, receivedTime) {
  let valuesFromAllMessageTransactions = [];
  let newCompletedMessageTransactions = [];
  messageSections.forEach(thisSection => {
    try {
      if (GLOBAL_CONST.REGEX.TRANS_TYPE.test(thisSection)) {
        let accountNum = thisSection.match(GLOBAL_CONST.REGEX.ACCOUNT_NUM)[0].slice(0, 4);
        let transType = thisSection.match(GLOBAL_CONST.REGEX.TRANS_TYPE)[0].replace('Large ', '');
        let dollarAmount = thisSection.match(GLOBAL_CONST.REGEX.AMOUNT)[0].replace('$', '');
        if (GLOBAL_CONST.REGEX.EXPENSE.test(transType)) {
          dollarAmount = ('-' + dollarAmount);
        }
        let transDescription = thisSection.match(GLOBAL_CONST.REGEX.DESCRIPTION)[0].slice(1).slice(0, -1);
        let valuesfromTransaction = [receivedTime, accountNum, transType, dollarAmount, transDescription];
        valuesFromAllMessageTransactions.push(valuesfromTransaction);
        if (GLOBAL_CONST.REGEX.PENDING.test(transType) === false) {
          let valuesForComp = valuesfromTransaction.slice(1);
          valuesForComp[2] = valuesForComp[2].replace(/,/g, '');
          newCompletedMessageTransactions.push(valuesForComp);
        }
      } else if (GLOBAL_CONST.REGEX.NON_TRANS_TYPE.test(thisSection)) {
        Logger.log('Non transaction email alert');
      } else if (!GLOBAL_CONST.REGEX.OTHER_CONTENT.test(thisSection)) {
        GLOBAL_VAR.ERROR_OCCURRED = true;
        console.error('Error: Unexpected non-matching content');
        GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push('Unexpected non-transaction content was found.');
      }
    } catch (error) {
      GLOBAL_VAR.ERROR_OCCURRED = true;
      console.error('Error:', error.message);
      console.error(error.stack);
      GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push('An error occured while using regex to scrape transaction values.');
    }
  });
  let messageTransactionValues = {
    allNew: valuesFromAllMessageTransactions,
    newCompleted: newCompletedMessageTransactions
  };
  return messageTransactionValues;
}

function writeToTransactionsSheet(transactionValues, sheet) {
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 5).setValues([transactionValues]);
}

function reviewPendingTransactionsFromSheet(newCompletedTransactions) {
  if (newCompletedTransactions.length > 0) {
    const allRowsFromTransactionSheet = GLOBAL_CONST.TRANSACTIONS_SHEET.getDataRange().getValues();
    let currentPendingTransactions = getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet);
    if (currentPendingTransactions.length > 0) {
      var anyPendingTransactionWasResolved = resolveAnyCompletedPendingTransactions(
        newCompletedTransactions,
        currentPendingTransactions
      );
    }
  }
  if (anyPendingTransactionWasResolved === false) {
    Logger.log('No pending transactions were completed');
  }
}

function getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet) {
  let currentPendingTransactions = [];
  allRowsFromTransactionSheet.forEach((thisTransactionFromSheet, index) => {
    if (GLOBAL_CONST.REGEX.PENDING.test(thisTransactionFromSheet)) {
      let rowNumber = (index + 1);
      let accountNum = thisTransactionFromSheet[1].toString();
      let transType = thisTransactionFromSheet[2];
      let dollarAmount = thisTransactionFromSheet[3].toFixed(2);
      let transDescription = thisTransactionFromSheet[4];
      currentPendingTransactions.push([rowNumber, [accountNum, transType, dollarAmount, transDescription]]);
    }
  });
  return currentPendingTransactions;
}

function resolveAnyCompletedPendingTransactions(newCompletedTransactions, currentPendingTransactions) {
  let anyPendingTransactionWasResolved = false;
  newCompletedTransactions.forEach(thisNewCompletedTransaction => {
    for (let i = 0; i < currentPendingTransactions.length; i++) {
      let thisPendingTransaction = currentPendingTransactions[i];
      let pendingTransactionForComp = [...thisPendingTransaction[1]];
      pendingTransactionForComp[1] = pendingTransactionForComp[1].replace('Pending ', '');
      if (JSON.stringify(pendingTransactionForComp) === JSON.stringify(thisNewCompletedTransaction)) {
        Logger.log('Found completed pending transaction:');
        Logger.log(thisPendingTransaction[1]);
        Logger.log(thisNewCompletedTransaction);
        GLOBAL_CONST.TRANSACTIONS_SHEET.deleteRow(thisPendingTransaction[0]);
        currentPendingTransactions.splice(i, 1);
        i--;
        anyPendingTransactionWasResolved = true;
        Logger.log('Entry for pending transaction deleted from sheet');
        break;
      }
    }
  });
  return anyPendingTransactionWasResolved;
}

function updateLabels() {
  GLOBAL_CONST.UNPROCESSED_ALERTS.forEach(thisThread => {
    thisThread.addLabel(GLOBAL_CONST.POST_PROCESS_LABEL);
    thisThread.removeLabel(GLOBAL_CONST.PRE_PROCESS_LABEL);
  });
  Logger.log('Email labels updated');
}

function sendErrorAlertEmail() {
  MailApp.sendEmail({
    to: GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS,
    subject: GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT,
    body: GLOBAL_VAR.ERROR_EMAIL_MESSAGES.join('\n')
  });
  Logger.log('Error email sent');
}