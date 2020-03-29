import { PureService } from '@Lib/services/pure_service';
import { SyncEvents } from '@Lib/events';
import { KEY_MODE_WRAPPER_ONLY } from '@Services/key_manager';
import { ContentTypes } from '@Models';
import { removeFromArray, isNullOrUndefined } from '@Lib/utils';
import { ProtocolVersions, compareVersions } from '@Protocol/versions';
import { PayloadSources } from '@Payloads/sources';
import { CreateItemFromPayload } from '../models';
import { CreateMaxPayloadFromAnyObject } from '../protocol/payloads';

/** The last protocol version to not use root-key based items keys */
const LAST_NONROOT_ITEMS_KEY_VERSION = ProtocolVersions.V003;

/**
 * The items key manager manages the lifecycle of items keys.
 * It is responsible for creating the default items key when conditions call for it
 * (such as after the first sync completes and no key exists).
 * It also exposes public methods that allows consumers to retrieve an items key
 * for a particular payload, and also retrieve all available items keys.
 */
export class ItemsKeyManager extends PureService {
  constructor({ syncService, modelManager, protocolService }) {
    super();
    this.syncService = syncService;
    this.modelManager = modelManager;
    this.protocolService = protocolService;
    this.keyObservers = [];
    this.registerSyncObserver();

    this.removeMappingObserver = this.modelManager.addMappingObserver(
      [ContentTypes.ItemsKey],
      async () => {
        await this.notifyObserversOfChange();
      }
    );
  }

  /** @override */
  deinit() {
    this.syncService = null;
    this.modelManager = null;
    this.keyManager = null;
    this.protocolService = null;
    this.keyObservers.length = 0;
    this.removeMappingObserver();
    this.removeMappingObserver = null;
    this.removeSyncObserver();
    this.removeSyncObserver = null;
    super.deinit();
  }

  /** @access public */
  setKeyManager(keyManager) {
    this.keyManager = keyManager;
  }

  /** @access public */
  addItemsKeyChangeObserver(callback) {
    this.keyObservers.push(callback);
    return () => {
      removeFromArray(this.keyObservers, callback);
    };
  }

  /** @access private */
  async notifyObserversOfChange() {
    for (const observer of this.keyObservers) {
      await observer();
    }
  }

  /** @access private */
  registerSyncObserver() {
    this.removeSyncObserver = this.syncService.addEventObserver(async (eventName) => {
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
   * @access private
   */
  async handleDownloadFirstSyncCompletion() {
    /**
    * Find items keys with null or epoch updated_at value, indicating
    * that they haven't been synced yet.
    */
    const allItemsKeys = this.allItemsKeys;
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
    const hasSyncedItemsKey = !isNullOrUndefined(defaultSyncedKey);
    if (hasSyncedItemsKey) {
      /** Delete all never synced keys */
      await this.modelManager.setItemsToBeDeleted(neverSynced);
    } else {
      /**
       * No previous synced items key.
       * We can keep the one(s) we have, only if their version is equal to our root key version.
       * If their version is not equal to our root key version, delete them. If we end up with 0
       * items keys, create a new one.  */
      const rootKey = await this.keyManager.getRootKey();
      if (rootKey) {
        /** If neverSynced.version != rootKey.version, delete. */
        const toDelete = neverSynced.filter((itemsKey) => {
          return itemsKey.version !== rootKey.version;
        });
        if (toDelete.length > 0) {
          await this.modelManager.setItemsToBeDeleted(toDelete);
        }
        if (allItemsKeys.length === 0) {
          await this.createNewDefaultItemsKey();
        }
      }
    }
  }

  /** @access private */
  async handleFullSyncCompletion() {
    /** Always create a new items key after full sync, if no items key is found */
    const currentItemsKey = this.getDefaultItemsKey();
    if (!currentItemsKey) {
      await this.createNewDefaultItemsKey();
      if (this.keyManager.keyMode === KEY_MODE_WRAPPER_ONLY) {
        return this.syncService.repersistAllItems();
      }
    }
  }

  /**
   * @access public
   * @returns All SN|ItemsKey objects synced to the account.
   */
  get allItemsKeys() {
    return this.modelManager.itemsKeys;
  }

  /**
   * @access public
   * @returns {SNItemsKey} The items key used to encrypt the payload
   */
  itemsKeyForPayload(payload) {
    return this.allItemsKeys.find((key) => key.uuid === payload.items_key_id);
  }

  /**
   * @access public
   * @returns {SNItemsKey} The SNItemsKey object to use to encrypt new or updated items.
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
   * When the root key changes (non-null only), we must re-encrypt all items
   * keys with this new root key (by simply re-syncing).
   * @access public
   */
  async reencryptItemsKeys() {
    const itemsKeys = this.allItemsKeys;
    if (itemsKeys.length > 0) {
      /** 
       * Do not call sync after marking dirty.
       * Re-encrypting items keys is called by consumers who have specific flows who
       * will sync on their own timing
        */
      await this.modelManager.setItemsDirty(itemsKeys);
    }
  }

  /**
   * When migrating from non-SNItemsKey architecture, many items will not have a 
   * relationship with any key object. For those items, we can be sure that only 1 key 
   * object will correspond to that protocol version.
   * @access public
   * @returns {SNItemsKey|null} The SNItemsKey object to decrypt items encrypted
   * with previous protocol version.
   */
  async defaultItemsKeyForItemVersion(version) {
    return this.allItemsKeys.find((key) => {
      return key.version === version;
    });
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption, and adds it to model management.
   * Consumer must call sync. If the protocol version <= 003, only one items key should be created,
   * and its .itemsKey value should be equal to the root key masterKey value.
   * @access public
   * @returns {Promise<void>}
   */
  async createNewDefaultItemsKey() {
    const rootKey = await this.keyManager.getRootKey();
    const operatorVersion = rootKey
      ? rootKey.version
      : this.protocolService.getLatestVersion();
    let itemsKey;
    if (compareVersions(operatorVersion, LAST_NONROOT_ITEMS_KEY_VERSION) <= 0) {
      /** Create root key based items key */
      const payload = CreateMaxPayloadFromAnyObject({
        content_type: ContentTypes.ItemsKey,
        content: {
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: operatorVersion
        }
      });
      itemsKey = CreateItemFromPayload(payload);
      await itemsKey.initUUID();
    } else {
      /** Create independent items key */
      itemsKey = await this.protocolService
        .operatorForVersion(operatorVersion).createItemsKey();
    }
    const currentDefault = this.getDefaultItemsKey();
    if (currentDefault) {
      currentDefault.content.isDefault = false;
      await this.modelManager.setItemDirty(currentDefault);
    }
    itemsKey.content.isDefault = true;
    const payload = itemsKey.payloadRepresentation(
      {
        dirty: true
      }
    );
    await this.modelManager.mapPayloadToLocalItem(
      payload,
      PayloadSources.LocalChanged
    );
  }
}
