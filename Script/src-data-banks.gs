// this is where most of the regex lives.  more banks can be added.  bank email templates for testing live here instead of in the test files

function initBanksData() {
  initBanks();
  initFinancialUpdateTypes();
}

function initBanks() {
  BANKS = {};
  setBanks();
  setTestEmails();
  Object.freeze(BANKS);
}

function setBanks() {
  BANKS.BECU = {
    NAME: {
      LONG: "BECU",
      SHORT: "BECU",
    },
    SENDERS: {
      DIRECT: ["noreply@becualerts.org"],
      FORWARDED: [
        "From: BECU Notifications <noreply@becualerts.org>",
        "From: BECU <noreply@becualerts.org>",
      ],
    },
    FINANCIAL_UPDATE_MESSAGE_FORMATS: {
      TRANSACTION_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          EXPENSE: {
            REGEX: /Large Expense/,
            TEST_MESSAGES: {},
          },
          DEPOSIT: {
            REGEX: /Large Deposit/,
            TEST_MESSAGES: {},
          },
          PENDING_EXPENSE: {
            REGEX: /Large Pending Expense/,
            TEST_MESSAGES: {},
          },
        },
        ACCOUNT_NUM: /\d{4}(?=\s\*)/,
        AMOUNT: /\$(?!0\.00|1\.00)[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=larger than)[\s\S]*(?<=\()(.*)(?=\))/,
        DELIMITER: /(?=Log In To Account)/g,
        EXTRA_SECTION: {
          REGEX: /12770 Gateway Drive/,
          TEST_MESSAGES: {},
        },
      },
    },
    MESSAGES_TO_IGNORE: [/(Low Account Balance)/],
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
    FINANCIAL_UPDATE_MESSAGE_FORMATS: {
      CC_EXPENSE_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          EXPENSE: {
            REGEX: /^(?=.*Credit card transaction exceeds)(?!.*declined).*/s,
            TEST_MESSAGES: {},
          },
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Where:)[\s\r\n]*(\S.*)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      CC_CREDIT_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          DEPOSIT: {
            REGEX: /We've credited your account/,
            TEST_MESSAGES: {},
          },
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /[\n\r](.*?)ending in/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      CC_PAYMENT_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          DEPOSIT: {
            REGEX: /Payment:/,
            TEST_MESSAGES: {},
          },
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /\.\d{2}[\s\S]*To:([\s\S]*?)ending in/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      BALANCE_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          BALANCE: {
            REGEX: /Balance:/,
            TEST_MESSAGES: {},
          },
        },
        ACCOUNT_NUM: /(\d{4})\D*(?=[\r\n]+Date:)/,
        AMOUNT: /(?!\$0\.00)\$\s*([\d,]*\.\d\d)/,
        DESCRIPTION: /Account:([\s\S]*?)-/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
    },
    MESSAGES_TO_IGNORE: [/Your statement is available/i, /declined/],
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
    FINANCIAL_UPDATE_MESSAGE_FORMATS: {
      TEST_MESSAGE_FORMAT: {
        FINANCIAL_UPDATE_TYPES: {
          BALANCE: {
            REGEX: /Expense:/,
            TEST_MESSAGES: {
              DIRECT_MESSAGE: `TEST DIRECT MESSAGE`,
              FORWARDED_MESSAGE: `TEST FORWARDED MESSAGE`,
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
}

function setTestEmails() {
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_expense_directTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_expense_forwardedTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_deposit_directTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_deposit_forwardedTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_pendingExpense_directTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_pendingExpense_forwardedTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.EXTRA_SECTION.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_extraSection_directTestEmail);
  BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.EXTRA_SECTION.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(becu_transactionMessageFormat_extraSection_forwardedTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_EXPENSE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(bofa_ccExpenseMessageFormat_expense_directTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_EXPENSE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(bofa_ccExpenseMessageFormat_expense_forwardedTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_CREDIT_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(bofa_ccCreditMessageFormat_deposit_directTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_CREDIT_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(bofa_ccCreditMessageFormat_deposit_forwardedTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_PAYMENT_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(bofa_ccPaymentMessageFormat_deposit_directTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_PAYMENT_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.DEPOSIT.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(bofa_ccPaymentMessageFormat_deposit_forwardedTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.BALANCE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.BALANCE.TEST_MESSAGES.DIRECT_MESSAGE =
    trimOrNull(bofa_balanceMessageFormat_balance_directTestEmail);
  BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.BALANCE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.BALANCE.TEST_MESSAGES.FORWARDED_MESSAGE =
    trimOrNull(bofa_balanceMessageFormat_balance_forwardedTestEmail);
}

function initFinancialUpdateTypes() {
  FINANCIAL_UPDATE_TYPES = {
    EXPENSE: "Expense",
    DEPOSIT: "Deposit",
    PENDING_EXPENSE: "Pending Expense",
    PENDING_DEPOSIT: "Pending Deposit",
    BALANCE: "Balance",
  };
  Object.freeze(FINANCIAL_UPDATE_TYPES);
}

const becu_transactionMessageFormat_expense_directTestEmail = `
[BECU]
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

© 2024 All rights reserved
`;
const becu_transactionMessageFormat_expense_forwardedTestEmail = `
________________________________
From: BECU Notifications <noreply@becualerts.org>
Sent: Monday, April 8, 2024 9:30:03 AM (UTC-08:00) Pacific Time (US & Canada)
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

© 2024 All rights reserved
`;

const becu_transactionMessageFormat_deposit_directTestEmail = `
[BECU]
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

© 2024 All rights reserved
`;
const becu_transactionMessageFormat_deposit_forwardedTestEmail = `
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

© 2024 All rights reserved
`;

const becu_transactionMessageFormat_pendingExpense_directTestEmail = `
[BECU]
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

© 2024 All rights reserved
`;
const becu_transactionMessageFormat_pendingExpense_forwardedTestEmail = `
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

© 2024 All rights reserved
`;

const becu_transactionMessageFormat_extraSection_directTestEmail = null;
const becu_transactionMessageFormat_extraSection_forwardedTestEmail = `
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

© 2024 All rights reserved
`;

const bofa_ccExpenseMessageFormat_expense_directTestEmail = `
[Bank of America.]
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
© 2024 Bank of America Corporation
`;
const bofa_ccExpenseMessageFormat_expense_forwardedTestEmail = `
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
© 2024 Bank of America Corporation
`;

const bofa_ccCreditMessageFormat_deposit_directTestEmail = null;
const bofa_ccCreditMessageFormat_deposit_forwardedTestEmail = `
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
© 2024 Bank of America Corporation
`;

const bofa_ccPaymentMessageFormat_deposit_directTestEmail = null;
const bofa_ccPaymentMessageFormat_deposit_forwardedTestEmail = `
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
© 2024 Bank of America Corporation
`;

const bofa_balanceMessageFormat_balance_directTestEmail = null;
const bofa_balanceMessageFormat_balance_forwardedTestEmail = `
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
`;
