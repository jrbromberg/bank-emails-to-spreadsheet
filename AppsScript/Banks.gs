function setBanks() {
  BANKS = {};
  BANKS.BECU = {
    NAME: {
      LONG: "BECU",
      SHORT: "BECU",
    },
    SENDERS: ["noreply@becualerts.org"],
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
        DELIMITER: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        EXTRA_CONTENT: /12770 Gateway Drive/,
      },
    },
    NON_UPDATES: [/(Low Account Balance)/],
  };
  BANKS.BOFA = {
    NAME: {
      LONG: "Bank of America",
      SHORT: "BofA",
    },
    SENDERS: ["onlinebanking@ealerts.bankofamerica.com"],
    UPDATES: {
      TRANSACTION_FORMAT: {
        HAS_TYPE: {
          EXPENSE: /Credit card transaction exceeds/,
        },
        ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
        AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Where:).*(?=[\r\n]+)/,
        DELIMITER: /(?<=Where:).*(?=[\r\n]+)/,
        EXTRA_CONTENT: /12770 Gateway Drive/,
      },
      PAYMENT_FORMAT: {
        HAS_TYPE: {
          DEPOSIT: /Payment:/,
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=To:).*(?=ending in)/,
        DELIMITER: null,
        EXTRA_CONTENT: null,
      },
      BALANCE_FORMAT: {
        HAS_TYPE: {
          BALANCE: /Balance:/,
        },
        ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date:)/,
        AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
        DESCRIPTION: /(?<=Account:).*(?=-)/,
        DELIMITER: null,
        EXTRA_CONTENT: null,
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

function getSectionDelimiter(delimiterRegex) {
  new RegExp(`(?<=${delimiterRegex.source})`, "g");
}
