// enter your info below in PRODUCTION and TEST
// if using with BECU, as of writing, no changes are needed beyond the config
// setup your email, spreadsheet, and bank account alerts per the readme
const CONFIG = {
    "PRODUCTION": {
        "SPREADSHEET_ID": "PUT GOOGLE SPREADSHEET ID HERE",
        "ERROR_ALERT_EMAIL_ADDRESS": "PUT EMAIL FOR ERROR ALERTS HERE"
    },
    "TEST": {
        "SPREADSHEET_ID": "PUT TEST SPREADSHEET ID HERE",
        "ERROR_ALERT_EMAIL_ADDRESS": "PUT EMAIL FOR TEST ERROR ALERTS HERE"
    },
    "MESSAGE_SOURCE": {
        "EMAIL": "prepMessagesFromEmail",
        "TEST_DATA": "prepMessagesFromTestData"
    }
}
let SPREADSHEET_ID = CONFIG.PRODUCTION.SPREADSHEET_ID;
let ERROR_ALERT_EMAIL_ADDRESS = CONFIG.PRODUCTION.ERROR_ALERT_EMAIL_ADDRESS;
let PREP_MESSAGES_FROM_SOURCE = CONFIG.MESSAGE_SOURCE.EMAIL;