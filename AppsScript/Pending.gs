function runPostUpdatePendingReview() {
  const transactionsForCheck = getTransactionsForPendingCheck();
  if (transactionsForCheck) {
    const resolvedTransactions = getResolvedTransactions(transactionsForCheck);
    updateResolvedTransactions(resolvedTransactions);
  } else {
    Logger.log("No current pending transactions");
  }
}

function getTransactionsForPendingCheck() {
  let transactionsForCheck = { pending: [], completed: [] };
  const rowsForCheck = getRowsOldestPendingAndUp();
  rowsForCheck &&
    rowsForCheck.forEach((rowValues, index) => {
      let rowNumber = index + 2;
      if (UPDATE_TYPES.PENDING_EXPENSE.includes(rowValues[2])) {
        transactionsForCheck.pending.push(
          getTransactionValues(rowNumber, rowValues)
        );
      } else if (!rowValues[5]) {
        // make sure this isn't a balance later
        transactionsForCheck.completed.push(
          getTransactionValues(rowNumber, rowValues)
        );
      }
    });
  return transactionsForCheck.pending.length > 0 ? transactionsForCheck : null;
}

function getRowsOldestPendingAndUp() {
  const sheet = GLOBAL_CONST.TRANSACTIONS_SHEET;
  const typeColumnValues = sheet
    .getRange("C2:C" + sheet.getLastRow())
    .getValues();
  let lastPendingRow = -1;
  typeColumnValues.forEach((type, index) => {
    UPDATE_TYPES.PENDING_EXPENSE.includes(type[0]) && (lastPendingRow = index + 2);
  });
  return lastPendingRow !== -1
    ? sheet.getRange(2, 1, lastPendingRow - 1, 6).getValues()
    : null;
}

function getTransactionValues(rowNumber, rowValues) {
  let dateTime = new Date(rowValues[0]);
  let bank = rowValues[1].toString();
  let accountNum = rowValues[2].toString();
  let transType = rowValues[3];
  let dollarAmount = rowValues[4].toFixed(2);
  let transDescription = rowValues[5];
  return {
    row: rowNumber,
    values: [dateTime, bank, accountNum, transType, dollarAmount, transDescription],
  };
}

function getResolvedTransactions(transactionsForCheck) {
  const resolvedTransactions = { pending: [], completed: [] };
  for (const pendingTransaction of transactionsForCheck.pending) {
    let matchedCompletedIndeces = [];
    let pendingTransactionCompValues = getCompValues(pendingTransaction);
    for (const [
      completedIndex,
      completedTransaction,
    ] of transactionsForCheck.completed.entries()) {
      let completedTransactionCompValues = getCompValues(completedTransaction);
      if (
        JSON.stringify(pendingTransactionCompValues) ===
        JSON.stringify(completedTransactionCompValues)
      ) {
        addToResolved("Exact Match");
        break;
      } else if (
        isEqualSansAmount(
          pendingTransactionCompValues,
          completedTransactionCompValues
        ) &&
        isOlderThanThreeDays(pendingTransaction) &&
        isApproxMatch(pendingTransaction, completedTransaction)
      ) {
        addToResolved("Approximate Match");
        break;
      }
      function addToResolved(matchType) {
        resolvedTransactions.pending.push({ ...pendingTransaction });
        let completedTransactionPlusNote = getCompletedMatchWithNote(
          pendingTransaction,
          completedTransaction,
          matchType
        );
        resolvedTransactions.completed.push({
          ...completedTransactionPlusNote,
        });
        matchedCompletedIndeces.push(completedIndex);
        Logger.log(
          "Completed transaction is " + matchType + " for pending transaction"
        );
        Logger.log(completedTransaction);
        Logger.log(pendingTransaction);
      }
    }
    matchedCompletedIndeces.forEach((index) => {
      transactionsForCheck.completed.splice(index, 1);
    });
  }
  return resolvedTransactions;
}

function getCompValues(transactionForComp) {
  let valuesForComp = [...transactionForComp.values];
  valuesForComp[3] = valuesForComp[3].replace("Pending ", "");
  return valuesForComp.slice(1, 6);
}

function isEqualSansAmount(pendingValues, completedValues) {
  pendingValues = pendingValues.slice(0, 3).concat(pendingValues.slice(4));
  completedValues = completedValues
    .slice(0, 3)
    .concat(completedValues.slice(4));
  return JSON.stringify(pendingValues) === JSON.stringify(completedValues);
}

function isOlderThanThreeDays(pendingTransaction) {
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  return pendingTransaction.values[0] < threeDaysAgo;
}

function isApproxMatch(pendingTransaction, completedTransaction) {
  const permittedPercentDifference = getPermittedPercentDifference(
    pendingTransaction.values[4]
  );
  const actualPercentDifference = getPercentDifference(
    pendingTransaction.values[4],
    completedTransaction.values[4]
  );
  return actualPercentDifference < permittedPercentDifference;
}

function getPermittedPercentDifference(amount) {
  amount = Math.abs(Number(amount));
  const coefficient = 105.56;
  const exponent = 0.373;
  const offset = -4.93;
  let percentage = coefficient / Math.pow(amount, exponent) + offset;
  percentage = Math.min(Math.max(percentage, 1), 100);
  return percentage;
}

function getPercentDifference(pendingAmount, completedAmount) {
  pendingAmount = Math.abs(Number(pendingAmount));
  completedAmount = Math.abs(Number(completedAmount));
  const difference = Math.abs(pendingAmount - completedAmount);
  const average = (pendingAmount + completedAmount) / 2;
  const percentDifference = (difference / average) * 100;
  return percentDifference;
}

function getCompletedMatchWithNote(
  pendingTransaction,
  completedTransaction,
  matchType
) {
  const amount = pendingTransaction.values[4];
  const dateTime = pendingTransaction.values[0];
  const dateTimeFormat = {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  const formattedDatetime = dateTime.toLocaleString("en-US", dateTimeFormat);
  const description = pendingTransaction.values[5];
  completedTransaction.values[6] = [
    matchType,
    amount,
    formattedDatetime,
    description,
  ].join(" ");
  return completedTransaction;
}

function updateResolvedTransactions(resolvedTransactions) {
  // make updates before delations
  // make deletions from bottom up
  for (const completedTransaction of resolvedTransactions.completed) {
    noteCellRange = "G" + completedTransaction.row;
    GLOBAL_CONST.TRANSACTIONS_SHEET.getRange(noteCellRange).setValue(
      completedTransaction.values[6]
    );
  }
  resolvedTransactions.pending.sort((a, b) => b.row - a.row);
  for (const pendingTransaction of resolvedTransactions.pending) {
    GLOBAL_CONST.TRANSACTIONS_SHEET.deleteRow(pendingTransaction.row);
  }
}

function runRoutinePendingReview() {
  setGlobalValues("production");
  runPostUpdatePendingReview();
  let transactionsOlderThanFiveDays = [];
  const pendingTransactions = getTransactionsForPendingCheck().pending;
  for (const pendingTransaction of pendingTransactions) {
    if (isOlderThanFiveDays(pendingTransaction)) {
      emailTransaction = pendingTransaction.values.slice(0, 6).join(",\n");
      transactionsOlderThanFiveDays.push(emailTransaction);
    }
  }
  if (transactionsOlderThanFiveDays.length > 0) {
    transactionsOlderThanFiveDays.unshift(
      "The following pending transactions are over 5 days old:"
    );
    const emailBody = transactionsOlderThanFiveDays.join("\n\n");
    MailApp.sendEmail({
      to: SETTINGS.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS,
      subject: "Pending transactions over 5 days old",
      body: emailBody,
    });
    Logger.log(emailBody);
    Logger.log("Email sent");
  } else {
    Logger.log("No pending transactions over 5 days old were found");
  }
}

function isOlderThanFiveDays(pendingTransaction) {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  return pendingTransaction.values[0] < fiveDaysAgo;
}
