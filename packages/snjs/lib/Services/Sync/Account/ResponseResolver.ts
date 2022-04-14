import {
  ImmutablePayloadCollection,
  PayloadSource,
  HistoryMap,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteDataConflicts,
  FullyFormedPayloadInterface,
  ServerSyncPushContextualPayload,
  ServerSyncSavedContextualPayload,
  FilteredServerItem,
  DeltaRemoteUuidConflicts,
  PayloadEmitSource,
  DeltaRemoteRejected,
} from '@standardnotes/models'
import { ServerSyncResponse } from '@Lib/Services/Sync/Account/Response'
import { CreatePayloadFromRawServerItem } from './Utilities'

export type EmittableCollection = {
  collection: ImmutablePayloadCollection<FullyFormedPayloadInterface>
  emitSource: PayloadEmitSource
}

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class ServerSyncResponseResolver {
  private relatedCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>

  constructor(
    private response: ServerSyncResponse,
    postProcessedRelated: FullyFormedPayloadInterface[],
    private baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private payloadsSavedOrSaving: ServerSyncPushContextualPayload[],
    private historyMap: HistoryMap,
  ) {
    this.relatedCollection = ImmutablePayloadCollection.WithPayloads(postProcessedRelated)
  }

  public async collectionsByProcessingResponse(): Promise<EmittableCollection[]> {
    const collections: EmittableCollection[] = []

    const collectionRetrieved = await this.processRetrievedPayloads(this.response.retrievedPayloads)
    if (collectionRetrieved.all().length > 0) {
      collections.push({
        collection: collectionRetrieved,
        emitSource: PayloadEmitSource.RemoteRetrieved,
      })
    }

    const collectionSaved = await this.processSavedPayloads(this.response.savedPayloads)
    if (collectionSaved.all().length > 0) {
      collections.push({
        collection: collectionSaved,
        emitSource: PayloadEmitSource.RemoteSaved,
      })
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.processUuidConflictPayloads(
        this.response.uuidConflictPayloads,
      )
      if (collectionUuidConflicts.all().length > 0) {
        collections.push({
          collection: collectionUuidConflicts,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.processDataConflictPayloads(
        this.response.dataConflictPayloads,
      )
      if (collectionDataConflicts.all().length > 0) {
        collections.push({
          collection: collectionDataConflicts,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
      }
    }

    if (this.response.rejectedPayloads.length > 0) {
      const collectionRejected = await this.processRejectedPayloads(this.response.rejectedPayloads)
      if (collectionRejected.all().length > 0) {
        collections.push({
          collection: collectionRejected,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
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

    return result
  }

  private async processRetrievedPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map((i) => CreatePayloadFromRawServerItem(i, PayloadSource.RemoteRetrieved)),
    )

    const delta = new DeltaRemoteRetrieved(
      this.baseCollection,
      collection,
      this.payloadsSavedOrSaving,
      this.relatedCollection,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return result
  }

  private async processDataConflictPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map((i) => CreatePayloadFromRawServerItem(i, PayloadSource.RemoteRetrieved)),
    )

    const delta = new DeltaRemoteDataConflicts(
      this.baseCollection,
      collection,
      this.relatedCollection,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return result
  }

  private async processUuidConflictPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map((i) => CreatePayloadFromRawServerItem(i, PayloadSource.RemoteRetrieved)),
    )

    const delta = new DeltaRemoteUuidConflicts(
      this.baseCollection,
      collection,
      this.relatedCollection,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return result
  }

  private async processRejectedPayloads(
    items: FilteredServerItem[],
  ): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(
      items.map((i) => CreatePayloadFromRawServerItem(i, PayloadSource.RemoteRetrieved)),
    )

    const delta = new DeltaRemoteRejected(
      this.baseCollection,
      collection,
      this.relatedCollection,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return result
  }
}
