// add your info here
const SPREADSHEET_ID = 'PUT YOUR GOOGLE SPREADSHEET ID HERE';
const ERROR_ALERT_EMAIL_ADDRESS = 'CHOOSE EMAIL ADDRESS FOR ERROR ALERTS';

// if using with BECU, as of writing, no changes are needed below this line
// setup your email, spreadsheet, and bank account alerts per the readme
const TRANSACTIONS_SHEET = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Transactions');
const POST_PROCESS_LABEL = GmailApp.getUserLabelByName('TransactionAdded');
const PRE_PROCESS_LABEL = GmailApp.getUserLabelByName('BankTransactionUpdate');
const UNPROCESSED_ALERTS = PRE_PROCESS_LABEL.getThreads();
const ALL_MESSAGES = GmailApp.getMessagesForThreads(UNPROCESSED_ALERTS);
const REGEX = {
  ACCOUNT_NUM: /\d{4} \*/,
  TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
  PENDING: /Pending/,
  AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
  EXPENSE: /Expense/,
  DESCRIPTION: /\(.*\)/,
  OTHER_CONTENT: /12770 Gateway Drive/
}
let ERROR_EMAIL_MESSAGES = [];
let ERROR_OCCURRED = false;

function checkForNewAlerts() {
  const newAlertsCount = UNPROCESSED_ALERTS.length;
  if (newAlertsCount > 0) {
    Logger.log(newAlertsCount + ' new alert messages found');
    processBankAlerts();
  } else {
    Logger.log('No new alerts');
  }
}

function processBankAlerts() {
  try {
    let transactionValues = fetchTransactionsFromBankEmails();
    transactionValues.allNew.forEach(writeToTransactionsSheet);
    Logger.log('Transactions added to sheet');
    reviewPendingTransactionsFromSheet(transactionValues.newCompleted);
    updateLabels();
  } catch (error) {
    ERROR_OCCURRED = true;
    console.error('Error:', error.message);
    console.error(error.stack);
    ERROR_EMAIL_MESSAGES.push('An error occured while trying to process one or more bank alerts.');
  }
  if (ERROR_OCCURRED) {
    sendErrorAlertEmail();
  }
}

function fetchTransactionsFromBankEmails() {
  let allTransactionValues = {
    allNew: [],
    newCompleted: []
  }
  for (let i = 0; i < ALL_MESSAGES.length; i++) {
    let thisMessage = ALL_MESSAGES[i];
    let receivedTime = thisMessage[0].getDate();
    let messageContent = thisMessage[0].getPlainBody();
    Logger.log('Message:');
    Logger.log(messageContent);
    let messageSections = messageContent.split(new RegExp(`(?<=${REGEX.AMOUNT.source})`, "g"));
    let messageTransactionValues = getValuesForMessageTransactions(messageSections, receivedTime);
    allTransactionValues.allNew.push(...messageTransactionValues.allNew);
    allTransactionValues.newCompleted.push(...messageTransactionValues.newCompleted);
  }
  Logger.log(allTransactionValues.allNew.length + ' transactions found');
  Logger.log('Transactions:');
  Logger.log(allTransactionValues.allNew);
  return allTransactionValues;
}

function getValuesForMessageTransactions(messageSections, receivedTime) {
  let valuesFromAllMessageTransactions = [];
  let newCompletedMessageTransactions = [];
  messageSections.forEach(thisSection => {
    try {
      if (REGEX.ACCOUNT_NUM.test(thisSection)) {
        let accountNum = thisSection.match(REGEX.ACCOUNT_NUM)[0].slice(0, 4);
        let transType = thisSection.match(REGEX.TRANS_TYPE)[0].replace('Large ', '');
        let dollarAmount = thisSection.match(REGEX.AMOUNT)[0].replace('$', '');
        if (REGEX.EXPENSE.test(transType)) {
          dollarAmount = ('-' + dollarAmount);
        }
        let transDescription = thisSection.match(REGEX.DESCRIPTION)[0].slice(1).slice(0, -1);
        let valuesfromTransaction = [receivedTime, accountNum, transType, dollarAmount, transDescription];
        valuesFromAllMessageTransactions.push(valuesfromTransaction);
        if (REGEX.PENDING.test(transType) === false) {
          let valuesMinusReceivedTime = valuesfromTransaction.slice(1);
          newCompletedMessageTransactions.push(valuesMinusReceivedTime);
        }
      } else if (!REGEX.OTHER_CONTENT.test(thisSection)) {
        ERROR_OCCURRED = true;
        console.error('Error: Unexpected non-matching content');
        ERROR_EMAIL_MESSAGES.push('Unexpected non-transaction content was found.');
      }
    } catch (error) {
      ERROR_OCCURRED = true;
      console.error('Error:', error.message);
      console.error(error.stack);
      ERROR_EMAIL_MESSAGES.push('An error occured while using regex to scrape transaction values.');
    }
  });
  let messageTransactionValues = {
    allNew: valuesFromAllMessageTransactions,
    newCompleted: newCompletedMessageTransactions
  };
  return messageTransactionValues;
}

function writeToTransactionsSheet(transactionValuesToWrite) {
  TRANSACTIONS_SHEET.insertRowBefore(2);
  TRANSACTIONS_SHEET.getRange(2, 1, 1, 5).setValues([transactionValuesToWrite]);
}

function reviewPendingTransactionsFromSheet(newCompletedTransactions) {
  if (newCompletedTransactions.length > 0) {
    const allRowsFromTransactionSheet = TRANSACTIONS_SHEET.getDataRange().getValues();
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
    if (REGEX.PENDING.test(thisTransactionFromSheet)) {
      let rowNumber = (index + 1);
      let accountNum = thisTransactionFromSheet[1].toString();
      let transType = thisTransactionFromSheet[2];
      let dollarAmount = thisTransactionFromSheet[3].toString();
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
        TRANSACTIONS_SHEET.deleteRow(thisPendingTransaction[0]);
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
  UNPROCESSED_ALERTS.forEach(thisThread => {
    thisThread.addLabel(POST_PROCESS_LABEL);
    thisThread.removeLabel(PRE_PROCESS_LABEL);
  });
  Logger.log('Email labels updated');
}

function labelReset() {
  // for use during testing and development
  let processedThreads = POST_PROCESS_LABEL.getThreads();
  processedThreads.forEach(removeAllLabels);
  UNPROCESSED_ALERTS.forEach(removeAllLabels);
  function removeAllLabels(thread) {
    let labels = thread.getLabels();
    labels.forEach(removeThisLabel);
    function removeThisLabel(thisLabel) {
      thread.removeLabel(thisLabel);
    }
  }
  Logger.log('Labels reset');
}

function sendErrorAlertEmail() {
  MailApp.sendEmail({
    to: ERROR_ALERT_EMAIL_ADDRESS,
    subject: 'Financial Dashboard Error',
    body: ERROR_EMAIL_MESSAGES.join('\n')
  });
  Logger.log('Error email sent');
}

function testErrorEmail() {
  // for use during testing and development
  try {
    throw new Error("Test error");
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    ERROR_EMAIL_MESSAGES.push('This is a test error email message.');
    sendErrorAlertEmail();
  }
}
