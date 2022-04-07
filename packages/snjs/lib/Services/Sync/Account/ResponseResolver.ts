import {
  ImmutablePayloadCollectionSet,
  ImmutablePayloadCollection,
  PayloadSource,
  filterDisallowedRemotePayloads,
  CopyPayload,
  HistoryMap,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  ContentlessPayloadInterface,
  PayloadInterface,
  isDeletedPayload,
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts,
} from '@standardnotes/models'
import { ServerSyncResponse } from '@Lib/Services/Sync/Account/Response'
import { DeltaRemoteRejected } from '@Lib/../../models/dist/Domain/Runtime/Deltas/RemoteRejected'
import { EmitOutPayloads } from '@Lib/Services/Payloads'

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class ServerSyncResponseResolver {
  private relatedCollectionSet: ImmutablePayloadCollectionSet

  constructor(
    private response: ServerSyncResponse,
    decryptedResponsePayloads: DecryptedPayloadInterface[],
    private baseCollection: ImmutablePayloadCollection<EmitOutPayloads, DeletedPayloadInterface>,
    payloadsSavedOrSaving: (EncryptedPayloadInterface | DeletedPayloadInterface)[],
    private historyMap: HistoryMap,
  ) {
    this.relatedCollectionSet = new ImmutablePayloadCollectionSet([
      ImmutablePayloadCollection.WithPayloads(
        decryptedResponsePayloads,
        PayloadSource.DecryptedTransient,
      ),
      ImmutablePayloadCollection.WithPayloads(payloadsSavedOrSaving, PayloadSource.SavedOrSaving),
    ])
  }

  public async collectionsByProcessingResponse(): Promise<ImmutablePayloadCollection[]> {
    const collections = []

    const collectionRetrieved = await this.collectionByProcessingPayloads(
      this.response.retrievedPayloads,
      PayloadSource.RemoteRetrieved,
    )
    if (collectionRetrieved.all().length > 0) {
      collections.push(collectionRetrieved)
    }

    const collectionSaved = await this.collectionByProcessingPayloads(
      this.response.savedPayloads,
      PayloadSource.RemoteSaved,
    )
    if (collectionSaved.all().length > 0) {
      collections.push(collectionSaved)
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.collectionByProcessingPayloads(
        this.response.uuidConflictPayloads,
        PayloadSource.ConflictUuid,
      )
      if (collectionUuidConflicts.all().length > 0) {
        collections.push(collectionUuidConflicts)
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.collectionByProcessingPayloads(
        this.response.dataConflictPayloads,
        PayloadSource.ConflictData,
      )
      if (collectionDataConflicts.all().length > 0) {
        collections.push(collectionDataConflicts)
      }
    }

    if (this.response.rejectedPayloads.length > 0) {
      const collectionRejected = await this.collectionByProcessingPayloads(
        this.response.rejectedPayloads,
        PayloadSource.RemoteRejected,
      )
      if (collectionRejected.all().length > 0) {
        collections.push(collectionRejected)
      }
    }

    return collections
  }

  private async collectionByProcessingPayloads(
    payloads: (EncryptedPayloadInterface | DeletedPayloadInterface | ContentlessPayloadInterface)[],
    source: PayloadSource,
  ): Promise<ImmutablePayloadCollection> {
    const collection = ImmutablePayloadCollection.WithPayloads(
      filterDisallowedRemotePayloads(payloads),
      source,
    )

    const delta = this.createDelta(collection, source)

    const resultCollection = await delta.resultingCollection()

    const updatedDirtyPayloads = resultCollection.all().map((payload) => {
      const stillDirty = this.finalDirtyStateForPayload(payload)
      return CopyPayload(payload, {
        dirty: stillDirty,
        dirtiedDate: stillDirty ? new Date() : undefined,
      })
    })

    return ImmutablePayloadCollection.WithPayloads(updatedDirtyPayloads, source)
  }

  private createDelta(
    collection: ImmutablePayloadCollection<
      EncryptedPayloadInterface | ContentlessPayloadInterface,
      DeletedPayloadInterface
    >,
    source: PayloadSource,
  ) {
    if (source === PayloadSource.RemoteRetrieved) {
      return new DeltaRemoteRetrieved(
        this.baseCollection,
        collection,
        this.relatedCollectionSet,
        this.historyMap,
      )
    } else if (source === PayloadSource.RemoteSaved) {
      return new DeltaRemoteSaved(
        this.baseCollection,
        collection,
        this.relatedCollectionSet,
        this.historyMap,
      )
    } else if (source === PayloadSource.ConflictData || source === PayloadSource.ConflictUuid) {
      return new DeltaRemoteConflicts(
        this.baseCollection,
        collection,
        this.relatedCollectionSet,
        this.historyMap,
      )
    } else if (source === PayloadSource.RemoteRejected) {
      return new DeltaRemoteRejected(
        this.baseCollection,
        collection,
        this.relatedCollectionSet,
        this.historyMap,
      )
    } else {
      throw `No delta class found for source ${PayloadSource[source]}`
    }
  }

  private finalDirtyStateForPayload(payload: PayloadInterface): boolean | undefined {
    const current = this.baseCollection.find(payload.uuid)
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty
    if (current) {
      if (
        !current.dirtiedDate ||
        (payload.dirtiedDate && payload.dirtiedDate > current.dirtiedDate)
      ) {
        /** The payload was dirtied as part of handling deltas, and not because it was
         * dirtied by a client. We keep the payload dirty state here. */
        stillDirty = payload.dirty
      } else {
        if (isDeletedPayload(payload) && payload.discardable) {
          /** If a payload is discardable, do not set as dirty no matter what.
           * This occurs when alternating a uuid for a payload */
          stillDirty = false
        } else {
          /** Marking items dirty after or within the same millisecond cycle of lastSyncBegan
           * should cause them to sync again. */
          stillDirty = current.dirtiedDate >= current.lastSyncBegan!
        }
      }
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty
    }
    return stillDirty
  }
}
