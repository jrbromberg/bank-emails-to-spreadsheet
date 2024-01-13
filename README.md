# What is this?

This is a free and safe solution for pulling bank account transactions into a google spreadsheet that you can customize.

No bank login information required.  This works by scraping emails.

This is made to work with BECU but could be modified to work with any bank that can send email alerts for all transactions.

# Included

- Code for Google Apps Script
- A simple starter spreadsheet to upload to Google Sheets
- Basic setup instructions for whole process

# Features

Script
- Pulls transaction type, account, description, amount, and email received datetime into Transactions tab for each transaction
- Checks new transactions against pending transactions to keep balances accurate
- Includees automated testing, basic error handling, and email alerts

Spreadsheet
- Sums transaction information by account in the Balances tab.


# Setup


_NOTE: My preference was to setup a new Gmail account to host the spreadsheet and script. This felt safer and more organized to me. However, I don't know of any specific safety issues related to using only a single personal Gmail account. Modify setup as needed to use one Gmail account that receives bank alerts directly from the bank and hosts the spreadsheet and script._

### 1. Host Gmail account
Create a new Gmail account.  Use whatever name you like.  I recommend using your personal email as the backup email.

Create new label: `bankupdate`

Create a filter to label incoming bank alerts.  Use these settings:
- `From: noreply@becualerts.org`
- `Do this: Star it`
- `Apply the label: bankupdate`
- `Never send it to Spam`

### 2. Bank alerts
Setup bank alerts to consider anything over zero dollars as a large transaction.  Have bank alerts sent to your personal email.

### 3. Personal email
Setup rule to redirect transaction bank alert emails from your personal email to your new host Gmail account.  Make sure the bank's email address appears as the "from email" in the redirected emails received by the host Gmail.  The method to accomplish this will vary based on your personal email provider.

If personal email provider is Outlook:
1. Setup a Rule to REDIRECT emails from the bank's notification email address.

If personal email provider is Gmail:
1. Add your host Gmail as a forwarding address in the "Forwarding and POP/IMAP" section of settings.  DO NOT proceed to "Forward a copy of incoming mail" in this section. Doing so would forward all emails.
2. Create a filter to forward the incoming bank alerts.  The "Forward it to" option will have been un-greyed by the first step.
- `Forward it to: replace.with.your.host.gmail@gmail.com`
- `Never send it to Spam`

### 4. Spreadsheet
In your new host Gmail account, create a new spreadsheet by importing the `bank_email_scraper_starter_spreadsheet.ods` file found in this repo.  You may name the spreadsheet whatever you like.  Do not change the name of the "Transactions" tab/sheet.

You can share the spreadsheet with a personal Gmail account as view only.  This makes it easy to view without any worry of accidental edits.

If you would like to use the automated testing, duplicate the spreadsheet and name it as you like for testing.

### 5. Google Apps Script
Go to Google Apps Script at https://script.google.com/home.  Make sure you are in the host Gmail account.

Create a new project. Name it whatever you like.

Create four script files with the below names. Replace the content of each file with the content from the files in the AppsScript folder in this repo.
- `Config.gs`
- `Main.gs`
- `Pending.gs`
- `Test.gs`
- `TestData.gs`

Update the code at the top of the `Config.gs` file. Enter your spreadsheet IDs and error email addresses. Google spreadsheet IDs can be found in their URL. I like to have production alert emails sent to my personal email and test alert emails sent to the host email.

### 6. Testing and deployment

Save and deploy.  You will need to allow access and should be prompted to do so.

For automated testing with built-in test data:<br>
Run the `runAllTests` function from the `Test.gs` file. I spot check the test by making sure the transactions sheet was filled up, there are only two pending transactions left in the transaction sheet, and there is only the one intended error (Unexpected content in email) in the log.

For production testing:<br>
Make sure you have some bank alert emails in your host Gmail labeled `bankupdate`. Run the `checkForNewAlerts` function from the `Main.gs` file. Check the log, spreadsheet, and updated email labels to ensure everything is working correctly.

Add a timed trigger for `checkForNewAlerts`.  I went with every five minutes.

Add a timed trigger for `runRoutinePendingReview`.  I went with every Sunday.

Enjoy and let me know if I missed anything.

