import {
  ImmutablePayloadCollection,
  HistoryMap,
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteDataConflicts,
  FullyFormedPayloadInterface,
  ServerSyncPushContextualPayload,
  ServerSyncSavedContextualPayload,
  DeltaRemoteUuidConflicts,
  DeltaRemoteRejected,
  DeltaEmit,
} from '@standardnotes/models'

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

  public async result(): Promise<DeltaEmit[]> {
    const emits: DeltaEmit[] = []

    emits.push(await this.processRetrievedPayloads())
    emits.push(await this.processSavedPayloads())
    emits.push(await this.processUuidConflictPayloads())
    emits.push(await this.processDataConflictPayloads())
    emits.push(await this.processRejectedPayloads())

    return emits
  }

  private processSavedPayloads(): Promise<DeltaEmit> {
    const delta = new DeltaRemoteSaved(this.baseCollection, this.payloadSet.savedPayloads)

    return delta.result()
  }

  private processRetrievedPayloads(): Promise<DeltaEmit> {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.retrievedPayloads)

    const delta = new DeltaRemoteRetrieved(
      this.baseCollection,
      collection,
      this.payloadsSavedOrSaving,
      this.historyMap,
    )

    return delta.result()
  }

  private processDataConflictPayloads(): Promise<DeltaEmit> {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.dataConflictPayloads)

    const delta = new DeltaRemoteDataConflicts(this.baseCollection, collection, this.historyMap)

    return delta.result()
  }

  private processUuidConflictPayloads(): Promise<DeltaEmit> {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.uuidConflictPayloads)

    const delta = new DeltaRemoteUuidConflicts(this.baseCollection, collection, this.historyMap)

    return delta.result()
  }

  private processRejectedPayloads(): Promise<DeltaEmit> {
    const collection = ImmutablePayloadCollection.WithPayloads(this.payloadSet.rejectedPayloads)

    const delta = new DeltaRemoteRejected(this.baseCollection, collection, this.historyMap)

    return delta.result()
  }
}
