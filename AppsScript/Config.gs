setSettings();
initGlobalVarAndErrorHandling();

function initGlobalVarAndErrorHandling() {
  GLOBAL_VAR = {};
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES = [];
  GLOBAL_VAR.ERROR_OCCURRED = false;
}

function addError(error, separateEmailMessage) {
  try {
    GLOBAL_VAR.ERROR_OCCURRED = true;
    if (error instanceof Error) {
      GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
        separateEmailMessage ?? error.message
      );
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error("addError was not given an Error object");
      sendErrorAlertEmail();
    }
  } catch (error) {
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
      "Error occured in the addError function"
    );
    console.error(error.message);
    console.error(error.stack);
    sendErrorAlertEmail();
  }
}

function sendErrorAlertEmail() {
  let toValue, subjectValue, bodyValue;
  if (typeof GLOBAL_CONST !== "undefined" && GLOBAL_CONST !== null) {
    toValue = GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS;
    subjectValue = GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT;
    bodyValue = GLOBAL_VAR.ERROR_EMAIL_MESSAGES.join("\n");
  } else {
    toValue = [
      SETTINGS.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS,
      SETTINGS.TEST.ERROR_ALERT_EMAIL_ADDRESS,
    ].join(",");
    subjectValue = "Bank Email Scraper Alert";
    bodyValue = "The script failed early on";
  }
  MailApp.sendEmail({
    to: toValue,
    subject: subjectValue,
    body: bodyValue,
  });
  Logger.log("Error email sent");
}

function setGlobalValues(setting) {
  if (typeof GLOBAL_CONST === "undefined" || GLOBAL_CONST === null) {
    GLOBAL_CONST = {};
    setDefaultGlobalValues();
    if (setting === "production") {
      setProductionGlobalValues();
    } else if (setting === "test") {
      setTestGlobalValues();
    } else {
      addError(new Error("Unexpected setting in setGlobalValues"));
    }
    Object.freeze(GLOBAL_CONST);
  } else {
    addError(new Error("There was an error in setGlobalValues"));
  }
}

function setDefaultGlobalValues() {
  setStarredMessages();
  setBanks();
  setUpdateTypes();
}

function setStarredMessages() {
  let starredMessages = [];
  const matchingThreads = GmailApp.search(
    "label:" + SETTINGS.ALERT_MESSAGE_GMAIL_LABEL + " is:starred"
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

function setProductionGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    SETTINGS.PRODUCTION.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "email";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    SETTINGS.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Financial Dashboard Error";
}

function setTestGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    SETTINGS.TEST.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "test-data";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    SETTINGS.TEST.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Test run";
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
    "Financial Dashboard script was run in test mode"
  );
}

function getTransactionsSheet(spreadsheetID) {
  return SpreadsheetApp.openById(spreadsheetID).getSheetByName(
    SETTINGS.TRANSACTIONS_SHEET_NAME
  );
}
