import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { ImmutablePayloadCollectionSet } from '../Collection/Payload/ImmutablePayloadCollectionSet'
import { HistoryMap } from '../History/HistoryMap'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { Uuid } from '@standardnotes/common'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { DeltaInterface } from './DeltaInterface'
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
export abstract class PayloadsDelta<
  Base extends FullyFormedPayloadInterface,
  Apply extends FullyFormedPayloadInterface,
  Result extends FullyFormedPayloadInterface,
> implements DeltaInterface<Base, Result>
{
  /**
   * @param baseCollection The authoratitive collection on top of which to compute changes.
   * @param applyCollection The collection of payloads to apply, from one given source only.
   * @param relatedCollectionSet A collection set (many collections) that contain payloads
   *                             that may be neccessary to carry out computation.
   */
  constructor(
    readonly baseCollection: ImmutablePayloadCollection<Base>,
    protected readonly applyCollection: ImmutablePayloadCollection<Apply>,
    protected readonly relatedCollectionSet?: ImmutablePayloadCollectionSet<FullyFormedPayloadInterface>,
    protected readonly historyMap?: HistoryMap,
  ) {}

  public abstract resultingCollection(): Promise<ImmutablePayloadCollection<Result>>

  findBasePayload(uuid: Uuid): Base | undefined {
    return this.baseCollection.find(uuid)
  }

  protected findRelatedPostProcessedPayload(uuid: Uuid): FullyFormedPayloadInterface | undefined {
    const collection = this.relatedCollectionSet?.collectionForSource(
      PayloadSource.PossiblyDecryptedSyncPostProcessed,
    )
    return collection?.find(uuid)
  }
}
