// reviews pending transactions to see if new transactions should resolve them
// looks for exact match at first then looks for close match for older pending transactions

function runPostUpdatePendingReview() {
  try {
    const transactionsForCheck = getTransactionsForPendingCheck();
    if (transactionsForCheck) {
      Logger.log(transactionsForCheck.pending.length + " pending transactions");
      const resolvedTransactions =
        getResolvedTransactions(transactionsForCheck);
      Logger.log(
        resolvedTransactions.pending.length + " resolved transactions"
      );
      updateResolvedTransactions(resolvedTransactions);
    } else {
      Logger.log("No current pending transactions");
    }
  } catch (error) {
    addError(
      error,
      "Error occurred while checking pending actions after update"
    );
  }
}

function getTransactionsForPendingCheck() {
  let transactionsForCheck = { pending: [], completed: [] };
  const rowsForCheck = getRowsOldestPendingAndUp();
  rowsForCheck &&
    rowsForCheck.forEach((rowValues, index) => {
      let rowNumber = index + 2;
      if (
        [
          FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
          FINANCIAL_UPDATE_TYPES.PENDING_DEPOSIT,
        ].includes(rowValues[3])
      ) {
        transactionsForCheck.pending.push(
          getUpdateEntryValues(rowNumber, rowValues)
        );
      } else if (
        !rowValues[6] &&
        !FINANCIAL_UPDATE_TYPES.BALANCE.includes(rowValues[3])
      ) {
        // depends on no note being present for completed transactions
        // that have not already been used for a pending transaction
        transactionsForCheck.completed.push(
          getUpdateEntryValues(rowNumber, rowValues)
        );
      }
    });
  return transactionsForCheck.pending.length > 0 ? transactionsForCheck : null;
}

function getRowsOldestPendingAndUp() {
  const sheet = GLOBAL_CONST.WRITE_SHEET;
  const typeColumnValues = sheet
    .getRange("D2:D" + sheet.getLastRow())
    .getValues();
  let lastPendingRow = -1;
  typeColumnValues.forEach((type, index) => {
    FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE.includes(type[0]) &&
      (lastPendingRow = index + 2);
  });
  return lastPendingRow !== -1
    ? sheet.getRange(2, 1, lastPendingRow - 1, 7).getValues()
    : null;
}

function getUpdateEntryValues(rowNumber, rowValues) {
  let dateTime = new Date(rowValues[0]);
  let bank = rowValues[1].toString();
  let accountNum = rowValues[2].toString();
  let transType = rowValues[3];
  let dollarAmount = rowValues[4].toFixed(2);
  let transDescription = rowValues[5];
  return {
    row: rowNumber,
    values: [
      dateTime,
      bank,
      accountNum,
      transType,
      dollarAmount,
      transDescription,
    ],
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
        isOlder(pendingTransaction) &&
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
        Logger.log(completedTransaction.values.slice(0, -1));
        Logger.log(pendingTransaction.values);
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
  return valuesForComp.slice(1, 5);
}

function isEqualSansAmount(pendingValues, completedValues) {
  pendingValues = pendingValues.slice(0, 3).concat(pendingValues.slice(4));
  completedValues = completedValues
    .slice(0, 3)
    .concat(completedValues.slice(4));
  return JSON.stringify(pendingValues) === JSON.stringify(completedValues);
}

function isOlder(pendingTransaction) {
  const days = 5;
  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return pendingTransaction.values[0] < daysAgo;
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
  for (const completedTransaction of resolvedTransactions.completed) {
    noteCellRange = "G" + completedTransaction.row;
    GLOBAL_CONST.WRITE_SHEET.getRange(noteCellRange).setValue(
      completedTransaction.values[6]
    );
  }
  resolvedTransactions.pending = sortEntriesForDelete(
    resolvedTransactions.pending
  );
  for (const pendingTransaction of resolvedTransactions.pending) {
    GLOBAL_CONST.WRITE_SHEET.deleteRow(pendingTransaction.row);
  }
}

function runRoutinePendingReview() {
  lockDocumentDuring(() => {
    initRuntimeConfig("production");
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
        to: STATIC_CONFIG.ERROR_ALERT_EMAIL_ADDRESS,
        subject: "Pending transactions over 5 days old",
        body: emailBody,
      });
      Logger.log(emailBody);
      Logger.log("Email sent");
    } else {
      Logger.log("No pending transactions over 5 days old were found");
    }
  });
}

function isOlderThanFiveDays(pendingTransaction) {
  const now = new Date();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  return pendingTransaction.values[0] < fiveDaysAgo;
}
