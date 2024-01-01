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

const POST_PROCESS_LABEL = GmailApp.getUserLabelByName('TransactionAdded');
const PRE_PROCESS_LABEL = GmailApp.getUserLabelByName('BankTransactionUpdate');
const UNPROCESSED_ALERTS = PRE_PROCESS_LABEL.getThreads();
const REGEX = {
    ACCOUNT_NUM: /\d{4} \*/,
    TRANS_TYPE: /(Large Pending Expense|Large Pending Deposit|Large Expense|Large Deposit)/,
    PENDING: /Pending/,
    AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
    EXPENSE: /Expense/,
    DESCRIPTION: /\(.*\)/,
    OTHER_CONTENT: /12770 Gateway Drive/
}

let TRANSACTIONS_SHEET = {}
let MESSAGE_SOURCE = '';
let ERROR_ALERT_EMAIL_ADDRESS = '';
let ERROR_EMAIL_MESSAGES = [];
let ERROR_OCCURRED = false;

setGlobalVariables();

function setGlobalVariables(setting) {
    setting = setting !== undefined ? setting : 'default';
    if (setting === 'default') {
        TRANSACTIONS_SHEET = getTransactionsSheet(CONFIG.PRODUCTION.SPREADSHEET_ID);
        MESSAGE_SOURCE = 'email';
        ERROR_ALERT_EMAIL_ADDRESS = CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
    } else if (setting === 'test') {
        TRANSACTIONS_SHEET = getTransactionsSheet(CONFIG.TEST.SPREADSHEET_ID);
        MESSAGE_SOURCE = 'test-data';
        ERROR_ALERT_EMAIL_ADDRESS = CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS;
        ERROR_EMAIL_MESSAGES.push('Script was run in test mode');
    } else {
        //throw error
    }
}

function getTransactionsSheet(spreadsheetID) {
    return SpreadsheetApp.openById(spreadsheetID).getSheetByName('Transactions');
}