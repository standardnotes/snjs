import { PureService } from '@Lib/services/pure_service';
import { SyncEvents } from '@Lib/events';
import { KEY_MODE_WRAPPER_ONLY } from '@Services/key_manager';

export class ItemsKeyManager extends PureService {

  constructor({ syncManager, modelManager, protocolService }) {
    super();
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.protocolService = protocolService;
    this.registerSyncObserver();
  }

  /** @public */
  setKeyManager(keyManager) {
    this.keyManager = keyManager;
  }

  /** @private */
  registerSyncObserver() {
    this.syncManager.addEventObserver(async (eventName) => {
      if (eventName === SyncEvents.FullSyncCompleted) {
        await this.handleFullSyncCompletion();
      }
      if (eventName === SyncEvents.DownloadFirstSyncCompleted) {
        await this.handleDownloadFirstSyncCompletion();
      }
    });
  }

  /** 
   * When a download-first sync completes, it means we've completed a (potentially multipage)
   * sync where we only downloaded what the server had before uploading anything. We will be
   * allowed to make local accomadations here before the server begins with the upload
   * part of the sync (automatically runs after download-first sync completes).
   * We use this to see if the server has any default itemsKeys, and if so, allows us to 
   * delete any never-synced items keys we have here locally.
   */
  async handleDownloadFirstSyncCompletion() {
    /**
    * Find items keys with null or epoch updated_at value, indicating
    * that they haven't been synced yet.
    */
    const allItemsKeys = this.modelManager.itemsKeys;
    const neverSynced = allItemsKeys.filter((key) => {
      return key.neverSynced;
    });
    /**
    * Find isDefault items key that have been previously synced.
    * If we find one, this means we can delete any non-synced keys.
    */
    const defaultSyncedKey = allItemsKeys.find((key) => {
      return !key.neverSynced && key.isDefault;
    });

    if (defaultSyncedKey) {
      /** Delete all never synced keys */
      await this.modelManager.setItemsToBeDeleted(neverSynced);
    }
  }

  async handleFullSyncCompletion() {
    /** Always create a new items key after full sync, if no items key is found */
    const currentItemsKey = this.getDefaultItemsKey();
    if (!currentItemsKey) {
      await this.createNewDefaultItemsKey();
      if (this.keyManager.keyMode === KEY_MODE_WRAPPER_ONLY) {
        return this.syncManager.repersistAllItems();
      }
    }
  }

  /**
   * @returns All SN|ItemsKey objects synced to the account.
   */
  get allItemsKeys() {
    return this.modelManager.itemsKeys;
  }

  itemsKeyForPayload(payload) {
    return this.allItemsKeys.find((key) => key.uuid === payload.items_key_id);
  }

  /**
   * @returns The SNItemsKey object to use to encrypt new or updated items.
   */
  getDefaultItemsKey() {
    if (this.allItemsKeys.length === 1) {
      return this.allItemsKeys[0];
    }
    return this.allItemsKeys.find((key) => {
      return key.isDefault;
    });
  }

  /**
   * @public
   * When the root key changes (non-null only), we must re-encrypt all items
   * keys with this new root key (by simply re-syncing).
   */
  async reencryptItemsKeys() {
    const itemsKeys = this.allItemsKeys;
    if (itemsKeys.length > 0) {
      await this.modelManager.setItemsDirty(itemsKeys);
    }
  }

  /**
   * When migrating from non-SNItemsKey architecture, many items will not have a relationship with any key object.
   * For those items, we can be sure that only 1 key object will correspond to that protocol version.
   * @returns The SNItemsKey object to decrypt items encrypted with previous protocol version.
   */
  async defaultItemsKeyForItemVersion(version) {
    return this.allItemsKeys.find((key) => {
      return key.version === version;
    });
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption, and adds it to model management.
   * Consumer must call sync.
   */
  async createNewDefaultItemsKey() {
    const rootKey = await this.keyManager.getRootKey();
    const operatorVersion = rootKey
      ? rootKey.version
      : this.protocolService.getLatestVersion();
    const itemsKey = await this.protocolService
      .operatorForVersion(operatorVersion).createItemsKey();
    const currentDefault = this.getDefaultItemsKey();
    if (currentDefault) {
      currentDefault.content.isDefault = false;
      await this.modelManager.setItemDirty(currentDefault);
    }
    itemsKey.content.isDefault = true;
    const payload = itemsKey.payloadRepresentation({
      override: {
        dirty: true
      }
    });
    await this.modelManager.mapPayloadToLocalItem({
      payload: payload
    });
  }
}
