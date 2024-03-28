// ACCOUNT_NUM, AMOUNT, AND DESCRIPTION will be used in smartMatch function
//   smartMatch will return first regex subgroup in match if subgroup exists
//   otherwise it will return entire match
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
          EXPENSE: /Large Expense/,
          DEPOSIT: /Large Deposit/,
          PENDING_EXPENSE: /Large Pending Expense/,
        },
        ACCOUNT_NUM: /\d{4}(?=\s\*)/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=\().*(?=\))/,
        DELIMITER: /(?=Log In To Account)/g,
        EXTRA_SECTION: /12770 Gateway Drive/,
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
      TRANSACTION_FORMAT: {
        HAS_TYPE: {
          EXPENSE: /Credit card transaction exceeds/,
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Where:)[\s\r\n]*(\S.*)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      PAYMENT_FORMAT: {
        HAS_TYPE: {
          DEPOSIT: /Payment:/,
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=To:).*(?=ending in)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
      BALANCE_FORMAT: {
        HAS_TYPE: {
          BALANCE: /Balance:/,
        },
        ACCOUNT_NUM: /(\d{4})\D*(?=[\r\n]+Date:)/,
        AMOUNT: /(?!\$0\.00)\$\s*([\d,]*\.\d\d)/,
        DESCRIPTION: /(?<=Account:).*(?=-)/,
        DELIMITER: null,
        EXTRA_SECTION: null,
      },
    },
    NON_UPDATES: [/(Did you know)/, /Your statement is available/],
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
