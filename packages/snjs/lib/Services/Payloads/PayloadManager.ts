import { ContentType, Uuid } from '@standardnotes/common'
import {
  PayloadsChangeObserver,
  QueueElement,
  OverwriteProtectedTypes,
  PayloadsChangeObserverCallback,
  EmitQueue,
} from './Types'
import { removeFromArray, Uuids } from '@standardnotes/utils'
import {
  DeltaFileImport,
  isDeletedPayload,
  isErrorDecryptingPayload,
  ImmutablePayloadCollection,
  EncryptedPayloadInterface,
  PayloadSource,
  DeletedPayloadInterface,
  DecryptedPayloadInterface,
  PayloadCollection,
  MergePayloads,
  DeletedPayload,
  FullyFormedPayloadInterface,
  isEncryptedPayload,
  isDecryptedPayload,
} from '@standardnotes/models'
import * as Services from '@standardnotes/services'
import { IntegrityPayload } from '@standardnotes/responses'

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
  public collection: PayloadCollection<FullyFormedPayloadInterface>
  private emitQueue: EmitQueue<FullyFormedPayloadInterface> = []

  constructor(protected override internalEventBus: Services.InternalEventBusInterface) {
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

  public override deinit() {
    super.deinit()
    this.changeObservers.length = 0
    this.resetState()
  }

  public resetState() {
    this.collection = new PayloadCollection()
  }

  public find(uuids: Uuid[]): FullyFormedPayloadInterface[] {
    return this.collection.findAll(uuids)
  }

  public findOne(uuid: Uuid): FullyFormedPayloadInterface | undefined {
    return this.collection.findAll([uuid])[0]
  }

  public all(contentType: ContentType): FullyFormedPayloadInterface[] {
    return this.collection.all(contentType)
  }

  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */
  public async emitCollection(
    collection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    sourceKey?: string,
  ) {
    return this.emitPayloads(collection.all(), collection.source, sourceKey)
  }

  public get integrityPayloads(): IntegrityPayload[] {
    return this.collection.integrityPayloads()
  }

  public get nonDeletedItems(): FullyFormedPayloadInterface[] {
    return this.collection.nondeletedElements()
  }

  public get invalidPayloads(): EncryptedPayloadInterface[] {
    return this.collection.invalidElements()
  }

  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns every paylod altered as a result of this operation, to be
   * saved to storage by the caller
   */
  public async emitPayload<P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface>(
    payload: P,
    source: PayloadSource = PayloadSource.LocalChanged,
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
  public async emitPayloads<P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface>(
    payloads: P[],
    source: PayloadSource = PayloadSource.LocalChanged,
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

      this.emitQueue.push(element as unknown as QueueElement<FullyFormedPayloadInterface>)

      if (this.emitQueue.length === 1) {
        void this.popQueue()
      }
    })
  }

  private popQueue() {
    const first = this.emitQueue[0]

    const { changed, inserted, discarded, ignored, unerrored } = this.mergePayloadsOntoMaster(
      first.payloads,
    )

    this.notifyChangeObservers(
      changed,
      inserted,
      discarded,
      ignored,
      unerrored,
      first.source,
      first.sourceKey,
    )

    removeFromArray(this.emitQueue, first)

    first.resolve([...changed, ...inserted, ...discarded])

    if (this.emitQueue.length > 0) {
      void this.popQueue()
    }
  }

  private mergePayloadsOntoMaster(applyPayloads: FullyFormedPayloadInterface[]) {
    const changed: FullyFormedPayloadInterface[] = []
    const inserted: FullyFormedPayloadInterface[] = []
    const discarded: DeletedPayloadInterface[] = []
    const ignored: EncryptedPayloadInterface[] = []
    const unerrored: DecryptedPayloadInterface[] = []

    for (const applyPayload of applyPayloads) {
      if (!applyPayload.uuid || !applyPayload.content_type) {
        console.error('Payload is corrupt', applyPayload)

        continue
      }

      const masterPayload = this.collection.find(applyPayload.uuid)

      let newPayload = applyPayload

      if (
        OverwriteProtectedTypes.includes(applyPayload.content_type) &&
        isErrorDecryptingPayload(applyPayload) &&
        masterPayload &&
        !isErrorDecryptingPayload(masterPayload)
      ) {
        ignored.push(applyPayload)

        newPayload = masterPayload.copy({
          updated_at_timestamp: applyPayload.updated_at_timestamp,
          updated_at: applyPayload.updated_at,
        })
      } else if (masterPayload) {
        newPayload = MergePayloads(masterPayload, applyPayload)
      }

      if (masterPayload && isEncryptedPayload(masterPayload) && isDecryptedPayload(applyPayload)) {
        unerrored.push(newPayload as DecryptedPayloadInterface)
      }

      if (isDeletedPayload(newPayload) && newPayload.discardable) {
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

    return { changed, inserted, discarded, ignored, unerrored }
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
    changed: FullyFormedPayloadInterface[],
    inserted: FullyFormedPayloadInterface[],
    discarded: DeletedPayloadInterface[],
    ignored: EncryptedPayloadInterface[],
    unerrored: DecryptedPayloadInterface[],
    source: PayloadSource,
    sourceKey?: string,
  ) {
    /** Slice the observers array as sort modifies in-place */
    const observers = this.changeObservers.slice().sort((a, b) => {
      return a.priority < b.priority ? -1 : 1
    })

    const filter = <P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface>(
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
      observer.callback({
        changed: filter(changed, observer.types),
        inserted: filter(inserted, observer.types),
        discarded: filter(discarded, observer.types),
        ignored: filter(ignored, observer.types),
        unerrored: filter(unerrored, observer.types),
        source,
        sourceKey,
      })
    }
  }

  /**
   * Imports an array of payloads from an external source (such as a backup file)
   * and marks the items as dirty.
   * @returns Resulting items
   */
  public async importPayloads(payloads: DecryptedPayloadInterface[]): Promise<Uuid[]> {
    const sourcedPayloads = payloads.map((p) => p.copy(undefined, PayloadSource.FileImport))

    const delta = new DeltaFileImport(
      this.getMasterCollection(),
      ImmutablePayloadCollection.WithPayloads(sourcedPayloads, PayloadSource.FileImport),
    )

    const collection = await delta.resultingCollection()

    await this.emitCollection(collection)

    return Uuids(collection.payloads)
  }

  public removePayloadLocally(payload: FullyFormedPayloadInterface) {
    this.collection.discard(payload)
  }

  public erroredPayloadsForContentType(contentType: ContentType): EncryptedPayloadInterface[] {
    return this.collection.invalidElements().filter((p) => p.content_type === contentType)
  }

  public async deleteErroredPayloads(payloads: EncryptedPayloadInterface[]): Promise<void> {
    const deleted = payloads.map(
      (payload) =>
        new DeletedPayload(
          {
            ...payload.ejected(),
            deleted: true,
            content: undefined,
            dirty: true,
            dirtiedDate: new Date(),
          },
          payload.source,
        ),
    )

    await this.emitPayloads(deleted, PayloadSource.LocalChanged)
  }
}
