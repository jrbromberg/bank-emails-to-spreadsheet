// functional test runs different scenarios and uses redacted test email templates populated with test data.  results are rendered and compared to expected results in spreadsheet

function setInitialTestData() {
    const todaysDate = new Date(new Date().setHours(0, 0, 0, 0));
    TEST_DATA = {
      START_ENTRY_DATETIME: new Date(todaysDate.getTime() - 5 * 86400000),
      RECEIVED_TIME: new Date(todaysDate.getTime() - 1 * 86400000),
      RECIEVED_FIVE_DAYS_LATER: todaysDate,
      ACCOUNT_NUMBERS: {
        BECU: "1111",
        BOFA: "2222",
      },
      AMOUNTS: {
        COMPLETED: [
          "0.01",
          "0.10",
          "1.00",
          "12.30",
          "456.78",
          "1,234.56",
          "1,234,567.89",
        ],
        PENDING_MATCH: {
          ONE: "1,000.00",
          TWO: "1,500.00",
          THREE: "2,000.00",
        },
        PENDING_APPROX_MATCH: "2,505.00",
        PENDING_ALMOST_APPROX_MATCH: "3,033.00",
      },
      DESCRIPTION: {
        PENDING_EXPENSE_MATCH: "PENDING EXPENSE MATCH",
        PENDING_APPROX_MATCH: "APPROXIMATE MATCH",
        PENDING_ALMOST_APPROX_MATCH: "ALMOST APPROXIMATE MATCH",
      },
      STARTER_NOTE: "STARTER ENTRY",
      EXPECTED_RESULTS: [
        ["BofA", "2222", "Expense", "-3,033.00", "ALMOST APPROXIMATE MATCH"],
        ["BofA", "2222", "Expense", "-2,505.00", "APPROXIMATE MATCH"],
        ["BECU", "1111", "Expense", "-2,000.00", "PENDING EXPENSE MATCH"],
        ["BECU", "1111", "Expense", "-1,500.00", "PENDING EXPENSE MATCH"],
        ["BECU", "1111", "Expense", "-1,000.00", "PENDING EXPENSE MATCH"],
        ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
        ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
        ["BECU", "1111", "Expense", "-30.00", "NON MATCHING END SECTION"],
        ["BECU", "1111", "Expense", "-20.00", "DIRECT EMAIL"],
        ["BofA", "2222", "Expense", "-1,234,567.89", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-1,234.56", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-456.78", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-12.30", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-1.00", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-0.10", "TEST AMOUNTS"],
        ["BofA", "2222", "Expense", "-0.01", "TEST AMOUNTS"],
        ["BofA", "2222", "Deposit", "10.07", "EACH BANK, EACH TYPE"],
        ["BofA", "2222", "Expense", "-10.06", "EACH BANK, EACH TYPE"],
        ["BofA", "2222", "Deposit", "10.05", "EACH BANK, EACH TYPE"],
        ["BofA", "2222", "Balance", "10.04", "EACH BANK, EACH TYPE"],
        ["BECU", "1111", "Pending Expense", "-10.03", "EACH BANK, EACH TYPE"],
        ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
        ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
        ["BECU", "1111", "Expense", "-10.02", "EACH BANK, EACH TYPE"],
        ["BECU", "1111", "Deposit", "10.01", "EACH BANK, EACH TYPE"],
        [
          "BECU",
          "1111",
          "Pending Expense",
          "-3,000.00",
          "ALMOST APPROXIMATE MATCH",
        ],
        ["BECU", "1111", "Expense", "-5,555.55", "SPACE FILLER"],
        ["BECU", "1111", "Expense", "-5,555.55", "SPACE FILLER"],
        [
          "BECU",
          "1111",
          "Pending Expense",
          "-500.00",
          "PENDING EXPENSE NO MATCH",
        ],
        ["BECU", "1111", "Deposit", "10,000.00", "BALANCE"],
      ],
    };
    createNewTestSheet();
  }
  
  function createNewTestSheet() {
    const testRunSheetName = "Test Run";
    const testSheet = STATIC_CONFIG.SPREADSHEET.getSheetByName(testRunSheetName);
    if (testSheet) {
      STATIC_CONFIG.SPREADSHEET.deleteSheet(testSheet);
    }
    TEST_DATA.SHEET = STATIC_CONFIG.SPREADSHEET.insertSheet(
      testRunSheetName,
      STATIC_CONFIG.SPREADSHEET.getSheets().length
    );
    TEST_DATA.SHEET.hideColumns(9, 7);
    TEST_DATA.WHOLE_HEIGHT_RANGE = TEST_DATA.SHEET.getRange("A1:M1000");
    TEST_DATA.WHOLE_HEIGHT_RANGE.setWrapStrategy(
      SpreadsheetApp.WrapStrategy.CLIP
    );
    TEST_DATA.WHOLE_HEIGHT_RANGE.setHorizontalAlignment("right");
    createTransHeadlines();
  }
  
  function createTransHeadlines() {
    let transHeadlineValues = [
      "Email time and date",
      "Bank",
      "Account #",
      "Update Type",
      "Amount",
      "Description",
      "System Note",
    ];
    let headlines = [
      {
        range: "A1:G1",
        values: transHeadlineValues,
      },
      {
        range: "I1:M1",
        values: transHeadlineValues.slice(1, transHeadlineValues.length - 1),
      },
    ];
    let transHeadlineColumnWidths = [140, 50, 80, 120, 80, 220, 460];
    TEST_DATA.SHEET.setRowHeight(1, 31);
    headlines.forEach((headlineSection) => {
      let range = TEST_DATA.SHEET.getRange(headlineSection.range);
      range.setValues([headlineSection.values]);
      formatHeadline(range);
    });
    transHeadlineColumnWidths.forEach((width, index) => {
      TEST_DATA.SHEET.setColumnWidth(index + 1, width);
    });
    formatHeadline(
      TEST_DATA.SHEET.getRange("O1")
        .setValue("Equal")
        .setHorizontalAlignment("center")
    );
  }
  
  function formatHeadline(range) {
    range
      .setVerticalAlignment("middle")
      .setFontWeight("bold")
      .setBackground("#4c5869")
      .setVerticalAlignment("middle")
      .setFontColor("#FFFFFF");
  }
  
  function addStarterValuesToTestsheet() {
    TEST_DATA.STARTER_VALUES = [
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.DEPOSIT,
        "10,000.00",
        "BALANCE",
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-500.00",
        "PENDING EXPENSE NO MATCH",
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.ONE,
        TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.TWO,
        TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.EXPENSE,
        "-5,555.55",
        "SPACE FILLER",
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-" + TEST_DATA.AMOUNTS.PENDING_MATCH.THREE,
        TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH,
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.EXPENSE,
        "-5,555.55",
        "SPACE FILLER",
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BOFA.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BOFA,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-2,500.00",
        TEST_DATA.DESCRIPTION.PENDING_APPROX_MATCH,
        TEST_DATA.STARTER_NOTE,
      ],
      [
        TEST_DATA.START_ENTRY_DATETIME,
        BANKS.BECU.NAME.SHORT,
        TEST_DATA.ACCOUNT_NUMBERS.BECU,
        FINANCIAL_UPDATE_TYPES.PENDING_EXPENSE,
        "-3,000.00",
        TEST_DATA.DESCRIPTION.PENDING_ALMOST_APPROX_MATCH,
        TEST_DATA.STARTER_NOTE,
      ],
    ];
    TEST_DATA.STARTER_VALUES.forEach((rowValues) => {
      writeToUpdatesSheet(rowValues);
    });
  }
  
  function runTestSuite() {
    checkForNewAlerts("test");
    reconfigureSheetForCompView();
    addExpectedResults();
    checkTestEquality();
  }
  
  function prepMessagesFromTestData() {
    TEST_DATA.BANKS = {
      ONE: BANKS.BECU,
      TWO: BANKS.BOFA,
    };
    let preppedMessages = [
      ...getTestMessageForEachType(),
      ...getTestMessageForEachTestAmount(),
      getOneTestMessageForDirectEmail(),
      getOneTestMessageForNonMatchingExtraSection(),
      getOneTestMessageForNonUpdateMessage(),
      getOneTestMessageForUnknownMessageFormat(),
      getOneTestMessageForMultiplePendingExpenseTypeWithExactMatch(),
      getOneTestMessageForPendingExpenseTypeWithApproximateMatch(),
      getOneTestMessageForPendingExpenseTypeWithAlmostApproximateMatch(),
    ];
    return preppedMessages;
  }
  
  function getTestMessageForEachType() {
    let testMessagesForEachtype = [];
    let amount = 10.01;
    Object.entries(TEST_DATA.BANKS)
      .sort()
      .forEach((bank) => {
        Object.entries(bank[1].FINANCIAL_UPDATE_MESSAGE_FORMATS)
          .sort()
          .forEach((updateFormat) => {
            Object.entries(updateFormat[1].FINANCIAL_UPDATE_TYPES)
              .sort()
              .forEach((type) => {
                let testContent = populateTestMessageContent(
                  type[1].TEST_MESSAGES.FORWARDED_MESSAGE,
                  amount.toFixed(2),
                  "EACH BANK, EACH TYPE"
                );
                testMessagesForEachtype.push(
                  getTestMessageObject("forwarded", testContent)
                );
                amount += 0.01;
              });
          });
      });
    return testMessagesForEachtype;
  }
  
  function populateTestMessageContent(content, amount, description) {
    return content
      .replace(/<amount>/g, amount)
      .replace(/<description>/g, description);
  }
  
  function getTestMessageObject(from, content) {
    return {
      from: from,
      time: TEST_DATA.RECEIVED_TIME,
      content: content,
    };
  }
  
  function getTestMessageForEachTestAmount() {
    let testMessagesForEachtype = [];
    const content =
      BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_EXPENSE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES
        .FORWARDED_MESSAGE;
    TEST_DATA.AMOUNTS.COMPLETED.forEach((amount) => {
      contentWithThisAmount = populateTestMessageContent(
        content,
        amount,
        "TEST AMOUNTS"
      );
      testMessagesForEachtype.push(
        getTestMessageObject("forwarded", contentWithThisAmount)
      );
    });
    return testMessagesForEachtype;
  }
  
  function getOneTestMessageForDirectEmail() {
    let content =
      BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES
        .DIRECT_MESSAGE;
    let from = BANKS.BECU.SENDERS.DIRECT[0];
    let testMessage = getTestMessageObject(
      from,
      populateTestMessageContent(content, "20.00", "DIRECT EMAIL")
    );
    return testMessage;
  }
  
  function getOneTestMessageForNonMatchingExtraSection() {
    let content =
      BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.EXTRA_SECTION.TEST_MESSAGES
        .FORWARDED_MESSAGE;
    let testMessage = getTestMessageObject(
      "forwarded",
      populateTestMessageContent(content, "30.00", "NON MATCHING END SECTION")
    );
    return testMessage;
  }
  
  function getOneTestMessageForUnknownMessageFormat() {
    return getTestMessageObject(BANKS.BECU.SENDERS.DIRECT[0], "uknown content");
  }
  
  function getOneTestMessageForNonUpdateMessage() {
    return getTestMessageObject(
      BANKS.BECU.SENDERS.DIRECT[0],
      "(Low Account Balance)"
    );
  }
  
  function getOneTestMessageForMultiplePendingExpenseTypeWithExactMatch() {
    let contentWithThreeExpenses =
      BANKS.BECU.FINANCIAL_UPDATE_MESSAGE_FORMATS.TRANSACTION_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES
        .FORWARDED_MESSAGE;
    const pendingMatchAmounts = Object.values(
      TEST_DATA.AMOUNTS.PENDING_MATCH
    ).sort();
    pendingMatchAmounts.forEach((amount) => {
      contentWithThreeExpenses = contentWithThreeExpenses.replace(
        "<amount>",
        amount
      );
    });
    contentWithThreeExpenses = contentWithThreeExpenses.replace(
      /<description>/g,
      TEST_DATA.DESCRIPTION.PENDING_EXPENSE_MATCH
    );
    return getTestMessageObject("forwarded", contentWithThreeExpenses);
  }
  
  function getOneTestMessageForPendingExpenseTypeWithApproximateMatch() {
    let content =
      BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_EXPENSE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES
        .FORWARDED_MESSAGE;
    let testMessage = getTestMessageObject(
      "forwarded",
      populateTestMessageContent(
        content,
        TEST_DATA.AMOUNTS.PENDING_APPROX_MATCH,
        TEST_DATA.DESCRIPTION.PENDING_APPROX_MATCH
      )
    );
    testMessage.time = TEST_DATA.RECIEVED_FIVE_DAYS_LATER;
    return testMessage;
  }
  
  function getOneTestMessageForPendingExpenseTypeWithAlmostApproximateMatch() {
    let content =
      BANKS.BOFA.FINANCIAL_UPDATE_MESSAGE_FORMATS.CC_EXPENSE_MESSAGE_FORMAT.FINANCIAL_UPDATE_TYPES.EXPENSE.TEST_MESSAGES
        .FORWARDED_MESSAGE;
    let testMessage = getTestMessageObject(
      "forwarded",
      populateTestMessageContent(
        content,
        TEST_DATA.AMOUNTS.PENDING_ALMOST_APPROX_MATCH,
        TEST_DATA.DESCRIPTION.PENDING_ALMOST_APPROX_MATCH
      )
    );
    testMessage.time = TEST_DATA.RECIEVED_FIVE_DAYS_LATER;
    return testMessage;
  }
  
  function reconfigureSheetForCompView() {
    TEST_DATA.WHOLE_HEIGHT_RANGE.setHorizontalAlignment("left");
    for (var col = 1; col <= 15; col++) {
      TEST_DATA.SHEET.setColumnWidth(col, 80);
    }
    TEST_DATA.SHEET.insertRowBefore(1);
    TEST_DATA.SHEET.getRange("A1:Q1").setHorizontalAlignment("center");
    TEST_DATA.SHEET.getRange("A1:G1").merge().setValue("Test Results");
    TEST_DATA.SHEET.getRange("I1:M1").merge().setValue("Expected Results");
    TEST_DATA.SHEET.getRange("O1:O2").merge();
    TEST_DATA.SHEET.showColumns(9, 9);
  }
  
  function addExpectedResults() {
    const lastRow = TEST_DATA.SHEET.getLastRow();
    const amountColumns = ["E3:E" + lastRow, "L3:L" + lastRow];
    const resultsLength = TEST_DATA.EXPECTED_RESULTS.length;
    amountColumns.forEach((range) => {
      TEST_DATA.SHEET.getRange(range).setNumberFormat("#,##0.00");
    });
    TEST_DATA.SHEET.getRange(3, 9, resultsLength, 5).setValues(
      TEST_DATA.EXPECTED_RESULTS
    );
  }
  
  function checkTestEquality() {
    const lastRow = TEST_DATA.SHEET.getLastRow();
    TEST_DATA.SHEET.getRange("O3")
      .setValue('=join("",B3:F3)=join("",I3:M3)')
      .autoFill(
        TEST_DATA.SHEET.getRange("O3:O" + lastRow),
        SpreadsheetApp.AutoFillSeries.DEFAULT_SERIES
      );
    TEST_DATA.SHEET.getRange("O3:O" + lastRow)
      .getValues()
      .forEach((row, index) => {
        const cell = TEST_DATA.SHEET.getRange("O" + (index + 3));
        cell.setBackground(
          row[0] === true ? "#9cff3d" : row[0] === false ? "#ff0000" : null
        );
      });
  }
  