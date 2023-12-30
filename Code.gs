// add your info here
const spreadsheetId = 'PUT YOUR GOOGLE SPREADSHEET ID HERE';
const errorAlertEmailAddress = 'PUT YOUR EMAIL HERE';

// if using with BECU, as of writing, no changes are needed below this line
// setup your email, spreadsheet, and bank account alerts per the readme
const preProcessLabel = GmailApp.getUserLabelByName('BankTransactionUpdate');
const postProcessLabel = GmailApp.getUserLabelByName('TransactionAdded');
const sheetName = 'Transactions';
const transactionsSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
const accountNumRegex = /\d{4} \*/;
const transactionTypeRegex = /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/;
const expenseRegex = /Expense/;
const pendingRegex = /Pending/;
const amountRegex = /(?!\$0\.00)\$[\d,]*\.\d\d/;
const descriptionRegex = /\(.*\)/;
const remainingContentRegex = /12770 Gateway Drive/;
const unprocessedAlerts = preProcessLabel.getThreads();
let valuesFromAllNewTransactions = [];
let newCompletedTransactions = [];
let currentPendingTransactions = [];
let errorEmailMessages = [];
let errorOccurred = false;
let anyPendingTransactionResolved = false;

function checkForNewAlerts() {
  const newAlertsCount = unprocessedAlerts.length;
  if (newAlertsCount > 0) {
    Logger.log(newAlertsCount + ' new alert messages found');
    processBankAlerts();
  } else {
    Logger.log('No new alerts');
  }
}

function processBankAlerts() {
  try {
    fetchTransactionsFromBankEmails().forEach(writeToTransactionsSheet);
    Logger.log('Transactions added to sheet');
    reviewPendingTransactionsFromSheet();
    updateLabels();
  } catch (error) {
    errorOccurred = true;
    console.error('Error:', error.message);
    console.error(error.stack);
    errorEmailMessages.push('An error occured while trying to process one or more bank alerts.');
  }
  if (errorOccurred) {
    sendErrorAlertEmail();
  }
}

function fetchTransactionsFromBankEmails() {
  const allMessages = GmailApp.getMessagesForThreads(unprocessedAlerts);
  for (let i = 0; i < allMessages.length; i++) {
    let thisMessage = allMessages[i];
    let receivedTime = thisMessage[0].getDate();
    let messageContent = thisMessage[0].getPlainBody();
    let transactionsFromMessage = messageContent.split(new RegExp(`(?<=${amountRegex.source})`, "g"));
    Logger.log('Message:');
    Logger.log(messageContent);
    transactionsFromMessage.forEach(getValuesFromTransaction);
    for (let i = 0; i < transactionsFromMessage.length; i++) {
      let thisTransaction = transactionsFromMessage[i];
      getValuesFromTransaction(thisTransaction, receivedTime);
    }
  }
  Logger.log(valuesFromAllNewTransactions.length + ' transactions found');
  Logger.log('Transactions:');
  Logger.log(valuesFromAllNewTransactions);
  return valuesFromAllNewTransactions.reverse();
}

function getValuesFromTransaction(thisTransaction, receivedTime) {
  try {
    if (accountNumRegex.test(thisTransaction)) {
      let accountNum = thisTransaction.match(accountNumRegex)[0].slice(0, 4);
      let transType = thisTransaction.match(transactionTypeRegex)[0].replace('Large ', '');
      let dollarAmount = thisTransaction.match(amountRegex)[0].replace('$', '');
      if (expenseRegex.test(transType)) {
        dollarAmount = ('-' + dollarAmount);
      }
      let transDescription = thisTransaction.match(descriptionRegex)[0].slice(1).slice(0, -1);
      let valuesfromTransaction = [receivedTime, accountNum, transType, dollarAmount, transDescription];
      valuesFromAllNewTransactions.push(valuesfromTransaction);
      if (pendingRegex.test(transType) === false) {
        let valuesMinusReceivedTime = valuesfromTransaction.slice(1);
        newCompletedTransactions.push(valuesMinusReceivedTime);
      }
    } else if (!remainingContentRegex.test(thisTransaction)) {
      errorOccurred = true;
      console.error('Error: Unexpected non-matching content');
      errorEmailMessages.push('Unexpected non-transaction content was found.');
    }
  } catch (error) {
    errorOccurred = true;
    console.error('Error:', error.message);
    console.error(error.stack);
    errorEmailMessages.push('An error occured while using regex to scrape transaction values.');
  }
}

function writeToTransactionsSheet(transactionValuesToWrite) {
  transactionsSheet.insertRowBefore(2);
  transactionsSheet.getRange(2, 1, 1, 5).setValues([transactionValuesToWrite]);
}

function reviewPendingTransactionsFromSheet() {
  if (newCompletedTransactions.length > 0) {
    const allRowsFromTransactionSheet = transactionsSheet.getDataRange().getValues();
    getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet);
    if (currentPendingTransactions.length > 0) {
      compareNewCompletedTransactionsWithCurrentPendingTransactions();
    }
  }
  if (anyPendingTransactionResolved === false) {
    Logger.log('No pending transactions were completed')
  }
}

function getCurrentPendingTransactionsFromSheet(allRowsFromTransactionSheet) {
  allRowsFromTransactionSheet.forEach((thisTransactionFromSheet, index) => {
    if (pendingRegex.test(thisTransactionFromSheet)) {
      let rowNumber = (index + 1);
      let accountNum = thisTransactionFromSheet[1].toString();
      let transType = thisTransactionFromSheet[2];
      let dollarAmount = thisTransactionFromSheet[3].toString();
      let transDescription = thisTransactionFromSheet[4];
      currentPendingTransactions.push([rowNumber, [accountNum, transType, dollarAmount, transDescription]]);
    }
  });
}

function compareNewCompletedTransactionsWithCurrentPendingTransactions() {
  newCompletedTransactions.forEach(thisNewCompletedTransaction => {
    for (let i = 0; i < currentPendingTransactions.length; i++) {
      let thisPendingTransaction = currentPendingTransactions[i];
      let pendingTransactionForComp = [...thisPendingTransaction[1]];
      pendingTransactionForComp[1] = pendingTransactionForComp[1].replace('Pending ', '');
      if (JSON.stringify(pendingTransactionForComp) === JSON.stringify(thisNewCompletedTransaction)) {
        Logger.log('Found completed pending transaction:');
        Logger.log(thisPendingTransaction[1]);
        Logger.log(thisNewCompletedTransaction);
        transactionsSheet.deleteRow(thisPendingTransaction[0]);
        currentPendingTransactions.splice(i, 1);
        i--;
        anyPendingTransactionResolved = true;
        Logger.log('Entry for pending transaction deleted from sheet');
        break;
      }
    }
  });
}

function updateLabels() {
  unprocessedAlerts.forEach(thisThread => {
    thisThread.addLabel(postProcessLabel);
    thisThread.removeLabel(preProcessLabel);
  });
  Logger.log('Email labels updated');
}

function labelReset() {
  // for use during testing and development
  let processedThreads = postProcessLabel.getThreads();
  processedThreads.forEach(removeAllLabels);
  unprocessedAlerts.forEach(removeAllLabels);
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
    to: errorAlertEmailAddress,
    subject: 'Financial Dashboard Error',
    body: errorEmailMessages.join('\n')
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
    errorEmailMessages.push('This is a test error email message.');
    sendErrorAlertEmail();
  }
}
