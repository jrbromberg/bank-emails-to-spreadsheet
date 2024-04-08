// Sections:
// > Bank Regex
// > Buttons
// > Config
// > Main
// > Pending Transactions
// > Test

// *****************************************************************************************************************************
// BANK REGEX CODE
// *****************************************************************************************************************************

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
          EXPENSE: {
            REGEX: /Large Expense/,
            TEST_MESSAGES: {
              // prettier-ignore
              DIRECT_EMAIL: `[BECU]
[Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * Account Name account.

(<description>)

$<amount>

Log In To Account<https://mandrillapp.com/...>

Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.

Learn More<https://mandrillapp.com/...> [https://analytics.moneydesktop.com/...]

You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
              // prettier-ignore
              FORWARDED_EMAIL: `

From: BECU Notifications <noreply@becualerts.org>
Date: Tuesday, February 13, 2024 at 7:02 AM
To: Your Name <youremail@domain.com>
Subject: You have incurred 3 large expenses.
[Image removed by sender. BECU]

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * My Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>


Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.
Learn More<https://mandrillapp.com/...> [Image removed by sender.]


You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
            },
          },
          DEPOSIT: {
            REGEX: /Large Deposit/,
            TEST_MESSAGES: {
              // prettier-ignore
              DIRECT_EMAIL: `[BECU]
[Large Account Deposit]

Large Deposit

An amount larger than $0.00 was deposited into your 1111 * Account Name account on 3.2.2024.

(<description>)

$<amount>

Log In To Account<https://mandrillapp.com/...>

Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.

Learn More<https://mandrillapp.com/...> [https://analytics.moneydesktop.com/...]

You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
              // prettier-ignore
              FORWARDED_EMAIL: `

From: BECU Notifications <noreply@becualerts.org>
Date: Thursday, March 21, 2024 at 8:00 AM
To: Your Name <youremail@domain.com>
Subject: You have received 1 large account deposit.
[Image removed by sender. BECU]

[Image removed by sender. Large Account Deposit]

Large Deposit

An amount larger than $0.00 was deposited into your 1111 * Account Name account on 3.21.2024.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>


Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.
Learn More<https://mandrillapp.com/...> [Image removed by sender.]


You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
            },
          },
          PENDING_EXPENSE: {
            REGEX: /Large Pending Expense/,
            TEST_MESSAGES: {
              // prettier-ignore
              DIRECT_EMAIL: `[BECU]
[Large Pending Expense]

Large Pending Expense

There is a pending transaction in your 1111 * Account Name account with an amount larger than $0.00.

(<description>)

$<amount>

Log In To Account<https://mandrillapp.com/...>

Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.

Learn More<https://mandrillapp.com/...> [https://analytics.moneydesktop.com/...]

You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
              // prettier-ignore
              FORWARDED_EMAIL: `

From: BECU Notifications <noreply@becualerts.org>
Date: Thursday, January 25, 2024 at 5:40 PM
To: Your Name <youremail@domain.com>
Subject: You have incurred 1 large expense.
[Image removed by sender. BECU]

[Image removed by sender. Large Pending Expense]

Large Pending Expense

There is a pending transaction in your 1111 * Account Name account with an amount larger than $0.00.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>


Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.
Learn More<https://mandrillapp.com/...> [Image removed by sender.]


You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

12770 Gateway Drive

© 2024 All rights reserved`,
            },
          },
        },
        ACCOUNT_NUM: /\d{4}(?=\s\*)/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=\().*(?=\))/,
        DELIMITER: /(?=Log In To Account)/g,
        EXTRA_SECTION: {
          REGEX: /12770 Gateway Drive/,
          TEST_MESSAGES: {
            DIRECT_EMAIL: null,
            FORWARDED_EMAIL: `

From: BECU Notifications <noreply@becualerts.org>
Date: Tuesday, February 13, 2024 at 7:02 AM
To: Your Name <youremail@domain.com>
Subject: You have incurred 3 large expenses.
[Image removed by sender. BECU]

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>

[Image removed by sender. Large Expense]

Large Expense

An amount larger than $0.00 was spent from your 1111 * My Account Name account.

(<description>)

$<amount>
Log In To Account<https://mandrillapp.com/...>


Start reducing debt now

Give us 50 minutes or less and we'll help you build a plan that actually works. Schedule your free Financial Health Check today.
Learn More<https://mandrillapp.com/...> [Image removed by sender.]


You're receiving this email because you enabled notifications in BECU.

Manage Settings<https://mandrillapp.com/...> | Unsubscribe<https://mandrillapp.com/...>

BECU

MISSING EXTRA CONTENT REGEX MATCH

© 2024 All rights reserved`,
          },
        },
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
      CC_EXPENSE_FORMAT: {
        HAS_TYPE: {
          EXPENSE: {
            REGEX: /Credit card transaction exceeds/,
            TEST_MESSAGES: {
              // prettier-ignore
              DIRECT_EMAIL: `[Bank of America.]
[https://www.bankofamerica.com/...]
Credit card transaction exceeds alert limit you set
Card Type ending in 2222
Amount:         $<amount>
Date:   March 24, 2024
Where:  <description>
View details<https://www.bankofamerica.com/...>
If you made this purchase or payment but don't recognize the amount, wait until the final purchase amount has posted before filing a dispute claim.
If you don't recognize this activity, please contact us at the number on the back of your card.
Did you know?
You can choose how you get alerts from us including text messages and mobile notifications. Go to Alert Settings<https://www.bankofamerica.com/...>
We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious or you are not the intended recipient of this email, don't click on any links. Instead, forward to abuse@bankofamerica.com then delete it.
Please don't reply to this automatically generated service email.
Privacy Notice<https://www.bankofamerica.com/...>        Equal Housing Lender [https://www.bankofamerica.com/...] <https://www.bankofamerica.com/...>
Bank of America, N.A. Member FDIC
© 2024 Bank of America Corporation`,
              // prettier-ignore
              FORWARDED_EMAIL: `
________________________________
From: Bank of America <onlinebanking@ealerts.bankofamerica.com>
Sent: Tuesday, April 2, 2024 10:45:26 PM (UTC-08:00) Pacific Time (US & Canada)
To: youremail@domain.com <youremail@domain.com>
Subject: Credit card transaction exceeds alert limit you set

[Bank of America.]
[https://www.bankofamerica.com/...]
Credit card transaction exceeds alert limit you set
Card Type ending in 2222
Amount:         $<amount>
Date:   April 03, 2024
Where:  <description>
This may have occurred for a purchase you made online, by phone, mail or when a merchant manually enters your card information.
View details<https://www.bankofamerica.com/...>
If you made this purchase or payment but don't recognize the amount, wait until the final purchase amount has posted before filing a dispute claim.
If you don't recognize this activity, please contact us at the number on the back of your card.
Did you know?
You can choose how you get alerts from us including text messages and mobile notifications. Go to Alert Settings<https://www.bankofamerica.com/...>
We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious or you are not the intended recipient of this email, don't click on any links. Instead, forward to abuse@bankofamerica.com then delete it.
Please don't reply to this automatically generated service email.
Privacy Notice<https://www.bankofamerica.com/....>        Equal Housing Lender [https://www.bankofamerica.com/...] <https://www.bankofamerica.com/...>
Bank of America, N.A. Member FDIC
© 2024 Bank of America Corporation`,
            },
          },
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Where:)[\s\r\n]*(\S.*)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      CC_CREDIT_FORMAT: {
        HAS_TYPE: {
          DEPOSIT: {
            REGEX: /We've credited your account/,
            TEST_MESSAGES: {
              DIRECT_EMAIL: null,
              // prettier-ignore
              FORWARDED_EMAIL: `

From: Bank of America <onlinebanking@ealerts.bankofamerica.com>
Date: Tuesday, March 26, 2024 at 1:21 AM
To: youremail@domain.com <youremail@domain.com>
Subject: We've credited your account
[Image removed by sender. Bank of America.]

[Image removed by sender.]

We've credited your account




<description> ending in 2222
Amount:
$<amount>
Date of credit:
March 26, 2024
Merchant:
<description>
View account activity<https://www.bankofamerica.com/...>

We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious or you are not the intended recipient of this email, don't click on any links. Instead, forward to abuse@bankofamerica.com then delete it.
Please don't reply to this automatically generated service email.
Privacy Notice<https://www.bankofamerica.com/...>
Equal Housing Lender [Image removed by sender.] <https://www.bankofamerica.com/...>
Bank of America, N.A. Member FDIC
© 2024 Bank of America Corporation`,
            },
          },
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /[\n\r](.*?)ending in/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      CC_PAYMENT_FORMAT: {
        HAS_TYPE: {
          DEPOSIT: {
            REGEX: /Payment:/,
            TEST_MESSAGES: {
              DIRECT_EMAIL: null,
              // prettier-ignore
              FORWARDED_EMAIL: `

From: Bank of America <onlinebanking@ealerts.bankofamerica.com>
Date: Wednesday, March 27, 2024 at 2:33 AM
To: youremail@domain.com <youremail@domain.com>
Subject: Confirmation: Thanks for Your Credit Card Payment
[Image removed by sender.]
[Image removed by sender. Bank of America (R)]
Hi, YOUR FIRST NAME, we've received your credit card payment
[Image removed by sender.]
Payment:
$
<amount>
To:
<description> ending in - 2222
Date posted:
March 26, 2024
View account details <https://www.bankofamerica.com/...>
Thank you for being our customer.
We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious or you are not the intended recipient of this email, don't click on any links. Instead, forward to abuse@bankofamerica.com then delete it.
Please don't reply to this automatically generated service email.
Privacy Notice<https://www.bankofamerica.com/....>
Equal Housing Lender [Image removed by sender.] <https://www.bankofamerica.com/....>
Bank of America, N.A. Member FDIC
© 2024 Bank of America Corporation`,
            },
          },
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /\.\d{2}[\s\S]*To:([\s\S]*?)ending in/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      BALANCE_FORMAT: {
        HAS_TYPE: {
          BALANCE: {
            REGEX: /Balance:/,
            TEST_MESSAGES: {
              DIRECT_EMAIL: null,
              // prettier-ignore
              FORWARDED_EMAIL: `
________________________________
From: Bank of America <onlinebanking@ealerts.bankofamerica.com>
Sent: Tuesday, April 2, 2024 3:06:20 AM (UTC-08:00) Pacific Time (US & Canada)
To: youremail@domain.com <youremail@domain.com>
Subject: Your Available Balance

[https://secure.bankofamerica.com/...]
[Bank of America (R)]
[Transfer]      [https://secure.bankofamerica.com/...]          Hi, YOUR FIRST NAME, here's your available balance
[https://secure.bankofamerica.com/...]
Balance:
$       <amount>
Account:        <description> - 2222
Date:   April 02, 2024
View account<https://www.bankofamerica.com/...>
This balance may be different from what displays in Online Banking if you've had subsequent activity on your account since we sent this message.
[Information]
Not yet using the mobile app?
Easily and securely manage your accounts on the go with the Bank of America Mobile app

Download the app now<https://promotions.bankofamerica.com/...>
Easily and securely manage your accounts on the go with the Bank of America Mobile app

Download the app now<https://promotions.bankofamerica.com/...>
We'll never ask for your personal information such as SSN or ATM PIN in email messages. If you get an email that looks suspicious or you are not the intended recipient of this email, don't click on any links. Instead, forward to abuse@bankofamerica.com then delete it.
Please don't reply to this automatically generated service email.
Privacy Notice<https://www.bankofamerica.com/...>        Equal Housing Lender [https://www.bankofamerica.com/...] <https://www.bankofamerica.com/...>
Bank of America, N.A. Member FDIC
© 2024 Bank of America Corporation
`,
            },
          },
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
  BANKS.TEST = {
    NAME: {
      LONG: "Test Bank",
      SHORT: "Test",
    },
    SENDERS: {
      DIRECT: ["test@sender.com"],
      FORWARDED: ["From: Test Bank <test@sender.com>"],
    },
    UPDATES: {
      TEST_FORMAT: {
        HAS_TYPE: {
          BALANCE: {
            REGEX: /Expense:/,
            TEST_MESSAGES: {
              DIRECT_EMAIL: `TEST DIRECT EMAIL`,
              FORWARDED_EMAIL: `TEST FORWARDED EMAIL`,
            },
          },
        },
        ACCOUNT_NUM: /TEST/,
        AMOUNT: /TEST/,
        DESCRIPTION: /TEST/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
    },
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

// this is here to help with adding new bank products to the app
// remember to remove any personal information before adding test strings
function getPlainBodyMessagesForBankSetup() {
  const matchingThreads = GmailApp.search("label:banksetup");
  const threadMessageArrays = GmailApp.getMessagesForThreads(matchingThreads);
  const allMessages = [].concat(...threadMessageArrays);
  allMessages.forEach((thisMessage) => {
    Logger.log(thisMessage.getPlainBody());
  });
}

// *****************************************************************************************************************************
// BUTTONS CODE
// *****************************************************************************************************************************

function buttonRunTheApp() {
  BASIC_CONFIG.TRANS_SHEET.activate();
  checkForNewAlerts("production");
}

// by default, buttonRunTestValues will:
// > create or reset the separate "Test Run" sheet
// > use messages built from test data
function buttonRunTestValues() {
  lockDocumentDuring(() => {
    try {
      setInitialTestData();
      setGlobalValues("test");
      TEST_DATA.SHEET.activate();
      runTestSuite();
      BASIC_CONFIG.SETTINGS_SHEET.getRange("B7").setValue(
        BASIC_CONFIG.LOCAL_RUNTIME
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

// *****************************************************************************************************************************
// CONFIG CODE
// *****************************************************************************************************************************

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
  } else if (!setting === "test") {
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
  GLOBAL_CONST.WRITE_SHEET = BASIC_CONFIG.TRANS_SHEET;
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

// *****************************************************************************************************************************
// MAIN CODE
// *****************************************************************************************************************************

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
      writeToTransactionsSheet(thisUpdate);
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
      } else if (!messageFormat.EXTRA_SECTION.REGEX?.test(thisSection)) {
        addError(new Error("Unrecognized transaction section"));
      }
    });
  } catch (error) {
    addError(error, "Error occured while getting update values");
  }
  return allValuesFromAllUpdatesInThisMessage;
}

function getMessageFormat(messageContent, bank) {
  let messageFormat = Object.values(bank.UPDATES).find((messageFormat) =>
    Object.values(messageFormat.HAS_TYPE).some((updateType) =>
      messageContent.match(updateType.REGEX)
    )
  );
  return messageFormat
    ? messageFormat
    : addError(new Error("Message format not found"));
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
    ([_, type]) => type.REGEX.test(section)
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

function writeToTransactionsSheet(updateValues) {
  GLOBAL_CONST.WRITE_SHEET.insertRowBefore(2);
  GLOBAL_CONST.WRITE_SHEET.getRange(2, 1, 1, updateValues.length).setValues([
    updateValues,
  ]);
}

function updateStars() {
  GmailApp.unstarMessages(GLOBAL_CONST.STARRED_MESSAGES);
  Logger.log("Message stars updated");
}

// *****************************************************************************************************************************
// PENDING TRANSACTIONS CODE
// *****************************************************************************************************************************

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
          rowValues[3]
        )
      ) {
        transactionsForCheck.pending.push(
          getTransactionValues(rowNumber, rowValues)
        );
      } else if (
        !rowValues[6] &&
        !UPDATE_TYPES.BALANCE.includes(rowValues[3])
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
  const sheet = GLOBAL_CONST.WRITE_SHEET;
  const typeColumnValues = sheet
    .getRange("D2:D" + sheet.getLastRow())
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
  pendingValues = pendingValues.slice(0, 3).concat(pendingValues.slice(4));
  completedValues = completedValues
    .slice(0, 3)
    .concat(completedValues.slice(4));
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
    GLOBAL_CONST.WRITE_SHEET.getRange(noteCellRange).setValue(
      completedTransaction.values[6]
    );
  }
  resolvedTransactions.pending.sort((a, b) => b.row - a.row);
  for (const pendingTransaction of resolvedTransactions.pending) {
    GLOBAL_CONST.WRITE_SHEET.deleteRow(pendingTransaction.row);
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

// *****************************************************************************************************************************
// TEST CODE
// *****************************************************************************************************************************

function setInitialTestData() {
  const todaysDate = new Date(new Date().setHours(0, 0, 0, 0));
  TEST_DATA = {
    START_ENTRY_DATETIME: new Date(todaysDate.getTime() - 5 * 86400000),
    RECEIVED_TIME: new Date(todaysDate.getTime() - 1 * 86400000),
    RECIEVED_FIVE_DAYS_LATER: todaysDate,
    ACCOUNT_NUMBERS: {
      BECU: "1111",
      BOFA: "2222",
    },
    AMOUNTS: {
      COMPLETED: [
        "0.01",
        "0.10",
        "1.00",
        "12.30",
        "456.78",
        "1,234.56",
        "1,234,567.89",
      ],
      PENDING_MATCH: {
        ONE: "1,000.00",
        TWO: "1,500.00",
        THREE: "2,000.00",
      },
      PENDING_APPROX_MATCH: "2,505.00",
      PENDING_ALMOST_APPROX_MATCH: "3,033.00",
    },
    DESCRIPTION: {
      PENDING_EXPENSE_MATCH: "PENDING EXPENSE MATCH",
      PENDING_APPROX_MATCH: "APPROXIMATE MATCH",
      PENDING_ALMOST_APPROX_MATCH: "ALMOST APPROXIMATE MATCH",
    },
    STARTER_NOTE: "STARTER ENTRY",
    EXPECTED_RESULTS: [
      ["BofA", "2222", "Expense", "-3,033.00", "ALMOST APPROXIMATE MATCH"],
      ["BofA", "2222", "Expense", "-2,505.00", "APPROXIMATE MATCH"],
      ["BECU", "1111", "Expense", "-2,000.00", "PENDING EXPENSE MATCH"],
      ["BECU", "1111", "Expense", "-1,500.00", "PENDING EXPENSE MATCH"],
      ["BECU", "1111", "Expense", "-1,000.00", "PENDING EXPENSE MATCH"],
      ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
      ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
      ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
      ["BECU", "1111", "Expense", "-20.00", "DIRECT EMAIL"],
      ["BofA", "2222", "Expense", "-1,234,567.89", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-1,234.56", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-456.78", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-12.30", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-1.00", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-0.10", "TEST AMOUNTS"],
      ["BofA", "2222", "Expense", "-0.01", "TEST AMOUNTS"],
      ["BofA", "2222", "Deposit", "10.07", "EACH BANK, EACH TYPE"],
      ["BofA", "2222", "Expense", "-10.06", "EACH BANK, EACH TYPE"],
      ["BofA", "2222", "Deposit", "10.05", "EACH BANK, EACH TYPE"],
      ["BofA", "2222", "Balance", "10.04", "EACH BANK, EACH TYPE"],
      ["BECU", "1111", "Pending Expense", "-10.03", "EACH BANK, EACH TYPE"],
      ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
      ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
      ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
      ["BECU", "1111", "Deposit", "10.01", "EACH BANK, EACH TYPE"],
      [
        "BECU",
        "1111",
        "Pending Expense",
        "-3,000.00",
        "ALMOST APPROXIMATE MATCH",
      ],
      ["BECU", "1111", "Expense", "-5,555.55", "SPACE FILLER"],
      ["BECU", "1111", "Expense", "-5,555.55", "SPACE FILLER"],
      [
        "BECU",
        "1111",
        "Pending Expense",
        "-500.00",
        "PENDING EXPENSE NO MATCH",
      ],
      ["BECU", "1111", "Deposit", "10,000.00", "BALANCE"],
    ],
  };
  createNewTestSheet();
}

function createNewTestSheet() {
  const testRunSheetName = "Test Run";
  const testSheet = BASIC_CONFIG.SPREADSHEET.getSheetByName(testRunSheetName);
  if (testSheet) {
    BASIC_CONFIG.SPREADSHEET.deleteSheet(testSheet);
  }
  TEST_DATA.SHEET = BASIC_CONFIG.SPREADSHEET.insertSheet(
    testRunSheetName,
    BASIC_CONFIG.SPREADSHEET.getSheets().length
  );
  TEST_DATA.SHEET.hideColumns(9, 7);
  TEST_DATA.WHOLE_HEIGHT_RANGE = TEST_DATA.SHEET.getRange("A1:M1000");
  TEST_DATA.WHOLE_HEIGHT_RANGE.setWrapStrategy(
    SpreadsheetApp.WrapStrategy.CLIP
  );
  TEST_DATA.WHOLE_HEIGHT_RANGE.setHorizontalAlignment("right");
  createTransHeadlines();
}

function createTransHeadlines() {
  let transHeadlineValues = [
      "Email time and date",
      "Bank",
      "Account #",
      "Update Type",
      "Amount",
      "Description",
      "System Note",
  ];
  let headlines = [
    {
      range: "A1:G1",
      values: transHeadlineValues,
    },
    {
      range: "I1:M1",
      values: transHeadlineValues.slice(1, transHeadlineValues.length - 1),
    },
  ];
  let transHeadlineColumnWidths = [140, 50, 80, 120, 80, 220, 460];
  TEST_DATA.SHEET.setRowHeight(1, 31);
  headlines.forEach((headlineSection) => {
    let range = TEST_DATA.SHEET.getRange(headlineSection.range);
    range.setValues([headlineSection.values]);
    formatHeadline(range);
  });
  transHeadlineColumnWidths.forEach((width, index) => {
    TEST_DATA.SHEET.setColumnWidth(index + 1, width);
  });
  formatHeadline(
    TEST_DATA.SHEET.getRange("O1")
      .setValue("Equal")
      .setHorizontalAlignment("center")
  );
}

function formatHeadline(range) {
  range
    .setVerticalAlignment("middle")
    .setFontWeight("bold")
    .setBackground("#4c5869")
    .setVerticalAlignment("middle")
    .setFontColor("#FFFFFF");
}

function addStarterValuesToTestsheet() {
  TEST_DATA.STARTER_VALUES = [
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.DEPOSIT,
      "10,000.00",
      "BALANCE",
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-500.00",
      "PENDING EXPENSE NO MATCH",
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.ONE,
      TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.TWO,
      TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.EXPENSE,
      "-5,555.55",
      "SPACE FILLER",
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.THREE,
      TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.EXPENSE,
      "-5,555.55",
      "SPACE FILLER",
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BOFA.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BOFA,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-2,500.00",
      TEST_DATA.DESCRIPTION.PENDING_APPROX_MATCH,
      TEST_DATA.STARTER_NOTE,
    ],
    [
      TEST_DATA.START_ENTRY_DATETIME,
      BANKS.BECU.NAME.SHORT,
      TEST_DATA.ACCOUNT_NUMBERS.BECU,
      UPDATE_TYPES.PENDING_EXPENSE,
      "-3,000.00",
      TEST_DATA.DESCRIPTION.PENDING_ALMOST_APPROX_MATCH,
      TEST_DATA.STARTER_NOTE,
    ],
  ];
  TEST_DATA.STARTER_VALUES.forEach((rowValues) => {
    writeToTransactionsSheet(rowValues);
  });
}

function runTestSuite() {
  checkForNewAlerts("test");
  reconfigureSheetForCompView();
  addExpectedResults();
  checkTestEquality();
}

// only looks at BECU and Bank of America
// becu includes multi update message
function prepMessagesFromTestData() {
  TEST_DATA.BANKS = {
    ONE: BANKS.BECU,
    TWO: BANKS.BOFA,
  };
  let preppedMessages = [
    ...getTestMessageForEachType(),
    ...getTestMessageForEachTestAmount(),
    getOneTestMessageForDirectEmail(),
    getOneTestMessageForNonMatchingExtraSection(),
    getOneTestMessageForNonUpdateMessage(),
    getOneTestMessageForUnknownMessageFormat(),
    getOneTestMessageForMultiplePendingExpenseTypeWithExactMatch(),
    getOneTestMessageForPendingExpenseTypeWithApproximateMatch(),
    getOneTestMessageForPendingExpenseTypeWithAlmostApproximateMatch(),
  ];
  return preppedMessages;
}

function getTestMessageForEachType() {
  let testMessagesForEachtype = [];
  let amount = 10.01;
  Object.entries(TEST_DATA.BANKS)
    .sort()
    .forEach((bank) => {
      Object.entries(bank[1].UPDATES)
        .sort()
        .forEach((updateFormat) => {
          Object.entries(updateFormat[1].HAS_TYPE)
            .sort()
            .forEach((type) => {
              let testContent = populateTestMessageContent(
                type[1].TEST_MESSAGES.FORWARDED_EMAIL,
                amount.toFixed(2),
                "EACH BANK, EACH TYPE"
              );
              testMessagesForEachtype.push(
                getTestMessageObject("forwarded", testContent)
              );
              amount += 0.01;
            });
        });
    });
  return testMessagesForEachtype;
}

function populateTestMessageContent(content, amount, description) {
  return content
    .replace(/<amount>/g, amount)
    .replace(/<description>/g, description);
}

function getTestMessageObject(from, content) {
  return {
    from: from,
    time: TEST_DATA.RECEIVED_TIME,
    content: content,
  };
}

function getTestMessageForEachTestAmount() {
  let testMessagesForEachtype = [];
  const content =
    BANKS.BOFA.UPDATES.CC_EXPENSE_FORMAT.HAS_TYPE.EXPENSE.TEST_MESSAGES
      .FORWARDED_EMAIL;
  TEST_DATA.AMOUNTS.COMPLETED.forEach((amount) => {
    contentWithThisAmount = populateTestMessageContent(
      content,
      amount,
      "TEST AMOUNTS"
    );
    testMessagesForEachtype.push(
      getTestMessageObject("forwarded", contentWithThisAmount)
    );
  });
  return testMessagesForEachtype;
}

function getOneTestMessageForDirectEmail() {
  let content =
    BANKS.BECU.UPDATES.TRANSACTION_FORMAT.HAS_TYPE.EXPENSE.TEST_MESSAGES
      .DIRECT_EMAIL;
  let from = BANKS.BECU.SENDERS.DIRECT[0];
  let testMessage = getTestMessageObject(
    from,
    populateTestMessageContent(content, "20.00", "DIRECT EMAIL")
  );
  return testMessage;
}

function getOneTestMessageForNonMatchingExtraSection() {
  let content =
    BANKS.BECU.UPDATES.TRANSACTION_FORMAT.EXTRA_SECTION.TEST_MESSAGES
      .FORWARDED_EMAIL;
  let testMessage = getTestMessageObject(
    "forwarded",
    populateTestMessageContent(content, "30.00", "NON MATCHING END SECTION")
  );
  return testMessage;
}

function getOneTestMessageForUnknownMessageFormat() {
  return getTestMessageObject(BANKS.BECU.SENDERS.DIRECT[0], "uknown content");
}

function getOneTestMessageForNonUpdateMessage() {
  return getTestMessageObject(
    BANKS.BECU.SENDERS.DIRECT[0],
    "(Low Account Balance)"
  );
}

function getOneTestMessageForMultiplePendingExpenseTypeWithExactMatch() {
  let contentWithThreeExpenses =
    BANKS.BECU.UPDATES.TRANSACTION_FORMAT.HAS_TYPE.EXPENSE.TEST_MESSAGES
      .FORWARDED_EMAIL;
  const pendingMatchAmounts = Object.values(
    TEST_DATA.AMOUNTS.PENDING_MATCH
  ).sort();
  pendingMatchAmounts.forEach((amount) => {
    contentWithThreeExpenses = contentWithThreeExpenses.replace(
      "<amount>",
      amount
    );
  });
  contentWithThreeExpenses = contentWithThreeExpenses.replace(
    /<description>/g,
    TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH
  );
  return getTestMessageObject("forwarded", contentWithThreeExpenses);
}

function getOneTestMessageForPendingExpenseTypeWithApproximateMatch() {
  let content =
    BANKS.BOFA.UPDATES.CC_EXPENSE_FORMAT.HAS_TYPE.EXPENSE.TEST_MESSAGES
      .FORWARDED_EMAIL;
  let testMessage = getTestMessageObject(
    "forwarded",
    populateTestMessageContent(
      content,
      TEST_DATA.AMOUNTS.PENDING_APPROX_MATCH,
      TEST_DATA.DESCRIPTION.PENDING_APPROX_MATCH
    )
  );
  testMessage.time = TEST_DATA.RECIEVED_FIVE_DAYS_LATER;
  return testMessage;
}

function getOneTestMessageForPendingExpenseTypeWithAlmostApproximateMatch() {
  let content =
    BANKS.BOFA.UPDATES.CC_EXPENSE_FORMAT.HAS_TYPE.EXPENSE.TEST_MESSAGES
      .FORWARDED_EMAIL;
  let testMessage = getTestMessageObject(
    "forwarded",
    populateTestMessageContent(
      content,
      TEST_DATA.AMOUNTS.PENDING_ALMOST_APPROX_MATCH,
      TEST_DATA.DESCRIPTION.PENDING_ALMOST_APPROX_MATCH
    )
  );
  testMessage.time = TEST_DATA.RECIEVED_FIVE_DAYS_LATER;
  return testMessage;
}

function reconfigureSheetForCompView() {
  TEST_DATA.WHOLE_HEIGHT_RANGE.setHorizontalAlignment("left");
  for (var col = 1; col <= 15; col++) {
    TEST_DATA.SHEET.setColumnWidth(col, 80);
  }
  TEST_DATA.SHEET.insertRowBefore(1);
  TEST_DATA.SHEET.getRange("A1:Q1").setHorizontalAlignment("center");
  TEST_DATA.SHEET.getRange("A1:G1").merge().setValue("Test Results");
  TEST_DATA.SHEET.getRange("I1:M1").merge().setValue("Expected Results");
  TEST_DATA.SHEET.getRange("O1:O2").merge();
  TEST_DATA.SHEET.showColumns(9, 9);
}

function addExpectedResults() {
  const lastRow = TEST_DATA.SHEET.getLastRow();
  const amountColumns = ["E3:E" + lastRow, "L3:L" + lastRow];
  const resultsLength = TEST_DATA.EXPECTED_RESULTS.length;
  amountColumns.forEach((range) => {
    TEST_DATA.SHEET.getRange(range).setNumberFormat("#,##0.00");
  });
  TEST_DATA.SHEET.getRange(3, 9, resultsLength, 5).setValues(
    TEST_DATA.EXPECTED_RESULTS
  );
}

function checkTestEquality() {
  const lastRow = TEST_DATA.SHEET.getLastRow();
  TEST_DATA.SHEET.getRange("O3")
    .setValue('=join("",B3:F3)=join("",I3:M3)')
    .autoFill(
      TEST_DATA.SHEET.getRange("O3:O" + lastRow),
      SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES
    );
  TEST_DATA.SHEET.getRange("O3:O" + lastRow)
    .getValues()
    .forEach((row, index) => {
      const cell = TEST_DATA.SHEET.getRange("O" + (index + 3));
      cell.setBackground(
        row[0] === true ? "#9cff3d" : row[0] === false ? "#ff0000" : null
      );
    });
}
