# Summary

This is a free and safe solution for pulling bank account transactions into a google spreadsheet. Bank login information is not required. This works by scraping emails.

The script is setup to work with the below banks. To modify the script to work with additional banks, you should only need to update the BANKS object.
- Bank of America
- BECU

# Features

- Email received datetime, bank, account, update type, amount, and description pulled into Transactions tab for each update
- Balances summed by account in balances tab
- New transactions checked against pending transactions to keep balances accurate
- Emailed error alerts
- Testing suite

# Setup

_NOTE: The setup is simplified by making a copy of the spreadsheet linked in the instructions. If you prefer, you can also setup the spreadsheet and script manually using the files in this repo._

### 1. Email setup
If your bank emails are sent to a Gmail account, you may use that account. You may also forward the bank emails to a new Gmail account. In the Gmail account that will host the spreadsheet:

Create a filter to label incoming bank alerts using the below settings.  If you are forwarding the bank alert emails, include your email in the sender emails.
- `From: [add all sender emails here separated by " OR "]`
- `Do this: Star it`
- `Apply the label: bankupdate`
- `Never send it to Spam`

In the Gmail account that will host the spreadsheet, create the label `bankupdate`

### 2. Bank alerts
Setup bank alerts to send you an email for all transactions and balance updates if available.  Each bank will be different.  For BECU, I was able to get all transactions over $0.00.  For Bank of America, I was able to get all transactions over $0.01.

### 3. Spreadsheet
This is the spreadsheet (and script) that you will be copying:  
[add the spreadsheet link here]

You can make a copy from the file menu or you can click this link:  
[add the spreadsheet link here]

### 4. Testing and deployment

In the settings tab, click the `Run test values` button.  Ensure that the test results match the expected results by checking the far right column.

Once you have some bank alert emails successfully starred and labeled, click the `Run the app` button to ensure updates are being pulled in.

Finally, when you are ready to automate the script, click the `Set timed triggers` button.

Enjoy and let me know if I missed anything.
