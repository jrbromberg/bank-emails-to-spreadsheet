// enter updates manually from spreadsheet

function enterManualEntries() {
  initRuntimeConfig("production");
  let manualEntries =
    STATIC_CONFIG.MANUAL_UPDATE_SHEET.getRange("A2:E10").getValues();
  const filteredManualEntries = filterForNonEmptyManualEntries(manualEntries);
  const sortedManualEntries = getSortedManualEntries(filteredManualEntries);
  sortedManualEntries.forEach((manualEntry) => {
    const financialUpdate = getManualEntryValues(manualEntry);
    writeToTransactionsSheet(financialUpdate);
  });
  const previousEntriesToDelete = sortEntriesForDelete(
    getPreviousEntriesToDelete(filteredManualEntries)
  );
  previousEntriesToDelete.forEach((entryToDelete) => {
    GLOBAL_CONST.WRITE_SHEET.deleteRow(entryToDelete.row);
    Logger.log("deleted previous entry:");
    Logger.log(entryToDelete);
  });
  clearManualEntryCells();
}

function filterForNonEmptyManualEntries(manualEntries) {
  let filteredManualEntries = [];
  manualEntries.forEach((manualEntry) => {
    const hasEmptyCell = manualEntry.some(
      (value) => value === "" || value === null
    );
    if (!hasEmptyCell) {
      filteredManualEntries.push(manualEntry);
    }
  });
  return filteredManualEntries;
}

function getSortedManualEntries(filteredManualEntries) {
  return filteredManualEntries.sort((a, b) => {
    return a[3] === "Balance" ? -1 : b[3] === "Balance" ? 1 : 0;
  });
}

function getManualEntryValues(rowValues) {
  const receivedTime = new Date();
  const bankName = rowValues[1];
  const accountNum = rowValues[0];
  const type = rowValues[3];
  const amount = rowValues[4];
  const description = rowValues[2] + " Manual Entry";
  return [receivedTime, bankName, accountNum, type, amount, description];
}

function getPreviousEntriesToDelete(manualEntries) {
  let accountsFromBalanceUpdates = [];
  let previousEntriesToDelete = [];
  const manualEntriesCount = manualEntries.length;
  const sheet = GLOBAL_CONST.WRITE_SHEET;
  const previousEntriesFromUpdatesSheet = sheet
    .getRange(
      2 + manualEntriesCount,
      1,
      sheet.getLastRow() - (1 + manualEntriesCount),
      7
    )
    .getValues();
  manualEntries.forEach((manualEntry) => {
    if (manualEntry[3] === "Balance") {
      accountsFromBalanceUpdates.push(String(manualEntry[0]));
    }
  });
  const uniqueAccountsFromBalanceUpdates = [
    ...new Set(accountsFromBalanceUpdates),
  ];
  previousEntriesFromUpdatesSheet.forEach((rowValues, index) => {
    const rowNumber = index + 2 + manualEntriesCount;
    const valuesFromUpdateEntry = getTransactionValues(rowNumber, rowValues);
    if (
      uniqueAccountsFromBalanceUpdates.includes(
        String(valuesFromUpdateEntry.values[2])
      )
    ) {
      previousEntriesToDelete.push(valuesFromUpdateEntry);
    }
  });
  return previousEntriesToDelete;
}

function clearManualEntryCells() {
  const entryRanges = ["A2:A10", "D2:D10", "E2:E10"];
  entryRanges.forEach(function (range) {
    STATIC_CONFIG.MANUAL_UPDATE_SHEET.getRange(range).clearContent();
  });
}
