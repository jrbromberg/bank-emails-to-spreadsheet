// LONG_NAME, SHORT_NAME, and SENDER must be unique
function setBankData() {
  TRANSACTION_NAMES = {
    EXPENSE: "Expense",
    DEPOSIT: "Deposit",
    PENDING_EXPENSE: "Pending Expense",
    PENDING_DEPOSIT: "Pending Deposit",
    PAYMENT: "Payment",
    BALANCE: "Balance",
  };
  Object.freeze(TRANSACTION_NAMES);
  BANKS = {};

  // BANK OF AMERICA
  BANKS.BOFA = {
    LONG_NAME: "Bank of America",
    SHORT_NAME: "BofA",
    SENDER: "onlinebanking@ealerts.bankofamerica.com",
    ACCOUNT_NUM: /(?<=ending\sin\s)\d{4}/,
    TRANS_TYPE: {
      EXPENSE: /Credit card transaction exceeds/,
      PAYMENT: /Payment:/,
    },
    NON_UPDATE: [/(Did you know)/, /Your statement is available/],
    AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
    DESCRIPTION: /(?<=Where:).*(?=[\r\n]+)/,
    OTHER_CONTENT: /12770 Gateway Drive/,
    BALANCE: {
      IS_TYPE: /Balance:/,
      ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date:)/,
      DESCRIPTION: /(?<=Account:).*(?=-)/,
      AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
    },
    PAYMENT: {
      ACCOUNT_NUM: /\d{4}(?=[\r\n]+Date posted:)/,
      DESCRIPTION: /(?<=To:).*(?=ending in)/,
      AMOUNT: /(?!\$0\.00)\$\s*[\d,]*\.\d\d/,
    },
  };
  BANKS.BOFA.SECTION_DELIMITER = getSectionDelimiter(BANKS.BOFA.DESCRIPTION);

  // BECU
  BANKS.BECU = {
    LONG_NAME: "BECU",
    SHORT_NAME: "BECU",
    SENDER: "noreply@becualerts.org",
    ACCOUNT_NUM: /\d{4}(?=\s\*)/,
    TRANS_TYPE: {
      EXPENSE: /Large Expense/,
      DEPOSIT: /Large Deposit/,
      PENDING_EXPENSE: /Large Pending Expense/,
    },
    NON_UPDATE: [/(Low Account Balance)/],
    AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
    DESCRIPTION: /(?<=\().*(?=\))/,
    OTHER_CONTENT: /12770 Gateway Drive/,
  };
  BANKS.BECU.SECTION_DELIMITER = getSectionDelimiter(BANKS.BECU.AMOUNT);

  // TEST BANK (Copied from BECU)
  BANKS.TEST = {
    LONG_NAME: "Test",
    SHORT_NAME: "Test",
    SENDER: "test",
    ACCOUNT_NUM: /\d{4}(?=\s\*)/,
    TRANS_TYPE: {
      EXPENSE: /Large Expense/,
      DEPOSIT: /Large Deposit/,
      PENDING_EXPENSE: /Large Pending Expense/,
    },
    NON_UPDATE: [/(Low Account Balance)/],
    AMOUNT: /(?!\$0\.00)\$[\d,]*\.\d\d/,
    DESCRIPTION: /(?<=\().*(?=\))/,
    OTHER_CONTENT: /12770 Gateway Drive/,
  };
  BANKS.TEST.SECTION_DELIMITER = getSectionDelimiter(BANKS.TEST.AMOUNT);
  Object.freeze(BANKS);
}

function getSectionDelimiter(delimiterRegex) {
  new RegExp(`(?<=${delimiterRegex.source})`, "g");
}