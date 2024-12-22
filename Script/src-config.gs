// config settings are pulled from the spreadsheet.

function initStaticConfig() {
  const defaultErrorAlertEmail = Session.getEffectiveUser().getEmail();
  let spreadsheet,
    settingsSheet,
    updateSheet,
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
    addError(error, "Failed to get Static Config values");
  }
  updateSheet = spreadsheet?.getSheetByName("Updates");
  manualEntrySheet = spreadsheet?.getSheetByName("Manual Entry");
  localDateTime = Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd HH:mm:ss"
  );
  STATIC_CONFIG = {
    SPREADSHEET: spreadsheet,
    SETTINGS_SHEET: settingsSheet,
    UPDATE_SHEET: updateSheet,
    MANUAL_UPDATE_SHEET: manualEntrySheet,
    ERROR_ALERT_EMAIL_ADDRESS:
      errorAlertEmailOverride ||
      spreadsheet?.getOwner().getEmail() ||
      defaultErrorAlertEmail,
    ALERT_MESSAGE_GMAIL_LABEL: alertMessageGmailLabelOverride || "bankupdate",
    LOCAL_RUNTIME: localDateTime,
  };
  Object.freeze(STATIC_CONFIG);
}

function initRuntimeConfig(environment) {
  if (typeof GLOBAL_CONST === "undefined" || GLOBAL_CONST === null) {
    GLOBAL_CONST = {};
    initBanksData();
    if (environment === "production") {
      setProductionGlobalValues();
    } else if (environment === "test") {
      setTestGlobalValues();
    } else {
      addError(new Error("Unexpected environment in initRuntimeConfig"));
    }
    Object.freeze(GLOBAL_CONST);
  } else if (!environment === "test") {
    addError(new Error("There was an error in initRuntimeConfig"));
  }
}

function setProductionGlobalValues() {
  GLOBAL_CONST.MESSAGE_SOURCE = "email";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Financial Dashboard Error";
  GLOBAL_CONST.WRITE_SHEET = STATIC_CONFIG.UPDATE_SHEET;
  fetchStarredMessages();
}

function setTestGlobalValues() {
  GLOBAL_CONST.MESSAGE_SOURCE = "test-data";
  GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = "Test run";
  GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push(
    "Financial Dashboard script was run in test mode"
  );
  GLOBAL_CONST.WRITE_SHEET = TEST_DATA.SHEET;
  addStarterValuesToTestsheet();
}
