// used so that manual runs don't go at the same time as automated runs
function lockDocumentDuring(functionToExecute) {
  let lock = LockService.getDocumentLock();
  try {
    if (lock.tryLock(8000)) {
      try {
        functionToExecute();
      } finally {
        lock.releaseLock();
      }
    } else {
      addError(new Error("Could not acquire the lock."));
    }
  } catch (error) {
    addError(error, "Error occured with document lock");
  }
}

function trimOrNull(value) {
  return typeof value === "string" ? value.trim() : null;
}