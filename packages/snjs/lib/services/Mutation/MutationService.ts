import { Strings } from './../../strings'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { BackupFile, SNProtocolService } from '../ProtocolService'
import {
  Challenge,
  ChallengeValidation,
  ChallengePrompt,
  ChallengeReason,
  ChallengeService,
} from '../Challenge'
import { compareVersions } from '@standardnotes/applications'
import { ContentType, ProtocolVersion } from '@standardnotes/common'
import { ItemManager, TransactionalMutation } from '../Items'
import { PayloadManager } from '../PayloadManager'
import { SNComponentManager } from './../ComponentManager/ComponentManager'
import { SNProtectionService } from './../Protection/ProtectionService'
import { SNSyncService, SyncOptions } from '../Sync'
import { TagsToFoldersMigrationApplicator } from '@Lib/migrations/applicators/tags_to_folders'
import { UuidString } from '@Lib/Types/UuidString'
import * as Models from '../../Models'
import * as Payloads from '@standardnotes/payloads'
import * as Utils from '@standardnotes/utils'
import { MutationClientInterface } from './MutationClientInterface'

export class MutationService extends AbstractService implements MutationClientInterface {
  constructor(
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private protectionService: SNProtectionService,
    private protocolService: SNProtocolService,
    private payloadManager: PayloadManager,
    private challengeService: ChallengeService,
    private componentManager: SNComponentManager,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  public async savePayload(payload: Payloads.PurePayload): Promise<void> {
    const dirtied = Payloads.CopyPayload(payload, {
      dirty: true,
      dirtiedDate: new Date(),
    })
    await this.payloadManager.emitPayload(dirtied, Payloads.PayloadSource.LocalChanged)
    await this.syncService.sync()
  }

  public async insertItem(item: Models.SNItem): Promise<Models.SNItem> {
    const mutator = Models.createMutatorForItem(item, Models.MutationType.UpdateUserTimestamps)
    const dirtiedPayload = mutator.getResult()
    const insertedItem = await this.itemManager.emitItemFromPayload(dirtiedPayload)
    return insertedItem
  }

  public async saveItem(uuid: UuidString): Promise<void> {
    const item = this.itemManager.findItem(uuid)
    if (!item) {
      throw Error('Attempting to save non-inserted item')
    }
    if (!item.dirty) {
      await this.itemManager.changeItem(uuid, undefined, Models.MutationType.NoUpdateUserTimestamps)
    }
    await this.syncService.sync()
  }

  public async changeAndSaveItem<M extends Models.ItemMutator = Models.ItemMutator>(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    isUserModified = true,
    payloadSource?: Payloads.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<Models.SNItem | undefined> {
    if (!Utils.isString(uuid)) {
      throw Error('Must use uuid to change item')
    }
    await this.itemManager.changeItems(
      [uuid],
      mutate,
      isUserModified ? Models.MutationType.UpdateUserTimestamps : undefined,
      payloadSource,
    )
    await this.syncService.sync(syncOptions)
    return this.itemManager.findItem(uuid)
  }

  public async changeAndSaveItems<M extends Models.ItemMutator = Models.ItemMutator>(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    isUserModified = true,
    payloadSource?: Payloads.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<void> {
    await this.itemManager.changeItems(
      uuids,
      mutate,
      isUserModified ? Models.MutationType.UpdateUserTimestamps : undefined,
      payloadSource,
    )
    await this.syncService.sync(syncOptions)
  }

  public async changeItem<M extends Models.ItemMutator>(
    uuid: UuidString,
    mutate?: (mutator: M) => void,
    isUserModified = true,
  ): Promise<Models.SNItem | undefined> {
    if (!Utils.isString(uuid)) {
      throw Error('Must use uuid to change item')
    }
    await this.itemManager.changeItems(
      [uuid],
      mutate,
      isUserModified ? Models.MutationType.UpdateUserTimestamps : undefined,
    )
    return this.itemManager.findItem(uuid)
  }

  public async changeItems<M extends Models.ItemMutator = Models.ItemMutator>(
    uuids: UuidString[],
    mutate?: (mutator: M) => void,
    isUserModified = true,
  ): Promise<(Models.SNItem | undefined)[]> {
    return this.itemManager.changeItems(
      uuids,
      mutate,
      isUserModified ? Models.MutationType.UpdateUserTimestamps : undefined,
    )
  }

  public async runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<(Models.SNItem | undefined)[]> {
    return this.itemManager.runTransactionalMutations(transactions, payloadSource, payloadSourceKey)
  }

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = Payloads.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.SNItem | undefined> {
    return this.itemManager.runTransactionalMutation(transaction, payloadSource, payloadSourceKey)
  }

  public async protectNote(note: Models.SNNote): Promise<Models.SNNote> {
    const protectedNote = await this.protectionService.protectNote(note)
    void this.syncService.sync()
    return protectedNote
  }

  public async unprotectNote(note: Models.SNNote): Promise<Models.SNNote | undefined> {
    const unprotectedNote = await this.protectionService.unprotectNote(note)
    if (!Utils.isNullOrUndefined(unprotectedNote)) {
      void this.syncService.sync()
    }
    return unprotectedNote
  }

  public async protectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]> {
    const protectedNotes = await this.protectionService.protectNotes(notes)
    void this.syncService.sync()
    return protectedNotes
  }

  public async unprotectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]> {
    const unprotectedNotes = await this.protectionService.unprotectNotes(notes)
    void this.syncService.sync()
    return unprotectedNotes
  }

  public async mergeItem(
    item: Models.SNItem,
    source: Payloads.PayloadSource,
  ): Promise<Models.SNItem> {
    return this.itemManager.emitItemFromPayload(item.payloadRepresentation(), source)
  }

  public async createManagedItem(
    contentType: ContentType,
    content: Payloads.PayloadContent,
    needsSync = false,
    override?: Payloads.PayloadOverride,
  ): Promise<Models.SNItem> {
    return this.itemManager.createItem(contentType, content, needsSync, override)
  }

  public async createTemplateItem(
    contentType: ContentType,
    content?: Payloads.PayloadContent,
  ): Promise<Models.SNItem> {
    return this.itemManager.createTemplateItem(contentType, content)
  }

  public async setItemNeedsSync(
    item: Models.SNItem,
    isUserModified = false,
  ): Promise<Models.SNItem | undefined> {
    return this.itemManager.setItemDirty(item.uuid, isUserModified)
  }

  public async setItemsNeedsSync(items: Models.SNItem[]): Promise<(Models.SNItem | undefined)[]> {
    return this.itemManager.setItemsDirty(Models.Uuids(items))
  }

  public async deleteItem(item: Models.SNItem): Promise<void> {
    await this.itemManager.setItemToBeDeleted(item.uuid)
    await this.syncService.sync()
  }

  public async emptyTrash(): Promise<void> {
    await this.itemManager.emptyTrash()
    await this.syncService.sync()
  }

  public duplicateItem<T extends Models.SNItem>(
    item: T,
    additionalContent?: Partial<Payloads.PayloadContent>,
  ): Promise<T> {
    const duplicate = this.itemManager.duplicateItem<T>(item.uuid, false, additionalContent)
    void this.syncService.sync()
    return duplicate
  }

  public async migrateTagsToFolders(): Promise<unknown> {
    await TagsToFoldersMigrationApplicator.run(this.itemManager)
    return this.syncService.sync()
  }

  public async setTagParent(parentTag: Models.SNTag, childTag: Models.SNTag): Promise<void> {
    await this.itemManager.setTagParent(parentTag, childTag)
  }

  public async unsetTagParent(childTag: Models.SNTag): Promise<void> {
    await this.itemManager.unsetTagParent(childTag)
  }

  public async findOrCreateTag(title: string): Promise<Models.SNTag> {
    return this.itemManager.findOrCreateTagByTitle(title)
  }

  /** Creates and returns the tag but does not run sync. Callers must perform sync. */
  public async createTagOrSmartView(title: string): Promise<Models.SNTag | Models.SmartView> {
    return this.itemManager.createTagOrSmartView(title)
  }

  public async toggleComponent(component: Models.SNComponent): Promise<void> {
    await this.componentManager.toggleComponent(component.uuid)
    await this.syncService.sync()
  }

  public async toggleTheme(theme: Models.SNComponent): Promise<void> {
    await this.componentManager.toggleTheme(theme.uuid)
    await this.syncService.sync()
  }

  public async importData(
    data: BackupFile,
    awaitSync = false,
  ): Promise<
    | {
        affectedItems: Models.SNItem[]
        errorCount: number
      }
    | {
        error: string
      }
    | undefined
  > {
    if (data.version) {
      /**
       * Prior to 003 backup files did not have a version field so we cannot
       * stop importing if there is no backup file version, only if there is
       * an unsupported version.
       */
      const version = data.version as ProtocolVersion

      const supportedVersions = this.protocolService.supportedVersions()
      if (!supportedVersions.includes(version)) {
        return { error: Strings.Info.UnsupportedBackupFileVersion }
      }

      const userVersion = await this.protocolService.getUserVersion()
      if (userVersion && compareVersions(version, userVersion) === 1) {
        /** File was made with a greater version than the user's account */
        return { error: Strings.Info.BackupFileMoreRecentThanAccount }
      }
    }

    let password: string | undefined

    if (data.auth_params || data.keyParams) {
      /** Get import file password. */
      const challenge = new Challenge(
        [
          new ChallengePrompt(
            ChallengeValidation.None,
            Strings.Input.FileAccountPassword,
            undefined,
            true,
          ),
        ],
        ChallengeReason.DecryptEncryptedFile,
        true,
      )
      const passwordResponse = await this.challengeService.promptForChallengeResponse(challenge)
      if (Utils.isNullOrUndefined(passwordResponse)) {
        /** Challenge was canceled */
        return
      }
      this.challengeService.completeChallenge(challenge)
      password = passwordResponse?.values[0].value as string
    }

    if (!(await this.protectionService.authorizeFileImport())) {
      return
    }
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile(
      data,
      password,
    )
    const validPayloads = decryptedPayloads
      .filter((payload) => {
        return !payload.errorDecrypting && payload.format !== Payloads.PayloadFormat.EncryptedString
      })
      .map((payload) => {
        /* Don't want to activate any components during import process in
         * case of exceptions breaking up the import proccess */
        if (payload.content_type === ContentType.Component && payload.safeContent.active) {
          return Payloads.CopyPayload(payload, {
            content: {
              ...payload.safeContent,
              active: false,
            },
          })
        } else {
          return payload
        }
      })
    const affectedUuids = await this.payloadManager.importPayloads(validPayloads)
    const promise = this.syncService.sync()
    if (awaitSync) {
      await promise
    }
    const affectedItems = this.itemManager.findItems(affectedUuids) as Models.SNItem[]
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length,
    }
  }
}
