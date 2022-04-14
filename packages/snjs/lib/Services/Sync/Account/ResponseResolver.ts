import {
  ImmutablePayloadCollection,
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
  DeltaRemoteUuidConflicts,
  PayloadEmitSource,
  DeltaRemoteRejected,
} from '@standardnotes/models'

export type EmittableCollection = {
  collection: ImmutablePayloadCollection<FullyFormedPayloadInterface>
  emitSource: PayloadEmitSource
}

type PayloadSet = {
  retrievedPayloads: FullyFormedPayloadInterface[]
  savedPayloads: ServerSyncSavedContextualPayload[]
  uuidConflictPayloads: FullyFormedPayloadInterface[]
  dataConflictPayloads: FullyFormedPayloadInterface[]
  rejectedPayloads: FullyFormedPayloadInterface[]
}

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class ServerSyncResponseResolver {
  constructor(
    private payloadSet: PayloadSet,
    private baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    private payloadsSavedOrSaving: ServerSyncPushContextualPayload[],
    private historyMap: HistoryMap,
  ) {}

  public async collectionsByProcessingResponse(): Promise<EmittableCollection[]> {
    const collections: EmittableCollection[] = []

    const collectionRetrieved = await this.processRetrievedPayloads()
    if (collectionRetrieved.all().length > 0) {
      collections.push({
        collection: collectionRetrieved,
        emitSource: PayloadEmitSource.RemoteRetrieved,
      })
    }

    const collectionSaved = await this.processSavedPayloads()
    if (collectionSaved.all().length > 0) {
      collections.push({
        collection: collectionSaved,
        emitSource: PayloadEmitSource.RemoteSaved,
      })
    }

    if (this.payloadSet.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.processUuidConflictPayloads()
      if (collectionUuidConflicts.all().length > 0) {
        collections.push({
          collection: collectionUuidConflicts,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
      }
    }

    if (this.payloadSet.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.processDataConflictPayloads()
      if (collectionDataConflicts.all().length > 0) {
        collections.push({
          collection: collectionDataConflicts,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
      }
    }

    if (this.payloadSet.rejectedPayloads.length > 0) {
      const collectionRejected = await this.processRejectedPayloads()
      if (collectionRejected.all().length > 0) {
        collections.push({
          collection: collectionRejected,
          emitSource: PayloadEmitSource.RemoteRetrieved,
        })
      }
    }

    return collections
  }

  private async processSavedPayloads(): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const delta = new DeltaRemoteSaved(this.baseCollection, this.payloadSet.savedPayloads)

    const result = await delta.resultingCollection()

    return result
  }

  private async processRetrievedPayloads(): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.retrievedPayloads)

    const delta = new DeltaRemoteRetrieved(
      this.baseCollection,
      collection,
      this.payloadsSavedOrSaving,
      this.historyMap,
    )

    const result = await delta.resultingCollection()

    return result
  }

  private async processDataConflictPayloads(): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.dataConflictPayloads)

    const delta = new DeltaRemoteDataConflicts(this.baseCollection, collection, this.historyMap)

    const result = await delta.resultingCollection()

    return result
  }

  private async processUuidConflictPayloads(): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.uuidConflictPayloads)

    const delta = new DeltaRemoteUuidConflicts(this.baseCollection, collection, this.historyMap)

    const result = await delta.resultingCollection()

    return result
  }

  private async processRejectedPayloads(): Promise<
    ImmutablePayloadCollection<
      DecryptedPayloadInterface | EncryptedPayloadInterface | DeletedPayloadInterface
    >
  > {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.rejectedPayloads)

    const delta = new DeltaRemoteRejected(this.baseCollection, collection, this.historyMap)

    const result = await delta.resultingCollection()

    return result
  }
}
