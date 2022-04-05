import { ContentType, Uuid } from '@standardnotes/common'
import {
  PayloadsChangeObserver,
  QueueElement,
  OverwriteProtectedTypes,
  PayloadsChangeObserverCallback,
  EmitQueue,
  EmitInPayloads,
  EmitOutPayloads,
} from './Types'
import { removeFromArray, Uuids } from '@standardnotes/utils'
import {
  DeltaFileImport,
  isDeletedPayload,
  isEncryptedErroredPayload,
  PayloadInterface,
  ImmutablePayloadCollection,
  IntegrityPayload,
  EncryptedPayloadInterface,
  PayloadSource,
  DeletedPayloadInterface,
  DecryptedPayloadInterface,
  PayloadCollection,
  MergePayloads,
} from '@standardnotes/models'
import * as Services from '@standardnotes/services'

/**
 * The payload manager is responsible for keeping state regarding what items exist in the
 * global application state. It does so by exposing functions that allow consumers to 'map'
 * a detached payload into global application state. Whenever a change is made or retrieved
 * from any source, it must be mapped in order to be properly reflected in global application state.
 * The model manager deals only with in-memory state, and does not deal directly with storage.
 * It also serves as a query store, and can be queried for current notes, tags, etc.
 * It exposes methods that allow consumers to listen to mapping events. This is how
 * applications 'stream' items to display in the interface.
 */
export class PayloadManager
  extends Services.AbstractService
  implements Services.PayloadManagerInterface
{
  private changeObservers: PayloadsChangeObserver[] = []
  public collection: PayloadCollection<EmitOutPayloads>
  private emitQueue: EmitQueue = []

  constructor(protected internalEventBus: Services.InternalEventBusInterface) {
    super(internalEventBus)
    this.collection = new PayloadCollection()
  }

  /**
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */
  public getMasterCollection() {
    return ImmutablePayloadCollection.FromCollection(this.collection)
  }

  public deinit() {
    super.deinit()
    this.changeObservers.length = 0
    this.resetState()
  }

  public resetState() {
    this.collection = new PayloadCollection()
  }

  public find(uuids: Uuid[]) {
    return this.collection.findAll(uuids)
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */
  public async emitCollection(collection: ImmutablePayloadCollection, sourceKey?: string) {
    return this.emitPayloads(collection.all(), collection.source!, sourceKey)
  }

  public get integrityPayloads(): IntegrityPayload[] {
    return this.collection.integrityPayloads()
  }

  /**
   * Returns a detached array of all items which are not deleted
   */
  public get nonDeletedItems() {
    return this.collection.nondeletedElements()
  }

  public get invalidItems(): EncryptedPayloadInterface[] {
    return this.collection.invalidElements()
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns every paylod altered as a result of this operation, to be
   * saved to storage by the caller
   */
  public async emitPayload<P extends EmitInPayloads = EmitInPayloads>(
    payload: P,
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<P[]> {
    return this.emitPayloads([payload], source, sourceKey)
  }

  /**
   * This function maps multiple payloads to items, and is the authoratative mapping
   * function that all other mapping helpers rely on
   * @returns every paylod altered as a result of this operation, to be
   * saved to storage by the caller
   */
  public async emitPayloads<P extends EmitInPayloads = EmitInPayloads>(
    payloads: P[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<P[]> {
    if (payloads.length === 0) {
      console.warn('Attempting to emit 0 payloads.')
    }
    return new Promise((resolve) => {
      const element: QueueElement<P> = {
        payloads,
        source,
        sourceKey,
        resolve,
      }

      this.emitQueue.push(element as unknown as QueueElement<PayloadInterface>)

      if (this.emitQueue.length === 1) {
        void this.popQueue()
      }
    })
  }

  private popQueue() {
    const first = this.emitQueue[0]

    const { changed, inserted, discarded, ignored } = this.mergePayloadsOntoMaster(first.payloads)

    this.notifyChangeObservers(changed, inserted, discarded, ignored, first.source, first.sourceKey)

    removeFromArray(this.emitQueue, first)

    first.resolve(changed.concat(inserted, discarded))

    if (this.emitQueue.length > 0) {
      void this.popQueue()
    }
  }

  private mergePayloadsOntoMaster(payloads: EmitInPayloads[]) {
    const changed: EmitOutPayloads[] = []
    const inserted: EmitOutPayloads[] = []
    const discarded: DeletedPayloadInterface[] = []
    const ignored: EncryptedPayloadInterface[] = []

    for (const payload of payloads) {
      if (!payload.uuid || !payload.content_type) {
        console.error('Payload is corrupt:', payload)
        continue
      }

      const masterPayload = this.collection.find(payload.uuid)

      if (
        OverwriteProtectedTypes.includes(payload.content_type) &&
        isEncryptedErroredPayload(payload) &&
        masterPayload &&
        !isEncryptedErroredPayload(masterPayload)
      ) {
        ignored.push(payload)
        continue
      }

      const newPayload = masterPayload
        ? MergePayloads(masterPayload, payload)
        : (payload as EmitOutPayloads)
      if (isDeletedPayload(newPayload) && newPayload.discardable) {
        /** The item has been deleted and synced,
         * and can thus be removed from our local record */
        this.collection.discard(newPayload)
        discarded.push(newPayload)
      } else {
        this.collection.set(newPayload)
        if (!masterPayload) {
          inserted.push(newPayload)
        } else {
          changed.push(newPayload)
        }
      }
    }
    return { changed, inserted, discarded, ignored }
  }

  /**
   * Notifies observers when an item has been mapped.
   * @param types - An array of content types to listen for
   * @param priority - The lower the priority, the earlier the function is called
   *  wrt to other observers
   */
  public addObserver(
    types: ContentType | ContentType[],
    callback: PayloadsChangeObserverCallback,
    priority = 1,
  ) {
    if (!Array.isArray(types)) {
      types = [types]
    }
    const observer: PayloadsChangeObserver = {
      types,
      priority,
      callback,
    }
    this.changeObservers.push(observer)
    return () => {
      removeFromArray(this.changeObservers, observer)
    }
  }

  /**
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */
  public notifyChangeObservers(
    changed: EmitOutPayloads[],
    inserted: EmitOutPayloads[],
    discarded: DeletedPayloadInterface[],
    ignored: EncryptedPayloadInterface[],
    source: PayloadSource,
    sourceKey?: string,
  ) {
    /** Slice the observers array as sort modifies in-place */
    const observers = this.changeObservers.slice().sort((a, b) => {
      return a.priority < b.priority ? -1 : 1
    })

    const filter = <P extends EmitOutPayloads = EmitOutPayloads>(
      payloads: P[],
      types: ContentType[],
    ) => {
      return types.includes(ContentType.Any)
        ? payloads.slice()
        : payloads.slice().filter((payload) => {
            return types.includes(payload.content_type)
          })
    }

    for (const observer of observers) {
      observer.callback(
        filter(changed, observer.types),
        filter(inserted, observer.types),
        filter(discarded, observer.types),
        filter(ignored, observer.types),
        source,
        sourceKey,
      )
    }
  }

  /**
   * Imports an array of payloads from an external source (such as a backup file)
   * and marks the items as dirty.
   * @returns Resulting items
   */
  public async importPayloads(payloads: DecryptedPayloadInterface[]) {
    const delta = new DeltaFileImport(
      this.getMasterCollection(),
      ImmutablePayloadCollection.WithPayloads(payloads, PayloadSource.FileImport),
      undefined,
    )
    const collection = await delta.resultingCollection()
    await this.emitCollection(collection)
    return Uuids(collection.payloads)
  }

  public removePayloadLocally(payload: EmitOutPayloads) {
    this.collection.discard(payload)
  }
}
