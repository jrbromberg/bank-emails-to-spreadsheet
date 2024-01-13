// by default, runAllTests will:
// - reset and use the test spreadsheet
// - use test messages built from the TestData file
// - send error alerts to the test email

function runAllTests() {
  setTestData();
  resetTestSheet();
  checkForNewAlerts("test");
}

function resetTestSheet() {
  const testSheet = getTransactionsSheet(CONFIG.TEST.SPREADSHEET_ID);
  testSheet
    .getRange(2, 1, testSheet.getLastRow() - 1, testSheet.getLastColumn())
    .clearContent();
  TEST_DATA.SHEET_START_VALUES.ROWS.forEach((rowValues) => {
    writeToTransactionsSheet(rowValues, testSheet);
  });
}

function prepMessagesFromTestData() {
  let preppedMessages = [
    getTestMessageContentForSingleExpenseAllTestAmounts(),
    getTestMessageContentForAllTransactionTypes(),
    getTestMessageContentForResolvePendingFromPreExisting(),
    getTestMessageContentForResolve3PendingFromPreExisting(),
    getTestMessageContentForResolvePendingFromConcurrent(),
    getTestMessageContentForLowBalanceAlert(),
    getTestMessageContentForUnknownEndContent(),
    getTestMessageContentForResolvePendingFromApproximateMatch(),
    getTestMessageContentForAlmostApproximateMatch(),
  ];
  const receivedTime = new Date();
  preppedMessages.forEach((thisMessage, index) => {
    receivedTimeAndContent = [receivedTime, thisMessage];
    preppedMessages[index] = receivedTimeAndContent;
  });
  return preppedMessages;
}

function getTestMessageContentForSingleExpenseAllTestAmounts() {
  let sections = "";
  Object.entries(TEST_DATA.AMOUNTS).forEach((amount) => {
    let thisSection = replaceSectionValues(amount[1], TEST_DATA.TYPE.EXPENSE);
    sections = sections.concat(thisSection);
  });
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(One Expense, All Amounts)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAllTransactionTypes() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.FOUR_DIGIT,
    TEST_DATA.TYPE.DEPOSIT
  );
  let sections = "".concat(sectionOne, sectionTwo, sectionThree);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(All Transaction Types)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_ONE,
    TEST_DATA.TYPE.EXPENSE
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sectionOne, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolve3PendingFromPreExisting() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_TWO,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_THREE,
    TEST_DATA.TYPE.EXPENSE
  );
  let sectionThree = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_FOUR,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionThree, sectionTwo, sectionOne);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromConcurrent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.PENDING_EXPENSE
  );
  let sectionTwo = replaceSectionValues(
    TEST_DATA.AMOUNTS.TWO_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let sections = "".concat(sectionOne, sectionTwo);
  sections = sections.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Resolve Concurrent Pending)"
  );
  return "".concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForLowBalanceAlert() {
  return "".concat(
    TEST_DATA.SECTIONS.LOW_BALANCE,
    TEST_DATA.SECTIONS.END_CONTENT
  );
}

function getTestMessageContentForUnknownEndContent() {
  let sectionOne = replaceSectionValues(
    TEST_DATA.AMOUNTS.THREE_DIGIT,
    TEST_DATA.TYPE.EXPENSE
  );
  let newAdditionContent = TEST_DATA.SECTIONS.END_CONTENT.replace(
    "12770 Gateway Drive",
    "anything else"
  );
  sectionOne = sectionOne.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Unknown End Content)"
  );
  return "".concat(sectionOne, newAdditionContent);
}

function getTestMessageContentForResolvePendingFromApproximateMatch() {
  let section = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_APPROX_MATCH,
    TEST_DATA.TYPE.EXPENSE
  );
  section = section.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Approximate Match)"
  );
  return "".concat(section, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAlmostApproximateMatch() {
  let section = replaceSectionValues(
    TEST_DATA.AMOUNTS.PENDING_ALMOST_APPROX_MATCH,
    TEST_DATA.TYPE.EXPENSE
  );
  section = section.replace(
    TEST_DATA.DESCRIPTION_REGEX,
    "(Almost Approximate Match)"
  );
  return "".concat(section, TEST_DATA.SECTIONS.END_CONTENT);
}

function replaceSectionValues(amount, type) {
  let section = TEST_DATA.SECTIONS.TRANSACTION;
  section = section.replace("replace-type-image-alt", type.IMAGE_ALT);
  section = section.replace("replace-type-copy", type.COPY);
  section = section.replace("replace-amount", amount);
  return section;
}
