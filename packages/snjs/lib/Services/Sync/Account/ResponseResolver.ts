import {
  ImmutablePayloadCollectionSet,
  ImmutablePayloadCollection,
  PayloadSource,
  HistoryMap,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  isDeletedPayload,
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts,
  FullyFormedPayloadInterface,
  ServerSyncPushContextualPayload,
  ServerSyncSavedContextualPayload,
  FilteredServerItem,
} from '@standardnotes/models'
import { ServerSyncResponse } from '@Lib/Services/Sync/Account/Response'
import { DeltaRemoteRejected } from '@Lib/../../models/dist/Domain/Runtime/Deltas/RemoteRejected'
import { CreatePayloadFromRawServerItem } from './Utilities'

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class ServerSyncResponseResolver {
  private relatedCollectionSet: ImmutablePayloadCollectionSet<FullyFormedPayloadInterface>

  constructor(
    private response: ServerSyncResponse,
    postProcessedRelated: FullyFormedPayloadInterface[],
    private baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private payloadsSavedOrSaving: ServerSyncPushContextualPayload[],
    private historyMap: HistoryMap,
  ) {
    this.relatedCollectionSet = new ImmutablePayloadCollectionSet([
      ImmutablePayloadCollection.WithPayloads(
        postProcessedRelated,
        PayloadSource.PossiblyDecryptedSyncPostProcessed,
      ),
    ])
  }

  public async collectionsByProcessingResponse(): Promise<
    ImmutablePayloadCollection<FullyFormedPayloadInterface>[]
  > {
    const collections = []

    const collectionRetrieved = await this.processRetrievedPayloads(this.response.retrievedPayloads)
    if (collectionRetrieved.all().length > 0) {
      collections.push(collectionRetrieved)
    }

    const collectionSaved = await this.processSavedPayloads(this.response.savedPayloads)
    if (collectionSaved.all().length > 0) {
      collections.push(collectionSaved)
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.processConflictPayloads(
        this.response.uuidConflictPayloads,
        PayloadSource.ConflictUuid,
      )
      if (collectionUuidConflicts.all().length > 0) {
        collections.push(collectionUuidConflicts)
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.processConflictPayloads(
        this.response.dataConflictPayloads,
        PayloadSource.ConflictData,
      )
      if (collectionDataConflicts.all().length > 0) {
        collections.push(collectionDataConflicts)
      }
    }

    if (this.response.rejectedPayloads.length > 0) {
      const collectionRejected = await this.processRejectedPayloads(this.response.rejectedPayloads)
      if (collectionRejected.all().length > 0) {
        collections.push(collectionRejected)
      }
    }

    return collections
  }

  private async processSavedPayloads(
    payloads: ServerSyncSavedContextualPayload[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const delta = new DeltaRemoteSaved(this.baseCollection, payloads)

    const result = await delta.resultingCollection()

    return this.applyFinalDirtyState(result)
  }

  private async processRetrievedPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map(CreatePayloadFromRawServerItem),
      PayloadSource.RemoteRetrieved,
    )

    const delta = new DeltaRemoteRetrieved(
      this.baseCollection,
      collection,
      this.payloadsSavedOrSaving,
      this.relatedCollectionSet,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return this.applyFinalDirtyState(result)
  }

  private async processConflictPayloads(
    items: FilteredServerItem[],
    source: PayloadSource.ConflictUuid | PayloadSource.ConflictData,
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map(CreatePayloadFromRawServerItem),
      source,
    )

    const delta = new DeltaRemoteConflicts(
      this.baseCollection,
      collection,
      this.relatedCollectionSet,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return this.applyFinalDirtyState(result)
  }

  private async processRejectedPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map(CreatePayloadFromRawServerItem),
      PayloadSource.RemoteRejected,
    )

    const delta = new DeltaRemoteRejected(
      this.baseCollection,
      collection,
      this.relatedCollectionSet,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return this.applyFinalDirtyState(result)
  }

  private applyFinalDirtyState<P extends FullyFormedPayloadInterface>(
    collection: ImmutablePayloadCollection<P>,
  ): ImmutablePayloadCollection<P> {
    const updatedDirtyPayloads = collection.all().map((payload) => {
      const stillDirty = this.finalDirtyStateForPayload(payload)
      return payload.copy({
        dirty: stillDirty,
        dirtiedDate: stillDirty ? new Date() : undefined,
      })
    })

    return ImmutablePayloadCollection.WithPayloads(
      updatedDirtyPayloads,
      collection.source,
    ) as ImmutablePayloadCollection<P>
  }

  private finalDirtyStateForPayload<P extends FullyFormedPayloadInterface>(
    payload: P,
  ): boolean | undefined {
    const base = this.baseCollection.find(payload.uuid)
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty

    if (base) {
      const baseNotDirtied = !base.dirtiedDate

      const payloadDirtiedAfterBase =
        base.dirtiedDate && payload.dirtiedDate && payload.dirtiedDate > base.dirtiedDate

      if (baseNotDirtied || payloadDirtiedAfterBase) {
        /**
         * The payload was dirtied as part of handling deltas, and not because it was
         * dirtied by a client. We keep the payload dirty state here.
         */
        stillDirty = payload.dirty
      } else {
        if (isDeletedPayload(payload) && payload.discardable) {
          /**
           * If a payload is discardable, do not set as dirty no matter what.
           * This occurs when alternating a uuid for a payload
           */
          stillDirty = false
        } else if (base.lastSyncBegan) {
          /**
           * Marking items dirty after or within the same millisecond cycle of lastSyncBegan
           * should cause them to sync again.
           */
          stillDirty = base.dirtiedDate >= base.lastSyncBegan
        }
      }
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty
    }

    return stillDirty
  }
}
