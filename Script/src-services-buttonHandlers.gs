// functions called directly by buttons in google sheet

function buttonRunTheApp() {
  STATIC_CONFIG.TRANS_SHEET.activate();
  checkForNewAlerts("production");
}

function buttonRunTestValues() {
  lockDocumentDuring(() => {
    try {
      setInitialTestData();
      initRuntimeConfig("test");
      TEST_DATA.SHEET.activate();
      runTestSuite();
      STATIC_CONFIG.SETTINGS_SHEET.getRange("B7").setValue(
        STATIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "Failed to run test values");
    }
  });
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
      STATIC_CONFIG.SETTINGS_SHEET.getRange("B8").setValue(
        STATIC_CONFIG.LOCAL_RUNTIME
      );
      STATIC_CONFIG.SETTINGS_SHEET.getRange("B9").setValue("");
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
      STATIC_CONFIG.SETTINGS_SHEET.getRange("B8").setValue("");
      STATIC_CONFIG.SETTINGS_SHEET.getRange("B9").setValue(
        STATIC_CONFIG.LOCAL_RUNTIME
      );
    } catch (error) {
      addError(error, "Failed to delete timed triggers");
    }
  });
}
