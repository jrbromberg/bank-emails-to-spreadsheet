const CONFIG = {
    "PRODUCTION": {
        "SPREADSHEET_ID": "PUT GOOGLE SPREADSHEET ID HERE",
        "ERROR_ALERT_EMAIL_ADDRESS": "PUT EMAIL FOR ERROR ALERTS HERE"
    },
    "TEST": {
        "SPREADSHEET_ID": "PUT TEST GOOGLE SPREADSHEET ID HERE",
        "ERROR_ALERT_EMAIL_ADDRESS": "PUT EMAIL FOR TEST ERROR ALERTS HERE"
    }
}

// enter your spreadsheet and email address info into the above CONFIG object
// if using with BECU, no other changes are needed
// setup your email, spreadsheet, and bank account alerts per the readme

function setGlobalValues(setting) {
    if ((typeof GLOBAL_CONST === 'undefined' || GLOBAL_CONST === null) &&
        (typeof GLOBAL_VAR === 'undefined' || GLOBAL_VAR === null)
    ) {
        GLOBAL_CONST = {}
        GLOBAL_VAR = {}
        setDefaultGlobalValues();
        if (setting === 'production') {
            setProductionGlobalValues();
        } else if (setting === 'test') {
            setTestGlobalValues();
        } else {
            //throw error
        }
        Object.freeze(GLOBAL_CONST);
    } else {
        // throw error
    }
}

function setDefaultGlobalValues() {
    GLOBAL_CONST.POST_PROCESS_LABEL = GmailApp.getUserLabelByName('TransactionAdded');
    GLOBAL_CONST.PRE_PROCESS_LABEL = GmailApp.getUserLabelByName('BankTransactionUpdate');
    GLOBAL_CONST.UNPROCESSED_ALERTS = GLOBAL_CONST.PRE_PROCESS_LABEL.getThreads();
    GLOBAL_CONST.REGEX = {
        ACCOUNT_NUM: /\d{4} \*/,
        TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
        PENDING: /Pending/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        EXPENSE: /Expense/,
        DESCRIPTION: /\(.*\)/,
        OTHER_CONTENT: /12770 Gateway Drive/
    }
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES = [];
    GLOBAL_VAR.ERROR_OCCURRED = false;
}

function setProductionGlobalValues() {
    GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(CONFIG.PRODUCTION.SPREADSHEET_ID);
    GLOBAL_CONST.MESSAGE_SOURCE = 'email';
    GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS = CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
    GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = 'Financial Dashboard Error';
}

function setTestGlobalValues() {
    GLOBAL_CONST.TRANSACTIONS_SHEET = getTransactionsSheet(CONFIG.TEST.SPREADSHEET_ID);
    GLOBAL_CONST.MESSAGE_SOURCE = 'test-data';
    GLOBAL_CONST.ERROR_ALERT_EMAIL_ADDRESS = CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS;
    GLOBAL_CONST.ERROR_ALERT_EMAIL_SUBJECT = 'Test run';
    GLOBAL_VAR.ERROR_EMAIL_MESSAGES.push('Financial Dashboard script was run in test mode');
}

function getTransactionsSheet(spreadsheetID) {
    return SpreadsheetApp.openById(spreadsheetID).getSheetByName('Transactions');
}