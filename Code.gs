// Sections:
// > Bank Regex
// > Buttons
// > Config
// > Main
// > Pending Transactions
// > Test
// > Test Data

// ************************************************************************
// BANK REGEX CODE
// ************************************************************************

// Regarding bank regex:
// ACCOUNT_NUM, AMOUNT, AND DESCRIPTION will be used in smartMatch function
// smartMatch will return first regex subgroup in match if subgroup exists
// otherwise it will return entire match

function setBanks() {
  BANKS = {};
  BANKS.BECU = {
    NAME: {
      LONG: "BECU",
      SHORT: "BECU",
    },
    SENDERS: {
      DIRECT: ["noreply@becualerts.org"],
      FORWARDED: ["From: BECU Notifications <noreply@becualerts.org>"],
    },
    UPDATES: {
      TRANSACTION_FORMAT: {
        HAS_TYPE: {
          EXPENSE: /Large Expense/,
          DEPOSIT: /Large Deposit/,
          PENDING_EXPENSE: /Large Pending Expense/,
        },
        ACCOUNT_NUM: /\d{4}(?=\s\*)/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=\().*(?=\))/,
        DELIMITER: /(?=Log In To Account)/g,
        EXTRA_SECTION: /12770 Gateway Drive/,
      },
    },
    NON_UPDATES: [/(Low Account Balance)/],
  };
  BANKS.BOFA = {
    NAME: {
      LONG: "Bank of America",
      SHORT: "BofA",
    },
    SENDERS: {
      DIRECT: ["onlinebanking@ealerts.bankofamerica.com"],
      FORWARDED: [
        "From: Bank of America <onlinebanking@ealerts.bankofamerica.com>",
      ],
    },
    UPDATES: {
      TRANSACTION_FORMAT: {
        HAS_TYPE: {
          EXPENSE: /Credit card transaction exceeds/,
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Where:)[\s\r\n]*(\S.*)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      PAYMENT_FORMAT: {
        HAS_TYPE: {
          DEPOSIT: /Payment:/,
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /\.\d{2}[\s\S]*To:([\s\S]*?)ending in/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      BALANCE_FORMAT: {
        HAS_TYPE: {
          BALANCE: /Balance:/,
        },
        ACCOUNT_NUM: /(\d{4})\D*(?=[\r\n]+Date:)/,
        AMOUNT: /(?!\$0\.00)\$\s*([\d,]*\.\d\d)/,
        DESCRIPTION: /Account:([\s\S]*?)-/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
    },
    NON_UPDATES: [/(Did you know)/, /Your statement is available/],
  };
  Object.freeze(BANKS);
}

function setUpdateTypes() {
  UPDATE_TYPES = {
    EXPENSE: "Expense",
    DEPOSIT: "Deposit",
    PENDING_EXPENSE: "Pending Expense",
    PENDING_DEPOSIT: "Pending Deposit",
    BALANCE: "Balance",
  };
  Object.freeze(UPDATE_TYPES);
}

// ************************************************************************
// BUTTONS CODE
// ************************************************************************

function buttonRunTheApp() {
  BASIC_CONFIG.TRANS_SHEET.activate();
  checkForNewAlerts("production");
}

function buttonSetTimedTriggers() {
  lockDocumentDuring(() => {
    try {
      ScriptApp.newTrigger("checkForNewAlerts")
        .timeBased()
        .everyMinutes(5)
        .create();
      ScriptApp.newTrigger("runRoutinePendingReview")
        .timeBased()
        .onWeekDay(ScriptApp.WeekDay.SUNDAY)
        .atHour(8)
        .inTimezone(Session.getScriptTimeZone())
        .create();
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B8").setValue(
        BASIC_CONFIG.LOCAL_RUNTIME
      );
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B9").setValue("");
    } catch (error) {
      addError(error, "Failed to set timed triggers");
    }
  });
}

function buttonDeleteTimedTriggers() {
  lockDocumentDuring(() => {
    try {
      ScriptApp.getProjectTriggers().forEach((trigger) => {
        if (trigger.getEventType() === ScriptApp.EventType.CLOCK) {
          ScriptApp.deleteTrigger(trigger);
        }
      });
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B8").setValue("");
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B9").setValue(
        BASIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "Failed to delete timed triggers");
    }
  });
}

// ************************************************************************
// CONFIG CODE
// ************************************************************************

initGlobalVarAndErrorCollecting();
setBasicConfig();

function initGlobalVarAndErrorCollecting() {
  GLOBAL_VAR = {};
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES = [];
  GLOBAL_VAR.ERROR_OCCURRED = false;
}

function setBasicConfig() {
  const defaultErrorAlertEmail = Session.getEffectiveUser().getEmail();
  let spreadsheet,
    settingsSheet,
    transSheet,
    errorAlertEmailOverride,
    alertMessageGmailLabelOverride,
    localDateTime;
  try {
    spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    settingsSheet = spreadsheet.getSheetByName("Settings");
    if (settingsSheet) {
      errorAlertEmailOverride = settingsSheet.getRange("B2").getValue().trim();
      alertMessageGmailLabelOverride = settingsSheet
        .getRange("B3")
        .getValue()
        .trim();
    } else {
      addError(error, "Spreadsheet or Settings sheet not found");
    }
  } catch (error) {
    addError(error, "Failed to get Basic Config values");
  }
  transSheet = spreadsheet?.getSheetByName("Transactions");
  localDateTime = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
  BASIC_CONFIG = {
    SPREADSHEET: spreadsheet,
    SETTINGS_SHEET: settingsSheet,
    TRANS_SHEET: transSheet,
    ERROR_ALERT_EMAIL_ADDRESS:
      errorAlertEmailOverride ||
      spreadsheet?.getOwner().getEmail() ||
      defaultErrorAlertEmail,
    ALERT_MESSAGE_GMAIL_LABEL: alertMessageGmailLabelOverride || "bankupdate",
    LOCAL_RUNTIME: localDateTime,
  };
  Object.freeze(BASIC_CONFIG);
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
  let toValue = BASIC_CONFIG.ERROR_ALERT_EMAIL_ADDRESS;
  let subjectValue =
    GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT || "Bank Email Scraper Alert";
  let bodyValue =
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES.join("\n") || "The script failed early on";
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
    "label:" + BASIC_CONFIG.ALERT_MESSAGE_GMAIL_LABEL + " is:starred"
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
  GLOBAL_CONST.MESSAGE_SOURCE = "email";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Financial Dashboard Error";
}

function setTestGlobalValues() {
  GLOBAL_CONST.MESSAGE_SOURCE = "test-data";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Test run";
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
    "Financial Dashboard script was run in test mode"
  );
}

function lockDocumentDuring(functionToExecute) {
  let lock = LockService.getDocumentLock();
  try {
    if (lock.tryLock(8000)) {
      try {
        functionToExecute();
      } finally {
        lock.releaseLock();
      }
    } else {
      addError(new Error("Could not acquire the lock."));
    }
  } catch (error) {
    addError(error, "Error occured with document lock");
  }
}

// ************************************************************************
// MAIN CODE
// ************************************************************************

function checkForNewAlerts(setting) {
  lockDocumentDuring(() => {
    try {
      setting = typeof setting !== "string" ? "production" : setting;
      setGlobalValues(setting);
      const preppedMessages = getPreppedMessages();
      const newAlertsCount = preppedMessages.length;
      if (newAlertsCount > 0) {
        Logger.log(newAlertsCount + " new alert messages found");
        processMessages(preppedMessages);
      } else {
        Logger.log("No new alerts");
      }
      const lastRunCell =
        setting === "production" ? "B6" : setting === "test" ? "B7" : null;
      BASIC_CONFIG.SETTINGS_SHEET.getRange(lastRunCell)?.setValue(
        BASIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "The script was not able to run");
    }
    if (GLOBAL_VAR.ERROR_OCCURRED) {
      sendErrorAlertEmail();
    }
  });
}

function getPreppedMessages() {
  if (GLOBAL_CONST.MESSAGE_SOURCE === "email") {
    return prepMessagesFromEmail();
  } else if (GLOBAL_CONST.MESSAGE_SOURCE === "test-data") {
    return prepMessagesFromTestData();
  } else {
    addError(new Error("Unexpected message source specified"));
  }
}

function prepMessagesFromEmail() {
  let preppedMessages = [];
  GLOBAL_CONST.STARRED_MESSAGES.forEach((thisMessage) => {
    let fromEmail = thisMessage.getFrom().match(/(?<=\<).*(?=\>)/)[0];
    let receivedTime = thisMessage.getDate();
    let messageContent = thisMessage.getPlainBody();
    let thisMessagePrepped = {
      from: fromEmail,
      time: receivedTime,
      content: messageContent,
    };
    preppedMessages.push(thisMessagePrepped);
  });
  return preppedMessages;
}

function processMessages(preppedMessages) {
  try {
    let updateValues = getUpdatesFromAllMessages(preppedMessages);
    // need to ensure that these are in reverse row order
    // so that rows pending deletion aren't re-ordered (got bottom to top)
    // seems this happen by accident but want to ensure it
    updateValues.forEach((thisUpdate) => {
      writeToTransactionsSheet(thisUpdate, BASIC_CONFIG.TRANS_SHEET);
    });
    Logger.log("Updates added to sheet");
    runPostUpdatePendingReview();
    updateStars();
  } catch (error) {
    addError(error, "Error occursed while processing the email alerts");
  }
}

function getUpdatesFromAllMessages(preppedMessages) {
  let allUpdateValues = [];
  preppedMessages.forEach((thisMessage) => {
    let messageContent = thisMessage.content;
    let bank = getBankData(messageContent, thisMessage.from);
    let receivedTime = thisMessage.time;
    Logger.log("Message:");
    Logger.log(messageContent);
    let messageUpdateValues = getUpdatesFromThisMessage(
      messageContent,
      receivedTime,
      bank
    );
    allUpdateValues.push(...messageUpdateValues);
  });
  Logger.log(allUpdateValues.length + " updates found");
  Logger.log("Updates:");
  Logger.log(allUpdateValues);
  return allUpdateValues;
}

function getBankData(messageContent, sender) {
  let bankValues =
    Object.values(BANKS).find((bank) => bank.SENDERS.DIRECT.includes(sender)) ||
    Object.values(BANKS).find((bank) =>
      bank.SENDERS.FORWARDED.some((forwarded) =>
        messageContent.includes(forwarded)
      )
    );
  return bankValues
    ? bankValues
    : addError(new Error("Email alert origin not recognized"));
}

function getUpdatesFromThisMessage(messageContent, receivedTime, bank) {
  let allValuesFromAllUpdatesInThisMessage = [];
  try {
    messageFormat = getMessageFormat(messageContent, bank);
    let messageSections = messageFormat.DELIMITER
      ? messageContent.split(messageFormat.DELIMITER)
      : [messageContent];
    messageSections.forEach((thisSection) => {
      let updateValuesFromSection = getUpdateValuesFromSection(
        thisSection,
        messageFormat,
        receivedTime,
        bank
      );
      if (updateValuesFromSection) {
        allValuesFromAllUpdatesInThisMessage.push(updateValuesFromSection);
      } else if (!messageFormat.EXTRA_SECTION?.test(thisSection)) {
        addError(new Error("Unrecognized transaction section"));
      }
    });
  } catch (error) {
    addError(error, "Error occured while getting update values");
  }
  return allValuesFromAllUpdatesInThisMessage;
}

function getMessageFormat(messageContent, bank) {
  return Object.values(bank.UPDATES).find((messageFormat) =>
    Object.values(messageFormat.HAS_TYPE).some((updateType) =>
      messageContent.match(updateType)
    )
  );
}

function getUpdateValuesFromSection(
  section,
  messageFormat,
  receivedTime,
  bank
) {
  let updateType = getUpdateTypeName(section, messageFormat);
  if (updateType) {
    let accountNum = smartMatch(section, messageFormat.ACCOUNT_NUM);
    let updateDescription = smartMatch(section, messageFormat.DESCRIPTION);
    let dollarAmount = smartMatch(section, messageFormat.AMOUNT);
    if (
      [UPDATE_TYPES.EXPENSE, UPDATE_TYPES.PENDING_EXPENSE].includes(updateType)
    ) {
      dollarAmount = `-${dollarAmount}`;
    }
    return [
      receivedTime,
      bank.NAME.SHORT,
      accountNum,
      updateType,
      dollarAmount,
      updateDescription,
    ];
  }
  return null;
}

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

function getUpdateTypeName(section, messageFormat) {
  const matchingUpdateType = Object.entries(messageFormat.HAS_TYPE).find(
    ([_, regex]) => regex.test(section)
  );
  if (matchingUpdateType) {
    const [typeKey, _] = matchingUpdateType;
    const matchingName = Object.entries(UPDATE_TYPES).find(
      ([nameKey]) => nameKey === typeKey
    );
    return matchingName ? matchingName[1] : null;
  }
  return null;
}

function writeToTransactionsSheet(updateValues, sheet) {
  sheet.insertRowBefore(2);
  sheet.getRange(2, 1, 1, 6).setValues([updateValues]);
}

function updateStars() {
  GmailApp.unstarMessages(GLOBAL_CONST.STARRED_MESSAGES);
  Logger.log("Message stars updated");
}

// ************************************************************************
// PENDING TRANSACTIONS CODE
// ************************************************************************

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
      if (
        [UPDATE_TYPES.PENDING_EXPENSE, UPDATE_TYPES.PENDING_DEPOSIT].includes(
          rowValues[2]
        )
      ) {
        transactionsForCheck.pending.push(
          getTransactionValues(rowNumber, rowValues)
        );
      } else if (
        !rowValues[6] &&
        !UPDATE_TYPES.BALANCE.includes(rowValues[2])
      ) {
        // depends on no note being present for completed transactions
        // that have not already been used for a pending transaction
        transactionsForCheck.completed.push(
          getTransactionValues(rowNumber, rowValues)
        );
      }
    });
  return transactionsForCheck.pending.length > 0 ? transactionsForCheck : null;
}

function getRowsOldestPendingAndUp() {
  const sheet = BASIC_CONFIG.TRANS_SHEET;
  const typeColumnValues = sheet
    .getRange("D2:C" + sheet.getLastRow())
    .getValues();
  let lastPendingRow = -1;
  typeColumnValues.forEach((type, index) => {
    UPDATE_TYPES.PENDING_EXPENSE.includes(type[0]) &&
      (lastPendingRow = index + 2);
  });
  return lastPendingRow !== -1
    ? sheet.getRange(2, 1, lastPendingRow - 1, 7).getValues()
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
  pendingValues = pendingValues.slice(0, 4).concat(pendingValues.slice(5));
  completedValues = completedValues
    .slice(0, 4)
    .concat(completedValues.slice(5));
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
  // make updates before deletions
  // make deletions from bottom up
  for (const completedTransaction of resolvedTransactions.completed) {
    noteCellRange = "G" + completedTransaction.row;
    BASIC_CONFIG.TRANS_SHEET.getRange(noteCellRange).setValue(
      completedTransaction.values[6]
    );
  }
  resolvedTransactions.pending.sort((a, b) => b.row - a.row);
  for (const pendingTransaction of resolvedTransactions.pending) {
    BASIC_CONFIG.TRANS_SHEET.deleteRow(pendingTransaction.row);
  }
}

function runRoutinePendingReview() {
  lockDocumentDuring(() => {
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
        to: BASIC_CONFIG.ERROR_ALERT_EMAIL_ADDRESS,
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

// ************************************************************************
// TEST CODE
// ************************************************************************

// by default, runAllTests will:
// > reset and use the test spreadsheet
// > use test messages built from the TestData file
// > send error alerts to the test email

function buttonRunTestValues() {
  lockDocumentDuring(() => {
    try {
      let testRunSheet = getNewTestSheet();
      testRunSheet.activate();
      runTestSuite(testRunSheet);
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B7").setValue(
        BASIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "Failed to run test values");
    }
  });
}

function getNewTestSheet() {
  let testRunSheetName = "Test Run";
  let testRunSheet = BASIC_CONFIG.SPREADSHEET.getSheetByName(testRunSheetName);
  if (testRunSheet) {
    BASIC_CONFIG.SPREADSHEET.deleteSheet(testRunSheet);
  }
  testRunSheet = BASIC_CONFIG.SPREADSHEET.insertSheet(testRunSheetName);
  return testRunSheet;
}

function runTestSuite(testSheet) {
  // initial headlines
  let transHeadlineValues = [
    [
      "Email time and date",
      "Bank",
      "Account #",
      "Update Type",
      "Amount",
      "Description",
      "Note",
    ],
  ];
  let transHeadlineRanges = ["A1:G1", "I1:O1"];
  let transHeadlineColumnWidths = [230, 120, 120, 120, 120, 335, 480];
  testSheet.setRowHeight(1, 31);
  transHeadlineRanges.forEach((rangeString) => {
    let range = testSheet.getRange(rangeString);
    range.setValues(transHeadlineValues);
    formatHeadline(range);
    range.setHorizontalAlignment("right");
  });
  transHeadlineColumnWidths.forEach((width, index) => {
    testSheet.setColumnWidth(index + 1, width);
    testSheet.setColumnWidth(index + 9, width);
  });
  formatHeadline(testSheet.getRange("Q1").setValue("Equal"));

  // run the test
  // //

  // shorten and add parent headlines
  testSheet.getRange("A1:O1").setHorizontalAlignment("left");
  for (var col = 1; col <= 17; col++) {
    testSheet.setColumnWidth(col, 60);
  }
  testSheet.insertRowBefore(1);
  testSheet.getRange("A1:Q1").setHorizontalAlignment("center");
  testSheet.getRange("A1:G1").merge().setValue("Test Results");
  testSheet.getRange("I1:O1").merge().setValue("Expected Results");
  testSheet.getRange("Q1:Q2").merge();

  // insert expected values
  // //

  // check equality
  testSheet
    .getRange("Q3")
    .setValue('=join("",A3:G3)=join("",I3:O3)')
    .autoFill(
      testSheet.getRange("Q3:Q10"),
      SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES
    );
}

function formatHeadline(range) {
  range
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("center")
    .setFontWeight("bold")
    .setBackground("#4c5869")
    .setVerticalAlignment("middle")
    .setFontColor("#FFFFFF");
}

// new stuff above

function runAllTests() {
  setTestData();
  resetTestSheet();
  checkForNewAlerts("test");
}

function resetTestSheet() {
  const testSheet = getTransactionsSheet(SETTINGS.TEST.SPREADSHEET_ID);
  testSheet
    .getRange(2, 1, testSheet.getLastRow() - 1, testSheet.getLastColumn())
    .clearContent();
  TEST_DATA.SHEET_START_VALUES.ROWS.forEach((rowValues) => {
    writeToTransactionsSheet(rowValues, testSheet);
  });
}

function prepMessagesFromTestData() {
  let preppedMessages = [
    getTestMessageContentForSingleExpenseAllTestAmounts(),
    getTestMessageContentForAllTransactionTypes(),
    getTestMessageContentForResolvePendingFromPreExisting(),
    getTestMessageContentForResolve3PendingFromPreExisting(),
    getTestMessageContentForResolvePendingFromConcurrent(),
    getTestMessageContentForLowBalanceAlert(),
    getTestMessageContentForUnknownEndContent(),
    getTestMessageContentForResolvePendingFromApproximateMatch(),
    getTestMessageContentForAlmostApproximateMatch(),
  ];
  const receivedTime = new Date();
  preppedMessages.forEach((thisMessage, index) => {
    receivedTimeAndContent = [receivedTime, thisMessage];
    preppedMessages[index] = receivedTimeAndContent;
  });
  return preppedMessages;
}

function getTestMessageContentForSingleExpenseAllTestAmounts() {
  let sections = "";
  Object.entries(TEST_DATA.AMOUNTS).forEach((amount) => {
    let thisSection = replaceSectionValues(amount[1], TEST_DATA.TYPE.EXPENSE);
    sections = sections.concat(thisSection);
  });
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(One Expense, All Amounts)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAllTransactionTypes() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.FOUR_DIGIT,
    TEST_DATA.TYPE.DEPOSIT
  );
  let sections = "".concat(sectionOne, sectionTwo, sectionThree);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(All Transaction Types)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_ONE,
    TEST_DATA.TYPE.EXPENSE
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sectionOne, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolve3PendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_TWO,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_THREE,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_FOUR,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionThree, sectionTwo, sectionOne);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromConcurrent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionOne, sectionTwo);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Resolve Concurrent Pending)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForLowBalanceAlert() {
  return "".concat(
    TEST_DATA.SECTIONS.LOW_BALANCE,
    TEST_DATA.SECTIONS.END_CONTENT
  );
}

function getTestMessageContentForUnknownEndContent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let newAdditionContent = TEST_DATA.SECTIONS.END_CONTENT.replace(
    "12770 Gateway Drive",
    "anything else"
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Unknown End Content)"
  );
  return "".concat(sectionOne, newAdditionContent);
}

function getTestMessageContentForResolvePendingFromApproximateMatch() {
  let section = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_APPROX_MATCH,
    TEST_DATA.TYPE.EXPENSE
  );
  section = section.replace(TEST_DATA.DESCRIPTION_REGEX, "(Approximate Match)");
  return "".concat(section, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAlmostApproximateMatch() {
  let section = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_ALMOST_APPROX_MATCH,
    TEST_DATA.TYPE.EXPENSE
  );
  section = section.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Almost Approximate Match)"
  );
  return "".concat(section, TEST_DATA.SECTIONS.END_CONTENT);
}

function replaceSectionValues(amount, type) {
  let section = TEST_DATA.SECTIONS.TRANSACTION;
  section = section.replace("replace-type-image-alt", type.IMAGE_ALT);
  section = section.replace("replace-type-copy", type.COPY);
  section = section.replace("replace-amount", amount);
  return section;
}

// ************************************************************************
// TEST DATA CODE
// ************************************************************************

function setTestData() {
  const starterEntryDatetime = new Date(2023, 11, 31, 21, 59, 0, 0);
  TEST_DATA = {
    SECTIONS: {
      TRANSACTION:
        "[BECU]\n\nreplace-type-image-alt\n\nreplace-type-copy\n\nAn amount larger than $0.00 was spent from your 1234 * account.\n\n(Description)\n\n$replace-amount\n\nLog In To Account<link>\n\n",
      LOW_BALANCE:
        "[BECU]\n\n[Low Account Balance]\n\nLow Account Balance\n\nYour 1234 * Joint Checking account balance has dropped to:\n\n$666.66\n\nLog In To Account<link>\n\n",
      END_CONTENT:
        "Start reducing debt now\n\nGive us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.\n\nLearn More<link>\n\nYou're receiving this email because you enabled notifications in BECU.\n\nManage Settings<link>\n\nBECU\n\n12770 Gateway Drive\n\n© 2023 All rights reserved",
    },
    AMOUNTS: {
      PENNY: "0.01",
      DIME: "0.10",
      DOLLAR: "1.00",
      TWO_DIGIT: "12.30",
      THREE_DIGIT: "456.78",
      FOUR_DIGIT: "1,234.56",
      SEVEN_DIGIT: "1,234,567.89",
      PENDING_ONE: "500.00",
      PENDING_TWO: "1,000.00",
      PENDING_THREE: "1,500.00",
      PENDING_FOUR: "2,000.00",
      PENDING_APPROX_MATCH: "2,505.00",
      PENDING_ALMOST_APPROX_MATCH: "3,033.00",
    },
    TYPE: {
      EXPENSE: {
        IMAGE_ALT: "[Large Expense]",
        COPY: "Large Expense",
      },
      PENDING_EXPENSE: {
        IMAGE_ALT: "[Large Pending Expense]",
        COPY: "Large Pending Expense",
      },
      DEPOSIT: {
        IMAGE_ALT: "[Large Account Deposit]",
        COPY: "Large Deposit",
      },
    },
    DESCRIPTION_REGEX: /\(Description\)/g,
    SHEET_START_VALUES: {
      ROWS: [
        [starterEntryDatetime, "1234", "Deposit", "10,000.00", "Starter Entry"],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-500.00",
          "Test Pending Exp.",
        ],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-1,000.00",
          "Test Pending Exp.",
        ],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-1,500.00",
          "Test Pending Exp.",
        ],
        [starterEntryDatetime, "1234", "Expense", "-5,555.55", "Space Filler"],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-2,000.00",
          "Test Pending Exp.",
        ],
        [starterEntryDatetime, "1234", "Expense", "-5,555.55", "Space Filler"],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-2,500.00",
          "Approximate Match",
        ],
        [
          starterEntryDatetime,
          "1234",
          "Pending Expense",
          "-3,000.00",
          "Almost Approximate Match",
        ],
      ],
      PENDING_DESCRIPTION: "(Test Pending Exp.)",
    },
  };
  Object.freeze(TEST_DATA);
}
