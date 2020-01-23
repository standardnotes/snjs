import { PureService } from '@Lib/services/pure_service';
import {
  CONTENT_TYPE_ROOT_KEY,
  CONTENT_TYPE_ITEMS_KEY,
  CONTENT_TYPE_ENCRYPTED_STORAGE
} from '@Models/content_types';
import {
  SYNC_EVENT_FULL_SYNC_COMPLETED,
  SYNC_EVENT_INITIAL_SYNC_COMPLETED
} from '@Lib/services/events';
import { KEY_MODE_WRAPPER_ONLY } from '@Services/key_manager';

export class ItemsKeyManager extends PureService {

  constructor({syncManager, modelManager, protocolService}) {
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
    this.syncManager.addEventObserver(async (eventName, data) => {
      if(eventName === SYNC_EVENT_FULL_SYNC_COMPLETED) {
        await this.handleFullSyncCompletion();
      }
      if(eventName !== SYNC_EVENT_INITIAL_SYNC_COMPLETED) {
        await this.handleInitialSyncCompletion();
      }
    })
  }

  async handleInitialSyncCompletion() {
    /**
    * Find items keys with null or epoch updated_at value, indicating
    * that they haven't been synced yet.
    */
    const allItemsKeys = this.modelManager.itemsKeys;
    const neverSynced = allItemsKeys.filter((key) => {
      return key.neverSynced === true;
    });
    /**
    * Find isDefault items key that have been previously synced.
    * If we find one, this means we can delete any non-synced keys.
    */
    const defaultSyncedKey = allItemsKeys.find((key) => {
      return !key.neverSynced && key.isDefault;
    })

    if(defaultSyncedKey) {
      /** Delete all never synced keys */
      await this.modelManager.setItemsToBeDeleted(neverSynced);
    }
  }

  async handleFullSyncCompletion() {
    /** Always create a new items key after full sync, if no items key is found */
    const currentItemsKey = this.getDefaultItemsKey();
    if(!currentItemsKey) {
      await this.createNewItemsKey();
      if(this.keyManager.keyMode === KEY_MODE_WRAPPER_ONLY) {
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
    if(this.allItemsKeys.length === 1) {
      return this.allItemsKeys[0];
    }
    return this.allItemsKeys.find((key) => {
      return key.isDefault === true
    });
  }

  /**
   * @public
   * When the root key changes (non-null only), we must re-encrypt all items
   * keys with this new root key (by simply re-syncing).
   */
  async reencryptItemsKeys() {
    const itemsKeys = this.allItemsKeys;
    if(itemsKeys.length > 0) {
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
  async createNewItemsKey() {
    const rootKey = await this.keyManager.getRootKey();
    const operatorVersion = rootKey
      ? rootKey.version
      : this.protocolService.getLatestVersion();
    const itemsKey = await this.protocolService
      .operatorForVersion(operatorVersion).createItemsKey();
    const currentDefault = this.getDefaultItemsKey();
    if(currentDefault) {
      currentDefault.content.isDefault = false;
      await this.modelManager.setItemDirty(currentDefault);
    }
    itemsKey.content.isDefault = true;
    const payload = itemsKey.payloadRepresentation({
      override: {
        dirty: true
      }
    })
    await this.modelManager.mapPayloadToLocalItem({
      payload: payload
    })
  }
}
