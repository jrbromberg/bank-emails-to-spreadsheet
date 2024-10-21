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
    addError(new Error("Failed to match regex " + regex));
  }
  let matchToReturn = simpleMatch
    ? simpleMatch[simpleMatch.length > 1 ? 1 : 0]
    : undefined;
  matchToReturn =
    typeof matchToReturn === "string" ? matchToReturn.trim() : matchToReturn;
  if (matchToReturn) return matchToReturn;
  addError(new Error("smartMatch failed \nsimpleMatch: " + simpleMatch));
}