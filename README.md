# Summary

This is a free and safe solution for pulling bank transactions and balances into a Google spreadsheet. Bank login information is not required. This works by scraping your bank alert emails.  Your information is not used or shared outside of your Google account.

The script is set up to work with the below accounts.
- Bank of America Checking
- Bank of America Credit Card
- BECU Checking

# Features

- Details pulled into Transactions tab for each update
- Balances summed by account in Balances tab
- New transactions checked against pending transactions to keep balances accurate
- Emailed error alerts
- Testing suite

# Setup

### 1. Email setup
You can use an existing Gmail account or setup a new account.  The script can process both direct emails and forwarded emails. In the Gmail account that will host the spreadsheet:

Create a label named `bankupdate`

Create a filter to label incoming bank alerts using the below settings.  If you are forwarding your bank alert emails, enter your email in the `From` field.
- `From` = `All sender emails separated by " OR "`
- `Star it`
- `Apply the label` = `bankupdate`
- `Never send it to Spam`

### 2. Bank alerts
In your bank account, setup notifications so that you receive emails for all transactions. Do the same for balance updates if available.  With transaction alerts, you'll want to set the threshold as low as possible.  For BECU, I was able to get all transactions over $1.00.  For Bank of America, I was able to get all transactions over $0.01.

### 3. Spreadsheet
Make a copy of [bank-emails-to-spreadsheet](https://docs.google.com/spreadsheets/d/1LBkVF94ZmOu09n-ugCw50vD-p41wiap2ETIQwf2Epfo) in your host Google account by clicking this [link to copy the spreadsheet](https://docs.google.com/spreadsheets/d/1LBkVF94ZmOu09n-ugCw50vD-p41wiap2ETIQwf2Epfo/copy).  You could also choose `Make a copy` from the file menu in Google Sheets.

Making a copy of the spreadsheet will copy both the spreadsheet and the attached script.

### 4. Testing and deployment

In the settings tab, click the `Run test values` button.  After a moment, there will be a popup to authorize the script.  You'll need to go through a series of steps:
- Authorization required: click `OK`
- Choose an account: click the host Gmail account
- Google hasn’t verified this app: click `Advanced` then click `Go to Untitled project (unsafe)`
- Sign in to Untitled project: click `Continue`
- Untitled project wants to access your Google Account: click `Allow`

Now that the script is authorized, click the `Run test values` button again. Ensure that the test results match the expected results by checking the far right column.

Once you have some bank alert emails successfully starred and labeled, click the `Run the app` button to ensure updates are being pulled in.

Finally, when you are ready to automate the script, click the `Set timed triggers` button.

### 5. Troubleshooting and development

NOTE: The above instructions utilize the `Make a copy` file option in Google Sheets. You could also recreate the spreadsheet manually and attach the Code.gs script from this repo.

If you setup a separate Google account to host your spreadsheet and you want to access the script for troubleshooting or development, you'll need to go directly to https://script.google.com/.  From there, change your Google account to the one hosting the sheet.  Google does not allow script access via the Sheets file menu when the sheet account and default Chrome account don't match.

To rerun an email, assuming it's already labeled with `bankupdate`, star the email manually in Gmail.  Be aware, there is a small bug with Google Apps Script and Gmail stars.  When an email is starred manually via the Gmail UI and then unstarred via the script, the star will remain in Gmail.  The script will still consider the email unstarred even though the star still appears in Gmail.  This should not impact script usability and is only a small nuisance while testing. Just remember to star and unstar manually for testing. Emails that are both starred and unstarred by the script will not appear as starred in Gmail.

I included a `getPlainBodyMessagesForBankSetup` function to help with setting up regex.  If you label an email `banksetup`, this function will log a simplified string of the email that is used by the script for scraping.  Bank and regex information is stored in the `BANKS` object.

Enjoy and let me know if I missed anything.
