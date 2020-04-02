import { MutableCollection } from './../protocol/payloads/mutable_collection';
import { PurePayload } from '@Payloads/pure_payload';
import { SNItem } from '@Models/core/item';
import remove from 'lodash/remove';
import pull from 'lodash/pull';
import {
  ContentType,
} from '@Models/index';
import { PureService } from '@Lib/services/pure_service';
import {
  PayloadSource,
  PayloadCollection,
  DeltaFileImport,
} from '@Payloads/index';

type PayloadInsertionCallback = (
  payloads: PurePayload[],
  source: PayloadSource,
  sourceKey?: string
) => Promise<void>

type InsertionObserver = {
  callback: PayloadInsertionCallback
}

type ChangeCallback = (
  allChangedPayloads: PurePayload[],
  nondeletedPayloads?: PurePayload[],
  deletedPayloads?: PurePayload[],
  source?: PayloadSource,
  sourceKey?: string
) => Promise<void>

type ChangeObserver = {
  types: ContentType | ContentType[]
  priority: number
  callback: ChangeCallback
}

/**
 * The model manager is responsible for keeping state regarding what items exist in the
 * global application state. It does so by exposing functions that allow consumers to 'map'
 * a detached payload into global application state. Whenever a change is made or retrieved
 * from any source, it must be mapped in order to be properly reflected in global application state.
 * The model manager deals only with in-memory state, and does not deal directly with storage.
 * It also serves as a query store, and can be queried for current notes, tags, etc.
 * It exposes methods that allow consumers to listen to mapping events. This is how
 * applications 'stream' items to display in the interface.
 */
export class PayloadManager extends PureService {

  private mappingObservers: ChangeObserver[] = []
  private creationObservers: InsertionObserver[] = []
  public masterCollection: MutableCollection<PurePayload>

  constructor() {
    super();
    this.masterCollection = new MutableCollection();
  }

  /**
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */
  public getMasterCollection() {
    return this.masterCollection.toImmutablePayloadCollection();
  }

  public deinit() {
    super.deinit();
    this.creationObservers.length = 0;
    this.mappingObservers.length = 0;
    this.resetState();
  }

  public resetState() {
    this.masterCollection = new MutableCollection();
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */
  public async emitCollection(collection: PayloadCollection, sourceKey?: string) {
    return this.emitPayloads(
      collection.getAllPayloads(),
      collection.source!,
      sourceKey
    );
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns The mapped item
   */
  public async emitPayload(payload: PurePayload, source: PayloadSource) {
    const items = await this.emitPayloads(
      [payload],
      source
    );
    return items[0];
  }

  /**
   * This function maps multiple payloads to items, and is the authoratative mapping
   * function that all other mapping helpers rely on
   */
  public async emitPayloads(
    payloads: PurePayload[],
    source: PayloadSource,
    sourceKey?: string
  ) {
    /** First loop should process payloads and add items only; no relationship handling. */
    const { processed, newlyInserted } = await this.mergePayloadsOntoMaster(payloads);
    if (newlyInserted.length > 0) {
      await this.notifyInsertionObservers(newlyInserted, source, sourceKey);
    }
    await this.notifyChangeObservers(processed, source, sourceKey);
    return processed;
  }

  private async mergePayloadsOntoMaster(
    payloads: PurePayload[]
  ) {
    const processed: PurePayload[] = [];
    const newlyInserted: PurePayload[] = [];
    for (const payload of payloads) {
      if (!payload.uuid || !payload.content_type) {
        console.error('Payload is corrupt:', payload);
        continue;
      }
      const masterPayload = this.masterCollection.find(payload.uuid!);
      const newPayload = masterPayload ? masterPayload.mergedWith(payload) : payload;
      /** The item has been deleted and synced, 
       * and can thus be removed from our local record */
      if (newPayload.deleted && !newPayload.dirty) {
        this.masterCollection.delete(newPayload);
      } else {
        processed.push(newPayload);
        if (!masterPayload) {
          newlyInserted.push(newPayload);
        }
      }
    }
    return { processed, newlyInserted };
  }

  /** 
   * Notifies observers when an item has been created 
   */
  public addInsertionObserver(callback: PayloadInsertionCallback) {
    const observer: InsertionObserver = { callback };
    this.creationObservers.push(observer);
    return () => {
      remove(this.creationObservers, observer);
    };
  }

  private async notifyInsertionObservers(
    payloads: PurePayload[],
    source: PayloadSource,
    sourceKey?: string
  ) {
    for (const observer of this.creationObservers) {
      await observer.callback(payloads, source, sourceKey);
    }
  }

  /** 
   * Notifies observers when an item has been mapped.
   * @param types - An array of content types to listen for
   * @param priority - The lower the priority, the earlier the function is called 
   *  wrt to other observers
   */
  public addChangeObserver(
    types: ContentType | ContentType[],
    callback: ChangeCallback,
    priority = 1
  ) {
    if (!Array.isArray(types)) {
      types = [types];
    }
    const observer: ChangeObserver = {
      types,
      priority,
      callback
    };
    this.mappingObservers.push(observer);
    return () => {
      pull(this.mappingObservers, observer);
    };
  }

  /** 
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */
  public async notifyChangeObservers(
    payloads: PurePayload[],
    source: PayloadSource,
    sourceKey?: string
  ) {
    const observers = this.mappingObservers.sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });
    for (const observer of observers) {
      const allRelevantPayloads =
        observer.types.includes(ContentType.Any)
          ? payloads
          : payloads.filter((payload) => {
            return observer.types.includes(payload.content_type!);
          });
      const validItems = [];
      const deletedItems = [];
      for (const item of allRelevantPayloads) {
        if (item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }
      if (allRelevantPayloads.length > 0) {
        await observer.callback(
          allRelevantPayloads,
          validItems,
          deletedItems,
          source,
          sourceKey
        );
      }
    }
  }

  /**
   * Imports an array of payloads from an external source (such as a backup file)
   * and marks the items as dirty.
   * @returns Resulting items
   */
  public async importPayloads(payloads: PurePayload[]) {
    const delta = new DeltaFileImport(
      this.getMasterCollection(),
      new PayloadCollection(
        payloads,
        PayloadSource.FileImport
      )
    );
    const collection = await delta.resultingCollection();
    return this.emitCollection(collection);
  }
}
