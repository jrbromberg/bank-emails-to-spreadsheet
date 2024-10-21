// main function checkForNewAlerts can be triggered automatically on a timer or via the google sheet or manually in google apps script

GLOBAL_VAR = {};

initGlobalErrorVariables();
initStaticConfig();

function onOpen() {
  STATIC_CONFIG.SPREADSHEET.setActiveSheet(
    STATIC_CONFIG.SPREADSHEET.getSheetByName("Dash")
  );
}

function checkForNewAlerts(environment) {
  lockDocumentDuring(() => {
    try {
      environment =
        typeof environment !== "string" ? "production" : environment;
      initRuntimeConfig(environment);
      const preppedMessages = getPreppedMessages();
      const newAlertsCount = preppedMessages.length;
      if (newAlertsCount > 0) {
        Logger.log(newAlertsCount + " new alert messages found");
        processMessages(preppedMessages);
      } else {
        Logger.log("No new alerts");
      }
      const lastRunCell =
        environment === "production"
          ? "B6"
          : environment === "test"
          ? "B7"
          : null;
      STATIC_CONFIG.SETTINGS_SHEET.getRange(lastRunCell)?.setValue(
        STATIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "The script was not able to run");
    }
    if (GLOBAL_VAR.ERROR_OCCURRED) {
      sendErrorAlertEmail();
    }
  });
}
