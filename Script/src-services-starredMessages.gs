// gets starred and labeled messages from gmail

function fetchStarredMessages() {
  let starredMessages = [];
  const matchingThreads = GmailApp.search(
    "label:" + STATIC_CONFIG.ALERT_MESSAGE_GMAIL_LABEL + " is:starred"
  );
  const threadMessageArrays = GmailApp.getMessagesForThreads(matchingThreads);
  const allMessages = [].concat(...threadMessageArrays);
  allMessages.forEach((thisMessage) => {
    if (thisMessage.isStarred()) {
      starredMessages.push(thisMessage);
    }
  });
  GLOBAL_CONST.STARRED_MESSAGES = starredMessages;
}

function updateStars() {
  GmailApp.unstarMessages(GLOBAL_CONST.STARRED_MESSAGES);
  Logger.log("Message stars updated");
}
