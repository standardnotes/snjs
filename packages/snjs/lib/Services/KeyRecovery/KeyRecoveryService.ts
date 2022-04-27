import { SNRootKeyParams, EncryptionService, SNRootKey, KeyParamsFromApiResponse } from '@standardnotes/encryption'
import { UserService } from '../User/UserService'
import {
  ItemsKeyInterface,
  isErrorDecryptingPayload,
  EncryptedPayloadInterface,
  EncryptedPayload,
  isDecryptedPayload,
  ItemsKeyContent,
  DecryptedPayloadInterface,
  PayloadEmitSource,
  EncryptedItemInterface,
} from '@standardnotes/models'
import { SNSyncService } from '../Sync/SyncService'
import { KeyRecoveryStrings } from '../Api/Messages'
import { SNStorageService } from '../Storage/StorageService'
import { PayloadManager } from '../Payloads/PayloadManager'
import { Challenge, ChallengeValidation, ChallengeReason, ChallengePrompt, ChallengeService } from '../Challenge'
import { SNAlertService } from '../Alert/AlertService'
import { SNApiService } from '@Lib/Services/Api/ApiService'
import { ContentType, leftVersionGreaterThanOrEqualToRight } from '@standardnotes/common'
import { ItemManager } from '../Items/ItemManager'
import { dateSorted, removeFromArray } from '@standardnotes/utils'
import { ClientDisplayableError, KeyParamsResponse } from '@standardnotes/responses'
import {
  AbstractService,
  InternalEventBusInterface,
  StorageValueModes,
  ApplicationStage,
  StorageKey,
} from '@standardnotes/services'
import {
  UndecryptableItemsStorage,
  DecryptionCallback,
  DecryptionResponse,
  DecryptionQueueItem,
  KeyRecoveryEvent,
} from './Types'

/**
 * The key recovery service listens to items key changes to detect any that cannot be decrypted.
 * If it detects an items key that is not properly decrypted, it will present a key recovery
 * wizard (using existing UI like Challenges and AlertService) that will attempt to recover
 * the root key for those keys.
 *
 * When we encounter an items key we cannot decrypt, this is a sign that the user's password may
 * have recently changed (even though their session is still valid). If the user has been
 * previously signed in, we take this opportunity to reach out to the server to get the
 * user's current key_params. We ensure these key params' version is equal to or greater than our own.

 * - If this key's key params are equal to the retrieved parameters,
    and this keys created date is greater than any existing valid items key,
    or if we do not have any items keys:
       1. Use the decryption of this key as a source of validation
       2. If valid, replace our local root key with this new root key and emit the decrypted items key
 * - Else, if the key params are not equal,
     or its created date is less than an existing valid items key
        1. Attempt to decrypt this key using its attached key paramas
        2. If valid, emit decrypted items key. DO NOT replace local root key.
 * - If by the end we did not find an items key with matching key params to the retrieved
     key params, AND the retrieved key params are newer than what we have locally, we must
     issue a sign in request to the server.

 * If the user is not signed in and we detect an undecryptable items key, we present a detached
 * recovery wizard that doesn't affect our local root key.
 *
 * When an items key is emitted, protocol service will automatically try to decrypt any
 * related items that are in an errored state.
 *
 * In the item observer, `ignored` items represent items who have encrypted overwrite
 * protection enabled (only items keys). This means that if the incoming payload is errored,
 * but our current copy is not, we will ignore the incoming value until we can properly
 * decrypt it.
 */
export class SNKeyRecoveryService extends AbstractService<KeyRecoveryEvent, DecryptedPayloadInterface[]> {
  private removeItemObserver: () => void
  private decryptionQueue: DecryptionQueueItem[] = []
  private serverParams?: SNRootKeyParams
  private isProcessingQueue = false

  constructor(
    private itemManager: ItemManager,
    private payloadManager: PayloadManager,
    private apiService: SNApiService,
    private protocolService: EncryptionService,
    private challengeService: ChallengeService,
    private alertService: SNAlertService,
    private storageService: SNStorageService,
    private syncService: SNSyncService,
    private userService: UserService,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.removeItemObserver = this.payloadManager.addObserver(
      [ContentType.ItemsKey],
      ({ changed, inserted, ignored, source }) => {
        if (source === PayloadEmitSource.LocalChanged) {
          return
        }

        const changedOrInserted = changed.concat(inserted).filter(isErrorDecryptingPayload)

        if (changedOrInserted.length > 0) {
          void this.handleUndecryptableItemsKeys(changedOrInserted)
        }

        if (ignored.length > 0) {
          void this.handleIgnoredItemsKeys(ignored)
        }
      },
    )
  }

  public override deinit(): void {
    ;(this.itemManager as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.apiService as unknown) = undefined
    ;(this.protocolService as unknown) = undefined
    ;(this.challengeService as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    ;(this.syncService as unknown) = undefined
    ;(this.userService as unknown) = undefined

    this.removeItemObserver()
    ;(this.removeItemObserver as unknown) = undefined

    super.deinit()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  override async handleApplicationStage(stage: ApplicationStage): Promise<void> {
    void super.handleApplicationStage(stage)
    if (stage === ApplicationStage.LoadedDatabase_12) {
      void this.processPersistedUndecryptables()
    }
  }

  /**
   * Ignored items keys are items keys which arrived from a remote source, which we were
   * not able to decrypt, and for which we already had an existing items key that was
   * properly decrypted. Since items keys key contents are immutable, if we already have a
   * successfully decrypted version, yet we can't decrypt the new version, we should
   * temporarily ignore the new version until we can properly decrypt it (through the recovery flow),
   * and not overwrite the local copy.
   *
   * Ignored items are persisted to disk in isolated storage so that they may be decrypted
   * whenever. When they are finally decryptable, we will emit them and update our database
   * with the new decrypted value.
   *
   * When the app first launches, we will query the isolated storage to see if there are any
   * keys we need to decrypt.
   */
  private async handleIgnoredItemsKeys(keys: EncryptedPayloadInterface[], persistIncoming = true) {
    /**
     * Persist the keys locally in isolated storage, so that if we don't properly decrypt
     * them in this app session, the user has a chance to later. If there already exists
     * the same items key in this storage, replace it with this latest incoming value.
     */
    if (persistIncoming) {
      this.saveToUndecryptables(keys)
    }

    this.addKeysToQueue(keys, (key, result) => {
      if (result.success) {
        void this.removeFromUndecryptables(key)
      }
    })

    await this.beginProcessingQueue()
  }

  private async handleUndecryptableItemsKeys(keys: EncryptedPayloadInterface[]) {
    this.addKeysToQueue(keys)

    await this.beginProcessingQueue()
  }

  public presentKeyRecoveryWizard(): void {
    const invalidKeys = this.itemManager.invalidItems
      .filter((i) => i.content_type === ContentType.ItemsKey)
      .map((i) => i.payload)

    void this.handleIgnoredItemsKeys(invalidKeys, false)
  }

  public canAttemptDecryptionOfItem(item: EncryptedItemInterface): ClientDisplayableError | true {
    const keyId = item.payload.items_key_id

    if (!keyId) {
      return new ClientDisplayableError('This item cannot be recovered.')
    }

    const key = this.payloadManager.findOne(keyId)

    if (!key) {
      return new ClientDisplayableError(
        `Unable to find key ${keyId} for this item. You may try signing out and back in; if that doesn't help, check your backup files for a key with this ID and import it.`,
      )
    }

    return true
  }

  public async processPersistedUndecryptables() {
    const record = this.getUndecryptables()

    const rawPayloads = Object.values(record)

    if (rawPayloads.length === 0) {
      return
    }

    const keys = rawPayloads.map((raw) => new EncryptedPayload(raw))

    return this.handleIgnoredItemsKeys(keys, false)
  }

  private getUndecryptables(): UndecryptableItemsStorage {
    return this.storageService.getValue<UndecryptableItemsStorage>(
      StorageKey.KeyRecoveryUndecryptableItems,
      StorageValueModes.Default,
      {},
    )
  }

  private persistUndecryptables(record: UndecryptableItemsStorage) {
    this.storageService.setValue(StorageKey.KeyRecoveryUndecryptableItems, record)
  }

  private saveToUndecryptables(keys: EncryptedPayloadInterface[]) {
    const record = this.getUndecryptables()

    for (const key of keys) {
      record[key.uuid] = key.ejected()
    }

    this.persistUndecryptables(record)
  }

  private removeFromUndecryptables(key: EncryptedPayloadInterface) {
    const record = this.getUndecryptables()

    delete record[key.uuid]

    this.persistUndecryptables(record)
  }

  private get queuePromise() {
    return Promise.all(this.decryptionQueue.map((q) => q.promise))
  }

  private getClientKeyParams() {
    return this.protocolService.getAccountKeyParams()
  }

  private serverKeyParamsAreSafe(clientParams: SNRootKeyParams) {
    return leftVersionGreaterThanOrEqualToRight(this.serverParams!.version, clientParams.version)
  }

  private async performServerSignIn(keyParams: SNRootKeyParams): Promise<SNRootKey | undefined> {
    /** Get the user's account password */
    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.None, undefined, undefined, true)],
      ChallengeReason.Custom,
      true,
      KeyRecoveryStrings.KeyRecoveryLoginFlowPrompt(keyParams),
      KeyRecoveryStrings.KeyRecoveryLoginFlowReason,
    )

    const challengeResponse = await this.challengeService.promptForChallengeResponse(challenge)
    if (!challengeResponse) {
      return undefined
    }

    this.challengeService.completeChallenge(challenge)
    const password = challengeResponse.values[0].value as string

    /** Generate a root key using the input */
    const rootKey = await this.protocolService.computeRootKey(password, keyParams)

    const signInResponse = await this.userService.correctiveSignIn(rootKey)
    if (!signInResponse.error) {
      void this.alertService.alert(KeyRecoveryStrings.KeyRecoveryRootKeyReplaced)
      return rootKey
    } else {
      await this.alertService.alert(KeyRecoveryStrings.KeyRecoveryLoginFlowInvalidPassword)
      return this.performServerSignIn(keyParams)
    }
  }

  private async getWrappingKeyIfApplicable(): Promise<SNRootKey | undefined> {
    if (!this.protocolService.hasPasscode()) {
      return undefined
    }
    const { wrappingKey, canceled } = await this.challengeService.getWrappingKeyIfApplicable()
    if (canceled) {
      await this.alertService.alert(
        KeyRecoveryStrings.KeyRecoveryPasscodeRequiredText,
        KeyRecoveryStrings.KeyRecoveryPasscodeRequiredTitle,
      )

      return this.getWrappingKeyIfApplicable()
    }
    return wrappingKey
  }

  private addKeysToQueue(keys: EncryptedPayloadInterface[], callback?: DecryptionCallback) {
    for (const key of keys) {
      const keyParams = this.protocolService.getKeyEmbeddedKeyParams(key)
      if (!keyParams) {
        continue
      }

      const queueItem: DecryptionQueueItem = {
        key,
        keyParams,
        callback,
      }

      const promise: Promise<DecryptionResponse> = new Promise((resolve) => {
        queueItem.resolve = resolve
      })

      queueItem.promise = promise

      this.decryptionQueue.push(queueItem)
    }
  }

  private readdQueueItem(queueItem: DecryptionQueueItem) {
    const promise: Promise<DecryptionResponse> = new Promise((resolve) => {
      queueItem.resolve = resolve
    })

    queueItem.promise = promise

    this.decryptionQueue.unshift(queueItem)
  }

  private async beginProcessingQueue() {
    if (this.isProcessingQueue) {
      return
    }

    this.isProcessingQueue = true

    const clientParams = this.getClientKeyParams()

    if (!this.serverParams && clientParams) {
      /** Get the user's latest key params from the server */
      const paramsResponse = await this.apiService.getAccountKeyParams(clientParams.identifier)
      if (!paramsResponse.error && paramsResponse.data) {
        this.serverParams = KeyParamsFromApiResponse(paramsResponse as KeyParamsResponse)
      }

      const deallocedAfterNetworkRequest = this.protocolService == undefined
      if (deallocedAfterNetworkRequest) {
        return
      }
    }

    const hasAccount = this.protocolService.hasAccount()
    const hasPasscode = this.protocolService.hasPasscode()
    const credentialsMissing = !hasAccount && !hasPasscode

    let queueItem = this.decryptionQueue[0]

    if (credentialsMissing) {
      const rootKey = await this.performServerSignIn(queueItem.keyParams)

      if (rootKey) {
        await this.handleDecryptionOfAllKeysMatchingCorrectRootKey(rootKey, true)

        removeFromArray(this.decryptionQueue, queueItem)

        queueItem = this.decryptionQueue[0]
      }
    }

    while (queueItem) {
      void this.popQueueItem(queueItem)

      const result = await queueItem.promise

      if (result?.aborted) {
        this.isProcessingQueue = false

        return
      }

      /** Always start from the beginning */
      queueItem = this.decryptionQueue[0]
    }

    void this.queuePromise.then(async () => {
      this.isProcessingQueue = false

      if (this.serverParams) {
        const latestClientParams = this.getClientKeyParams()
        const serverParamsDifferFromClients = latestClientParams && !this.serverParams.compare(latestClientParams)
        if (latestClientParams && this.serverKeyParamsAreSafe(latestClientParams) && serverParamsDifferFromClients) {
          /**
           * The only way left to validate our password is to sign in with the server,
           * creating an all new session.
           */
          await this.performServerSignIn(this.serverParams)
        }
      }

      if (this.syncService.isOutOfSync()) {
        void this.syncService.sync({ checkIntegrity: true })
      }
    })
  }

  private async popQueueItem(queueItem: DecryptionQueueItem): Promise<void> {
    if (!queueItem.resolve) {
      throw Error('Attempting to pop queue element with no resolve function')
    }

    removeFromArray(this.decryptionQueue, queueItem)
    const keyParams = queueItem.keyParams
    const key = queueItem.key
    const resolve = queueItem.resolve

    /**
     * We replace our current root key if the server params differ from our own params,
     * and if we can validate the params based on this items key's params.
     * */
    let replacesRootKey = false
    const clientParams = this.getClientKeyParams()

    if (
      this.serverParams &&
      clientParams &&
      !clientParams.compare(this.serverParams) &&
      keyParams.compare(this.serverParams) &&
      this.serverKeyParamsAreSafe(this.serverParams)
    ) {
      /** Get the latest items key we _can_ decrypt */
      const latest = dateSorted(
        this.itemManager.getItems<ItemsKeyInterface>(ContentType.ItemsKey),
        'created_at',
        false,
      )[0]

      const hasLocalItemsKey = latest != undefined
      const isNewerThanLatest = hasLocalItemsKey && key.created_at > latest.created_at
      replacesRootKey = !hasLocalItemsKey || isNewerThanLatest
    }

    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.None, undefined, undefined, true)],
      ChallengeReason.Custom,
      true,
      KeyRecoveryStrings.KeyRecoveryLoginFlowPrompt(keyParams),
      KeyRecoveryStrings.KeyRecoveryPasswordRequired,
    )

    const response = await this.challengeService.promptForChallengeResponse(challenge)

    if (!response) {
      const result: DecryptionResponse = { success: false, aborted: true }

      resolve(result)

      queueItem.callback?.(key, result)

      return
    }

    const password = response.values[0].value as string

    const rootKey = await this.protocolService.computeRootKey(password, keyParams)

    const decryptedPayload = await this.protocolService.decryptSplitSingle<ItemsKeyContent>({
      usesRootKey: {
        items: [key],
        key: rootKey,
      },
    })

    this.challengeService.completeChallenge(challenge)

    if (!isErrorDecryptingPayload(decryptedPayload)) {
      const matching = await this.handleDecryptionOfAllKeysMatchingCorrectRootKey(rootKey, replacesRootKey, [
        decryptedPayload,
      ])

      const result = { success: true }

      resolve(result)

      queueItem.callback?.(key, result)

      for (const match of matching) {
        match.resolve?.(result)
        match.callback?.(match.key, result)
      }
    } else {
      await this.alertService.alert(KeyRecoveryStrings.KeyRecoveryUnableToRecover)

      this.readdQueueItem(queueItem)

      resolve({ success: false })
    }
  }

  private async handleDecryptionOfAllKeysMatchingCorrectRootKey(
    rootKey: SNRootKey,
    replacesRootKey: boolean,
    additionalKeys: DecryptedPayloadInterface<ItemsKeyContent>[] = [],
  ): Promise<DecryptionQueueItem[]> {
    if (replacesRootKey) {
      const wrappingKey = await this.getWrappingKeyIfApplicable()
      await this.protocolService.setRootKey(rootKey, wrappingKey)
    }

    const matching = this.popQueueForKeyParams(rootKey.keyParams)

    const matchingResults = await this.protocolService.decryptSplit({
      usesRootKey: {
        items: matching.map((m) => m.key),
        key: rootKey,
      },
    })

    const decryptedMatching = matchingResults.filter(isDecryptedPayload)

    const allRelevantKeyPayloads = [...additionalKeys, ...decryptedMatching]

    void this.payloadManager.emitPayloads(allRelevantKeyPayloads, PayloadEmitSource.LocalChanged)

    await this.storageService.savePayloads(allRelevantKeyPayloads)

    if (replacesRootKey) {
      void this.alertService.alert(KeyRecoveryStrings.KeyRecoveryRootKeyReplaced)
    } else {
      void this.alertService.alert(KeyRecoveryStrings.KeyRecoveryKeyRecovered)
    }

    await this.notifyEvent(KeyRecoveryEvent.KeysRecovered, allRelevantKeyPayloads)

    return matching
  }

  private popQueueForKeyParams(keyParams: SNRootKeyParams) {
    const matching = []
    const nonmatching = []

    for (const queueItem of this.decryptionQueue) {
      if (queueItem.keyParams.compare(keyParams)) {
        matching.push(queueItem)
      } else {
        nonmatching.push(queueItem)
      }
    }

    this.decryptionQueue = nonmatching

    return matching
  }
}
