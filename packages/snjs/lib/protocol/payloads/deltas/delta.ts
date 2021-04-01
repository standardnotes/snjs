import { HistoryMap } from '@Lib/services/history/history_map';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollectionSet } from '@Protocol/collection/collection_set';
import { ImmutablePayloadCollection } from '@Protocol/collection/payload_collection';
/**
 * A payload delta is a class that defines instructions that process an incoming collection
 * of payloads, applies some set of operations on those payloads wrt to the current base state,
 * and returns the resulting collection. Deltas are purely functional and do not modify
 * input data, instead returning what the collection would look like after its been
 * transformed. The consumer may choose to act as they wish with this end result.
 *
 * A delta object takes a baseCollection (the current state of the data) and an applyCollection
 * (the data another source is attempting to merge on top of our base data). The delta will
 * then iterate over this data and return a `resultingCollection` object that includes the final
 * state of the data after the class-specific operations have been applied.
 *
 * For example, the RemoteRetrieved delta will take the current state of local data as
 * baseCollection, the data the server is sending as applyCollection, and determine what
 * the end state of the data should look like.
 */
export class PayloadsDelta {
  /**
   * @param baseCollection The authoratitive collection on top of which to compute changes.
   * @param applyCollection The collection of payloads to apply, from one given source only.
   * @param relatedCollectionSet A collection set (many collections) that contain payloads
   *                             that may be neccessary to carry out computation.
   */
  constructor(
    protected readonly baseCollection: ImmutablePayloadCollection,
    protected readonly applyCollection: ImmutablePayloadCollection,
    protected readonly relatedCollectionSet?: ImmutablePayloadCollectionSet,
    protected readonly historyMap?: HistoryMap,
  ) {

  }

  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    throw 'Must override PayloadDelta.resultingCollection.';
  }

  /**
   * @param id  - The uuid of the payload to find
   */
  protected findBasePayload(id: string) {
    return this.baseCollection.find(id);
  }

  protected findRelatedPayload(id: string, source: PayloadSource) {
    const collection = this.relatedCollectionSet?.collectionForSource(source);
    return collection?.find(id);
  }
}
