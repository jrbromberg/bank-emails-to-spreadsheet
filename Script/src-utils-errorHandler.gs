function initGlobalErrorVariables() {
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
  return null;
}

function sendErrorAlertEmail() {
  let toValue = STATIC_CONFIG.ERROR_ALERT_EMAIL_ADDRESS;
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
