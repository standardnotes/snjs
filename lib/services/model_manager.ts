import { UuidString } from './../types';
import { subtractFromArray } from '@Lib/utils';
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

type ChangeCallback = (
  changed: PurePayload[],
  inserted: PurePayload[],
  discarded: PurePayload[],
  source?: PayloadSource,
  sourceKey?: string
) => Promise<void>

type ChangeObserver = {
  types: ContentType[]
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

  private changeObservers: ChangeObserver[] = []
  public collection: MutableCollection<PurePayload>

  constructor() {
    super();
    this.collection = new MutableCollection();
  }

  /**
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */
  public getMasterCollection() {
    return this.collection.toImmutablePayloadCollection();
  }

  public deinit() {
    super.deinit();
    this.changeObservers.length = 0;
    this.resetState();
  }

  public resetState() {
    this.collection = new MutableCollection();
  }

  public find(uuids: UuidString[]) {
    return this.collection.findAll(uuids);
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */
  public async emitCollection(collection: PayloadCollection, sourceKey?: string) {
    return this.emitPayloads(
      collection.all(),
      collection.source!,
      sourceKey
    );
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns The mapped item
   */
  public async emitPayload(
    payload: PurePayload,
    source: PayloadSource,
    sourceKey?: string
  ) {
    await this.emitPayloads(
      [payload],
      source,
      sourceKey
    );
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
    const { changed, inserted, discarded } = await this.mergePayloadsOntoMaster(payloads);
    await this.notifyChangeObservers(changed, inserted, discarded, source, sourceKey);
  }

  private async mergePayloadsOntoMaster(
    payloads: PurePayload[]
  ) {
    const changed: PurePayload[] = [];
    const inserted: PurePayload[] = [];
    const discarded: PurePayload[] = [];
    for (const payload of payloads) {
      if (!payload.uuid || !payload.content_type) {
        console.error('Payload is corrupt:', payload);
        continue;
      }
      const masterPayload = this.collection.find(payload.uuid!);
      const newPayload = masterPayload ? masterPayload.mergedWith(payload) : payload;
      /** The item has been deleted and synced, 
       * and can thus be removed from our local record */
      if (newPayload.discardable) {
        this.collection.discard(newPayload);
        discarded.push(newPayload);
      } else {
        this.collection.set(newPayload);
        if (!masterPayload) {
          inserted.push(newPayload);
        } else {
          changed.push(newPayload);
        }
      }
    }
    return { changed, inserted, discarded };
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
    this.changeObservers.push(observer);
    return () => {
      pull(this.changeObservers, observer);
    };
  }

  /** 
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */
  public async notifyChangeObservers(
    changed: PurePayload[],
    inserted: PurePayload[],
    discarded: PurePayload[],
    source: PayloadSource,
    sourceKey?: string
  ) {
    const observers = this.changeObservers.sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });
    const filter = (payloads: PurePayload[], types: ContentType[]) => {
      return types.includes(ContentType.Any)
        ? payloads
        : payloads.filter((payload) => {
          return types.includes(payload.content_type!);
        });
    }
    for (const observer of observers) {
      await observer.callback(
        filter(changed, observer.types),
        filter(inserted, observer.types),
        filter(discarded, observer.types),
        source,
        sourceKey
      );
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

  public removePayloadLocally(payload: PurePayload) {
    this.collection.discard(payload);
  }
}
