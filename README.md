# Summary

This is a free and safe solution for pulling your bank transactions into a google spreadsheet. Bank login information is not required. This works by scraping emails.

The script is set up to work with the below accounts. To modify the script to work with additional accounts, you should only need to update the BANKS object.
- Bank of America Checking
- Bank of America Credit Card
- BECU Checking

# Features

- Email received datetime, bank, account, update type, amount, and description pulled into Transactions tab for each update
- Balances summed by account in balances tab
- New transactions checked against pending transactions to keep balances accurate
- Emailed error alerts
- Testing suite

# Setup

_NOTE: These instructions utilize the 'Make a copy' option in Google Sheets to simplify the setup. You could also recreate the spreadsheet manually and attach the Code.gs script from this repo._

### 1. Email setup
If your bank emails are sent to a Gmail account, you can use that account. You can also forward your bank emails to a new Gmail account, and use that account. In the Gmail account that you will use to host the spreadsheet:

Create a filter to label incoming bank alerts using the below settings.  If you are forwarding your bank alert emails, include your email in the sender emails.
- `From: [add all sender emails here separated by " OR "]`
- `Do this: Star it`
- `Apply the label: bankupdate`
- `Never send it to Spam`

In the Gmail account that will host the spreadsheet, create a label named `bankupdate`

### 2. Bank alerts
In your bank account, setup notifications so that you receive emails for all transactions. Do the same for balance updates if available.  With transaction alerts, you'll want to set the threshold as low as possible.  For BECU, I was able to get all transactions over $1.00.  For Bank of America, I was able to get all transactions over $0.01.

### 3. Spreadsheet
[This is the spreadsheet.](https://docs.google.com/spreadsheets/d/1LBkVF94ZmOu09n-ugCw50vD-p41wiap2ETIQwf2Epfo)

You can `Make a copy` from the file menu or you can [click this link](https://docs.google.com/spreadsheets/d/1LBkVF94ZmOu09n-ugCw50vD-p41wiap2ETIQwf2Epfo/copy).

### 4. Testing and deployment

In the settings tab, click the `Run test values` button.  After a moment, there will be a popup to authorize the script.  You'll need to go through a series of steps:
- Authorization required: click `OK`
- Choose an account: click your Gmail account
- Google hasn’t verified this app: click `Advanced` then click `Go to Untitled project (unsafe)`
- Sign in to Untitled project: click `Continue`
- Untitled project wants to access your Google Account: click `Allow`

Now that the script is authorized, click the `Run test values` button again. Ensure that the test results match the expected results by checking the far right column.

Once you have some bank alert emails successfully starred and labeled, click the `Run the app` button to ensure updates are being pulled in.

Finally, when you are ready to automate the script, click the `Set timed triggers` button.

_NOTE: If you setup a separate Google account to host your spreadsheet and you want to access the script for troubleshooting or development, you'll need to go directly to https://script.google.com/.  From there, change your Google account to the one hosting the sheet.  Google does not allow script access via the Sheets file menu when the sheet account and default Chrome account don't match._

Enjoy and let me know if I missed anything.
