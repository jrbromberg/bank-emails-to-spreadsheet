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
const pendingSearchRegex = /Pending/;
const amountRegex = /(?!\$0\.00)\$\d*\.\d\d/;
const descriptionRegex = /\(.*\)/;
const remainingContentRegex = /12770 Gateway Drive/;
var unprocessedAlerts = preProcessLabel.getThreads();
var newCompletedTransactions = [];
var errorOccurred = false;
var errorEmailMessages = [];

function checkForNewAlerts() {
  var newAlertsCount = unprocessedAlerts.length;
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
  var valuesFromAllTransactions = [];
  var allMessages = GmailApp.getMessagesForThreads(unprocessedAlerts);
  allMessages.forEach(getValuesFromMessage);
  function getValuesFromMessage(thisMessage) {
    var content = thisMessage[0].getPlainBody();
    Logger.log('Message:');
    Logger.log(content);
    var receivedTime = thisMessage[0].getDate();
    var transactionsFromMessage = content.split(new RegExp(`(?<=${amountRegex.source})`, "g"));
    transactionsFromMessage.forEach(getValuesFromTransaction);
    function getValuesFromTransaction(thisTransaction) {
      try {
        if (accountNumRegex.test(thisTransaction)) {
          var accountNum = thisTransaction.match(accountNumRegex)[0].slice(0, 4);
          var transType = thisTransaction.match(transactionTypeRegex)[0].replace('Large ', '');
          var dollarAmount = thisTransaction.match(amountRegex)[0].replace('$', '');
          if (/Expense/.test(transType)) {
            dollarAmount = ('-' + dollarAmount);
          }
          var transDescription = thisTransaction.match(descriptionRegex)[0].slice(1).slice(0, -1);
          var valuesfromTransaction = [receivedTime, accountNum, transType, dollarAmount, transDescription];
          valuesFromAllTransactions.push(valuesfromTransaction);
          //if (transType.match('Pending') === false) {
          if (/Pending/.test(transType) === false) {
            var valuesMinusReceivedTime = valuesfromTransaction.slice(1);
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
  }
  Logger.log(valuesFromAllTransactions.length + ' transactions found');
  Logger.log('Transactions:');
  Logger.log(valuesFromAllTransactions);
  return valuesFromAllTransactions.reverse();
}

function writeToTransactionsSheet(transactionValuesToWrite) {
  transactionsSheet.insertRowBefore(2);
  transactionsSheet.getRange(2, 1, 1, 5).setValues([transactionValuesToWrite]);
}

function reviewPendingTransactionsFromSheet() {
  var pendingTransactionResolved = false;
  if (newCompletedTransactions.length > 0) {
    var currentPendingTransactions = [];
    var allRowsFromTransactionSheet = transactionsSheet.getDataRange().getValues();
    allRowsFromTransactionSheet.forEach(checkIfPendingTransaction);
    function checkIfPendingTransaction(thisTransactionFromSheet, index) {
      if (pendingSearchRegex.test(thisTransactionFromSheet)) {
        var rowNumber = (index + 1);
        var accountNum = thisTransactionFromSheet[1].toString();
        var transType = thisTransactionFromSheet[2];
        var dollarAmount = thisTransactionFromSheet[3].toString();
        var transDescription = thisTransactionFromSheet[4];
        currentPendingTransactions.push([rowNumber, [accountNum, transType, dollarAmount, transDescription]]);
      }
    }
    if (currentPendingTransactions.length > 0) {
      newCompletedTransactions.forEach(thisNewCompletedTransaction => {
        for (let i = 0; i < currentPendingTransactions.length; i++) {
          var thisPendingTransaction = currentPendingTransactions[i];
          var pendingTransactionForComp = [...thisPendingTransaction[1]];
          pendingTransactionForComp[1] = pendingTransactionForComp[1].replace('Pending ', '');
          if (JSON.stringify(pendingTransactionForComp) === JSON.stringify(thisNewCompletedTransaction)) {
            Logger.log('Found completed pending transaction:');
            Logger.log(thisPendingTransaction[1]);
            Logger.log(thisNewCompletedTransaction);
            transactionsSheet.deleteRow(thisPendingTransaction[0]);
            currentPendingTransactions.splice(i, 1);
            pendingTransactionResolved = true;
            Logger.log('Entry for pending transaction deleted from sheet');
            break;
          }
        }
      });
    }
  }
  if (pendingTransactionResolved === false) {
    Logger.log('No pending transactions were completed')
  }
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
  var processedThreads = postProcessLabel.getThreads();
  processedThreads.forEach(removeAllLabels);
  unprocessedAlerts.forEach(removeAllLabels);
  function removeAllLabels(thread) {
    var labels = thread.getLabels();
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
