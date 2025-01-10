// for use when setting up bank
function getPlainBodyMessagesForBankSetup() {
  const matchingThreads = GmailApp.search("label:banksetup");
  const threadMessageArrays = GmailApp.getMessagesForThreads(matchingThreads);
  const allMessages = [].concat(...threadMessageArrays);
  allMessages.forEach((thisMessage) => {
    Logger.log(thisMessage.getPlainBody());
  });
}

// i can't remember what this does but it's important for returning the right content from message and formatting it correctly
function smartMatch(stringToSearch, regex) {
  let simpleMatch = stringToSearch.match(regex);
  if (!simpleMatch) {
    addError(
      new Error(
        [
          "Failed to match regex:",
          regex,
          "With string:",
          "---start string---",
          stringToSearch,
          "---end string---",
        ].join("\n")
      )
    );
    return null;
  }
  let matchToReturn = simpleMatch
    ? simpleMatch[simpleMatch.length > 1 ? 1 : 0]
    : undefined;
  matchToReturn =
    typeof matchToReturn === "string" ? matchToReturn.trim() : matchToReturn;
  return matchToReturn
    ? matchToReturn
    : addError(
        new Error(
          [
            "smartMatch failed",
            "working from simpleMatch: " + simpleMatch,
          ].join("\n")
        )
      );
}

// sort entries from bottom up so that deleting entry doesn't affect row number of next in line deletions
function sortEntriesForDelete(entries) {
  return entries.sort((a, b) => b.row - a.row);
}

// insert new row under header row and write values
function writeToUpdatesSheet(financialUpdates) {
  GLOBAL_CONST.WRITE_SHEET.insertRowBefore(2);
  GLOBAL_CONST.WRITE_SHEET.getRange(2, 1, 1, financialUpdates.length).setValues(
    [financialUpdates]
  );
}