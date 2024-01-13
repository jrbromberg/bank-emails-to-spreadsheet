function setConfig() {
  CONFIG = {
    PRODUCTION: {
      SPREADSHEET_ID: "PUT GOOGLE SPREADSHEET ID HERE",
      ERROR_ALERT_EMAIL_ADDRESS: "PUT EMAIL FOR ERROR ALERTS HERE",
    },
    TEST: {
      SPREADSHEET_ID: "PUT TEST GOOGLE SPREADSHEET ID HERE",
      ERROR_ALERT_EMAIL_ADDRESS: "PUT EMAIL FOR TEST ERROR ALERTS HERE",
    },
  };
  Object.freeze(CONFIG);
}

// enter your spreadsheet and email address info into the above CONFIG object
// if using with BECU, no other changes are needed
// setup your email, spreadsheet, and bank account alerts per the readme

setConfig();
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
      CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS,
      CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS,
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
  GLOBAL_CONST.SEARCH = "label:bankupdate is:starred";
  GLOBAL_CONST.STARRED_MESSAGES = getStarredMessages();
  GLOBAL_CONST.REGEX = {
    ACCOUNT_NUM: /\d{4} \*/,
    TRANS_TYPE:
      /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
    NON_TRANS_TYPE: /(Low Account Balance)/,
    PENDING: /Pending/,
    AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
    EXPENSE: /Expense/,
    DESCRIPTION: /\(.*\)/,
    OTHER_CONTENT: /12770 Gateway Drive/,
  };
}

function getStarredMessages() {
  let starredMessages = [];
  const matchingThreads = GmailApp.search(GLOBAL_CONST.SEARCH);
  const threadMessageArrays = GmailApp.getMessagesForThreads(matchingThreads);
  const allMessages = [].concat(...threadMessageArrays);
  allMessages.forEach((thisMessage) => {
    if (thisMessage.isStarred()) {
      starredMessages.push(thisMessage);
    }
  });
  return starredMessages;
}

function setProductionGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    CONFIG.PRODUCTION.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "email";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Financial Dashboard Error";
}

function setTestGlobalValues() {
  GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(
    CONFIG.TEST.SPREADSHEET_ID
  );
  GLOBAL_CONST.MESSAGE_SOURCE = "test-data";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS =
    CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS;
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Test run";
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
    "Financial Dashboard script was run in test mode"
  );
}

function getTransactionsSheet(spreadsheetID) {
  return SpreadsheetApp.openById(spreadsheetID).getSheetByName("Transactions");
}
