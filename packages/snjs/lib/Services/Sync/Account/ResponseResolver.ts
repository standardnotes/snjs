import { HistoryMap, DeltaClassForSource } from '@standardnotes/models'
import * as Payloads from '@standardnotes/payloads'
import { SyncResponse } from '@Lib/Services/Sync/Response'

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class SyncResponseResolver {
  private relatedCollectionSet: Payloads.ImmutablePayloadCollectionSet

  constructor(
    private response: SyncResponse,
    decryptedResponsePayloads: Payloads.PurePayload[],
    private baseCollection: Payloads.ImmutablePayloadCollection,
    payloadsSavedOrSaving: Payloads.PurePayload[],
    private historyMap: HistoryMap,
  ) {
    this.relatedCollectionSet = new Payloads.ImmutablePayloadCollectionSet([
      Payloads.ImmutablePayloadCollection.WithPayloads(
        decryptedResponsePayloads,
        Payloads.PayloadSource.DecryptedTransient,
      ),
      Payloads.ImmutablePayloadCollection.WithPayloads(
        payloadsSavedOrSaving,
        Payloads.PayloadSource.SavedOrSaving,
      ),
    ])
  }

  public async collectionsByProcessingResponse(): Promise<Payloads.ImmutablePayloadCollection[]> {
    const collections = []

    const collectionRetrieved = await this.collectionByProcessingPayloads(
      this.response.retrievedPayloads,
      Payloads.PayloadSource.RemoteRetrieved,
    )
    if (collectionRetrieved.all().length > 0) {
      collections.push(collectionRetrieved)
    }

    const collectionSaved = await this.collectionByProcessingPayloads(
      this.response.savedPayloads,
      Payloads.PayloadSource.RemoteSaved,
    )
    if (collectionSaved.all().length > 0) {
      collections.push(collectionSaved)
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.collectionByProcessingPayloads(
        this.response.uuidConflictPayloads,
        Payloads.PayloadSource.ConflictUuid,
      )
      if (collectionUuidConflicts.all().length > 0) {
        collections.push(collectionUuidConflicts)
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.collectionByProcessingPayloads(
        this.response.dataConflictPayloads,
        Payloads.PayloadSource.ConflictData,
      )
      if (collectionDataConflicts.all().length > 0) {
        collections.push(collectionDataConflicts)
      }
    }

    if (this.response.rejectedPayloads.length > 0) {
      const collectionRejected = await this.collectionByProcessingPayloads(
        this.response.rejectedPayloads,
        Payloads.PayloadSource.RemoteRejected,
      )
      if (collectionRejected.all().length > 0) {
        collections.push(collectionRejected)
      }
    }

    return collections
  }

  private async collectionByProcessingPayloads(
    payloads: Payloads.PurePayload[],
    source: Payloads.PayloadSource,
  ): Promise<Payloads.ImmutablePayloadCollection> {
    const collection = Payloads.ImmutablePayloadCollection.WithPayloads(
      Payloads.filterDisallowedRemotePayloads(payloads),
      source,
    )
    const deltaClass = DeltaClassForSource(source)!
    // eslint-disable-next-line new-cap
    const delta = new deltaClass(
      this.baseCollection,
      collection,
      this.relatedCollectionSet,
      this.historyMap,
    )
    const resultCollection = await delta.resultingCollection()
    const updatedDirtyPayloads = resultCollection.all().map((payload) => {
      const stillDirty = this.finalDirtyStateForPayload(payload)
      return Payloads.CopyPayload(payload, {
        dirty: stillDirty,
        dirtiedDate: stillDirty ? new Date() : undefined,
      })
    })
    return Payloads.ImmutablePayloadCollection.WithPayloads(updatedDirtyPayloads, source)
  }

  private finalDirtyStateForPayload(payload: Payloads.PurePayload): boolean | undefined {
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
        if (payload.discardable) {
          /** If a payload is discardable, do not set as dirty no matter what.
           * This occurs when alternating a uuid for a payload */
          stillDirty = false
        } else {
          /** Marking items dirty after or within the same millisecond cycle of lastSyncBegan
           * should cause them to sync again. */
          stillDirty = current.dirtiedDate! >= current.lastSyncBegan!
        }
      }
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty
    }
    return stillDirty
  }
}