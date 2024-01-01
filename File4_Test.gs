// adjust TEST_MESSAGES_SOURCE as needed for testing
// TEST_DATA is saved in TestData file
let TEST_MESSAGES_SOURCE = TEST_DATA.SOURCE.CANNED;

function runAllTests() {
    setTestConfigAndValues();
    resetTestSheet();
    checkForNewAlerts();
}

function setTestConfigAndValues() {
    SPREADSHEET_ID = CONFIG.TEST.SPREADSHEET_ID;
    ERROR_ALERT_EMAIL_ADDRESS = CONFIG.TEST.ERROR_ALERT_EMAIL_ADDRESS;
    PREP_MESSAGES_FROM_SOURCE = CONFIG.MESSAGE_SOURCE.TEST_DATA;
    ERROR_EMAIL_MESSAGES.push('Script was run in test mode');
}

function resetTestSheet() {
    const testSheet = SpreadsheetApp.openById(CONFIG.TEST.SPREADSHEET_ID).getSheetByName('Transactions');
    testSheet.getRange(2, 1, testSheet.getLastRow() - 1, testSheet.getLastColumn()).clearContent();
    TEST_DATA.SHEET_START_VALUES.ROWS.forEach(rowValues => {
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
        //getTestMessageContentForLowBalanceAlert(),
        getTestMessageContentForUnknownEndContent()
    ];
    const receivedTime = new Date();
    preppedMessages.forEach((thisMessage, index) => {
        receivedTimeAndContent = [receivedTime, thisMessage];
        preppedMessages[index] = receivedTimeAndContent;
    });
    return preppedMessages;
}

function getTestMessageContentForSingleExpenseAllTestAmounts() {
    let sections = '';
    Object.entries(TEST_DATA.AMOUNTS).forEach(amount => {
        let thisSection = replaceSectionValues(amount[1], TEST_DATA.TYPE.EXPENSE);
        sections = sections.concat(thisSection);
    });
    sections = sections.replace(TEST_DATA.DESCRIPTION_REGEX, '(One expense, all amounts)');
    return ''.concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForAllTransactionTypes() {
    let sectionOne = replaceSectionValues(TEST_DATA.AMOUNTS.TWO_DIGIT, TEST_DATA.TYPE.EXPENSE);
    let sectionTwo = replaceSectionValues(TEST_DATA.AMOUNTS.THREE_DIGIT, TEST_DATA.TYPE.PENDING_EXPENSE);
    let sectionThree = replaceSectionValues(TEST_DATA.AMOUNTS.FOUR_DIGIT, TEST_DATA.TYPE.DEPOSIT);
    let sections = ''.concat(sectionOne, sectionTwo, sectionThree);
    sections = sections.replace(TEST_DATA.DESCRIPTION_REGEX, '(All transaction types)');
    return ''.concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromPreExisting() {
    let sectionOne = replaceSectionValues(TEST_DATA.AMOUNTS.PENDING_ONE, TEST_DATA.TYPE.EXPENSE);
    sectionOne = sectionOne.replace(TEST_DATA.DESCRIPTION_REGEX, TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION);
    return ''.concat(sectionOne, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolve3PendingFromPreExisting() {
    let sectionOne = replaceSectionValues(TEST_DATA.AMOUNTS.PENDING_TWO, TEST_DATA.TYPE.EXPENSE);
    let sectionTwo = replaceSectionValues(TEST_DATA.AMOUNTS.PENDING_THREE, TEST_DATA.TYPE.EXPENSE);
    let sectionThree = replaceSectionValues(TEST_DATA.AMOUNTS.PENDING_FOUR, TEST_DATA.TYPE.EXPENSE);
    let sections = ''.concat(sectionOne, sectionTwo, sectionThree);
    sections = sections.replace(TEST_DATA.DESCRIPTION_REGEX, TEST_DATA.SHEET_START_VALUES.PENDING_DESCRIPTION);
    return ''.concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForResolvePendingFromConcurrent() {
    let sectionOne = replaceSectionValues(TEST_DATA.AMOUNTS.TWO_DIGIT, TEST_DATA.TYPE.PENDING_EXPENSE);
    let sectionTwo = replaceSectionValues(TEST_DATA.AMOUNTS.TWO_DIGIT, TEST_DATA.TYPE.EXPENSE);
    let sections = ''.concat(sectionOne, sectionTwo);
    sections = sections.replace(TEST_DATA.DESCRIPTION_REGEX, '(Resolve concurrent pending)');
    return ''.concat(sections, TEST_DATA.SECTIONS.END_CONTENT);
}

function getTestMessageContentForLowBalanceAlert() {
    // figure this one out when i'm ready to solve the issue
}

function getTestMessageContentForUnknownEndContent() {
    let sectionOne = replaceSectionValues(TEST_DATA.AMOUNTS.THREE_DIGIT, TEST_DATA.TYPE.EXPENSE);
    let newAdditionContent = TEST_DATA.SECTIONS.END_CONTENT.replace('12770 Gateway Drive', 'anything else');
    sectionOne = sectionOne.replace(TEST_DATA.DESCRIPTION_REGEX, '(Unknown end content)');
    return ''.concat(sectionOne, newAdditionContent);
}

function replaceSectionValues(amount, type) {
    let section = TEST_DATA.SECTIONS.TRANSACTION;
    section = section.replace('replace-type-image-alt', type.IMAGE_ALT);
    section = section.replace('replace-type-copy', type.COPY);
    section = section.replace('replace-amount', amount);
    return section;
}

function removeAllLabels() {
    let processedThreads = POST_PROCESS_LABEL.getThreads();
    processedThreads.forEach(removeAllLabels);
    UNPROCESSED_ALERTS.forEach(removeAllLabels);
    function removeAllLabels(thread) {
        let labels = thread.getLabels();
        labels.forEach(removeThisLabel);
        function removeThisLabel(thisLabel) {
            thread.removeLabel(thisLabel);
        }
    }
    Logger.log('All labels removed');
}

function testErrorEmail() {
    try {
        throw new Error("Test error");
    } catch (error) {
        console.error('Error:', error.message);
        console.error(error.stack);
        ERROR_EMAIL_MESSAGES.push('This is a test error email message.');
        sendErrorAlertEmail();
    }
}