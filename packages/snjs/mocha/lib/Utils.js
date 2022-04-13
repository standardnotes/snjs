export async function safeDeinit(application) {
  if (application.dealloced) {
    console.warn(
      'Attempting to deinit already deinited application. Check the test case to find where you are double deiniting.',
    )
    return
  }

  await application.storageService.awaitPersist()

  /** Limit waiting to 1s */
  await Promise.race([sleep(1), application.syncService?.awaitCurrentSyncs()])

  await application.prepareForDeinit()

  application.deinit(DeinitSource.SignOut)
}

export async function sleep(seconds) {
  console.warn(`Test sleeping for ${seconds}s`)

  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, seconds * 1000)
  })
}
