import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { BackupFile, EncryptionProvider } from '@standardnotes/encryption'
import { ClientDisplayableError } from '@standardnotes/responses'
import { ContentType, ProtocolVersion, compareVersions } from '@standardnotes/common'
import { ItemManager, TransactionalMutation } from '../Items'
import { MutatorClientInterface } from './MutatorClientInterface'
import { PayloadManager } from '../Payloads/PayloadManager'
import { SNComponentManager } from '../ComponentManager/ComponentManager'
import { SNProtectionService } from '../Protection/ProtectionService'
import { SNSyncService, SyncOptions } from '../Sync'
import { Strings } from '../../Strings'
import { TagsToFoldersMigrationApplicator } from '@Lib/Migrations/Applicators/TagsToFolders'
import * as Models from '@standardnotes/models'
import {
  Challenge,
  ChallengeValidation,
  ChallengePrompt,
  ChallengeReason,
  ChallengeService,
} from '../Challenge'
import {
  CreateDecryptedBackupFileContextPayload,
  CreateEncryptedBackupFileContextPayload,
  isDecryptedPayload,
  isEncryptedTransferPayload,
} from '@standardnotes/models'

export class MutatorService extends AbstractService implements MutatorClientInterface {
  constructor(
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private protectionService: SNProtectionService,
    private encryption: EncryptionProvider,
    private payloadManager: PayloadManager,
    private challengeService: ChallengeService,
    private componentManager: SNComponentManager,
    protected override internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  public async insertItem(
    item: Models.DecryptedItemInterface,
  ): Promise<Models.DecryptedItemInterface> {
    const mutator = Models.CreateDecryptedMutatorForItem(
      item,
      Models.MutationType.UpdateUserTimestamps,
    )
    const dirtiedPayload = mutator.getResult()
    const insertedItem = await this.itemManager.emitItemFromPayload(dirtiedPayload)
    return insertedItem
  }

  public async changeAndSaveItem<
    M extends Models.DecryptedItemMutator = Models.DecryptedItemMutator,
  >(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    mutate: (mutator: M) => void,
    updateTimestamps = true,
    payloadSource?: Models.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<Models.DecryptedItemInterface | undefined> {
    await this.itemManager.changeItems(
      [itemToLookupUuidFor],
      mutate,
      updateTimestamps
        ? Models.MutationType.UpdateUserTimestamps
        : Models.MutationType.NoUpdateUserTimestamps,
      payloadSource,
    )
    await this.syncService.sync(syncOptions)
    return this.itemManager.findItem(itemToLookupUuidFor.uuid)
  }

  public async changeAndSaveItems<
    M extends Models.DecryptedItemMutator = Models.DecryptedItemMutator,
  >(
    itemsToLookupUuidsFor: Models.DecryptedItemInterface[],
    mutate: (mutator: M) => void,
    updateTimestamps = true,
    payloadSource?: Models.PayloadSource,
    syncOptions?: SyncOptions,
  ): Promise<void> {
    await this.itemManager.changeItems(
      itemsToLookupUuidsFor,
      mutate,
      updateTimestamps
        ? Models.MutationType.UpdateUserTimestamps
        : Models.MutationType.NoUpdateUserTimestamps,
      payloadSource,
    )
    await this.syncService.sync(syncOptions)
  }

  public async changeItem<M extends Models.DecryptedItemMutator>(
    itemToLookupUuidFor: Models.DecryptedItemInterface,
    mutate: (mutator: M) => void,
    updateTimestamps = true,
  ): Promise<Models.DecryptedItemInterface | undefined> {
    await this.itemManager.changeItems(
      [itemToLookupUuidFor],
      mutate,
      updateTimestamps
        ? Models.MutationType.UpdateUserTimestamps
        : Models.MutationType.NoUpdateUserTimestamps,
    )
    return this.itemManager.findItem(itemToLookupUuidFor.uuid)
  }

  public async changeItems<M extends Models.DecryptedItemMutator = Models.DecryptedItemMutator>(
    itemsToLookupUuidsFor: Models.DecryptedItemInterface[],
    mutate: (mutator: M) => void,
    updateTimestamps = true,
  ): Promise<(Models.DecryptedItemInterface | undefined)[]> {
    return this.itemManager.changeItems(
      itemsToLookupUuidsFor,
      mutate,
      updateTimestamps
        ? Models.MutationType.UpdateUserTimestamps
        : Models.MutationType.NoUpdateUserTimestamps,
    )
  }

  public async runTransactionalMutations(
    transactions: TransactionalMutation[],
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<(Models.DecryptedItemInterface | undefined)[]> {
    return this.itemManager.runTransactionalMutations(transactions, payloadSource, payloadSourceKey)
  }

  public async runTransactionalMutation(
    transaction: TransactionalMutation,
    payloadSource = Models.PayloadSource.LocalChanged,
    payloadSourceKey?: string,
  ): Promise<Models.DecryptedItemInterface | undefined> {
    return this.itemManager.runTransactionalMutation(transaction, payloadSource, payloadSourceKey)
  }

  private async protectItems<
    M extends Models.DecryptedItemMutator,
    I extends Models.DecryptedItemInterface,
  >(items: I[]): Promise<I[]> {
    const protectedItems = await this.itemManager.changeItems<M, I>(
      items,
      (mutator) => {
        mutator.protected = true
      },
      Models.MutationType.NoUpdateUserTimestamps,
    )

    void this.syncService.sync()
    return protectedItems
  }

  private async unprotectItems<
    M extends Models.DecryptedItemMutator,
    I extends Models.DecryptedItemInterface,
  >(items: I[], reason: ChallengeReason): Promise<I[] | undefined> {
    if (!(await this.protectionService.authorizeAction(reason))) {
      return undefined
    }

    const unprotectedItems = await this.itemManager.changeItems<M, I>(
      items,
      (mutator) => {
        mutator.protected = false
      },
      Models.MutationType.NoUpdateUserTimestamps,
    )

    void this.syncService.sync()
    return unprotectedItems
  }

  public async protectNote(note: Models.SNNote): Promise<Models.SNNote> {
    const result = await this.protectItems([note])
    return result[0]
  }

  public async unprotectNote(note: Models.SNNote): Promise<Models.SNNote | undefined> {
    const result = await this.unprotectItems([note], ChallengeReason.UnprotectNote)
    return result ? result[0] : undefined
  }

  public async protectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]> {
    return this.protectItems(notes)
  }

  public async unprotectNotes(notes: Models.SNNote[]): Promise<Models.SNNote[]> {
    const results = await this.unprotectItems(notes, ChallengeReason.UnprotectNote)
    return results || []
  }

  async protectFile(file: Models.SNFile): Promise<Models.SNFile> {
    const result = await this.protectItems([file])
    return result[0]
  }

  async unprotectFile(file: Models.SNFile): Promise<Models.SNFile | undefined> {
    const result = await this.unprotectItems([file], ChallengeReason.UnprotectFile)
    return result ? result[0] : undefined
  }

  public async mergeItem(
    item: Models.DecryptedItemInterface,
    source: Models.PayloadSource,
  ): Promise<Models.DecryptedItemInterface> {
    return this.itemManager.emitItemFromPayload(item.payloadRepresentation(), source)
  }

  public createTemplateItem<
    C extends Models.ItemContent = Models.ItemContent,
    I extends Models.DecryptedItemInterface<C> = Models.DecryptedItemInterface<C>,
  >(contentType: ContentType, content?: C): I {
    return this.itemManager.createTemplateItem(contentType, content)
  }

  public async setItemNeedsSync(
    item: Models.DecryptedItemInterface,
    updateTimestamps = false,
  ): Promise<Models.DecryptedItemInterface | undefined> {
    return this.itemManager.setItemDirty(item, updateTimestamps)
  }

  public async setItemsNeedsSync(
    items: Models.DecryptedItemInterface[],
  ): Promise<(Models.DecryptedItemInterface | undefined)[]> {
    return this.itemManager.setItemsDirty(items)
  }

  public async deleteItem(item: Models.DecryptedItemInterface): Promise<void> {
    await this.itemManager.setItemToBeDeleted(item)
    await this.syncService.sync()
  }

  public async emptyTrash(): Promise<void> {
    await this.itemManager.emptyTrash()
    await this.syncService.sync()
  }

  public duplicateItem<T extends Models.DecryptedItemInterface>(
    item: T,
    additionalContent?: Partial<Models.ItemContent>,
  ): Promise<T> {
    const duplicate = this.itemManager.duplicateItem<T>(item, false, additionalContent)
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
        affectedItems: Models.DecryptedItemInterface[]
        errorCount: number
      }
    | {
        error: ClientDisplayableError
      }
  > {
    if (data.version) {
      /**
       * Prior to 003 backup files did not have a version field so we cannot
       * stop importing if there is no backup file version, only if there is
       * an unsupported version.
       */
      const version = data.version as ProtocolVersion

      const supportedVersions = this.encryption.supportedVersions()
      if (!supportedVersions.includes(version)) {
        return { error: new ClientDisplayableError(Strings.Info.UnsupportedBackupFileVersion) }
      }

      const userVersion = this.encryption.getUserVersion()
      if (userVersion && compareVersions(version, userVersion) === 1) {
        /** File was made with a greater version than the user's account */
        return { error: new ClientDisplayableError(Strings.Info.BackupFileMoreRecentThanAccount) }
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
      if (passwordResponse == undefined) {
        /** Challenge was canceled */
        return { error: new ClientDisplayableError('Import aborted') }
      }
      this.challengeService.completeChallenge(challenge)
      password = passwordResponse?.values[0].value as string
    }

    if (!(await this.protectionService.authorizeFileImport())) {
      return { error: new ClientDisplayableError('Import aborted') }
    }

    data.items = data.items.map((item) => {
      if (isEncryptedTransferPayload(item)) {
        return CreateEncryptedBackupFileContextPayload(item)
      } else {
        return CreateDecryptedBackupFileContextPayload(
          item as Models.BackupFileDecryptedContextualPayload,
        )
      }
    })

    const decryptedPayloadsOrError = await this.encryption.decryptBackupFile(data, password)

    if (decryptedPayloadsOrError instanceof ClientDisplayableError) {
      return { error: decryptedPayloadsOrError }
    }

    const validPayloads = decryptedPayloadsOrError.filter(isDecryptedPayload).map((payload) => {
      /* Don't want to activate any components during import process in
       * case of exceptions breaking up the import proccess */
      if (
        payload.content_type === ContentType.Component &&
        (payload.content as Models.ComponentContent).active
      ) {
        const typedContent = payload as Models.DecryptedPayloadInterface<Models.ComponentContent>
        return Models.CopyPayloadWithContentOverride(typedContent, {
          active: false,
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

    const affectedItems = this.itemManager.findItems(
      affectedUuids,
    ) as Models.DecryptedItemInterface[]

    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloadsOrError.length - validPayloads.length,
    }
  }
}
