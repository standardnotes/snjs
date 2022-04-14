import { ImmutablePayloadCollection } from '../../Collection/Payload/ImmutablePayloadCollection'
import { HistoryMap } from '../../History/HistoryMap'
import { Uuid } from '@standardnotes/common'
import { FullyFormedPayloadInterface } from '../../../Abstract/Payload'
import { DeltaInterface } from './DeltaInterface'
import { DeltaEmit } from './DeltaEmit'
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
export abstract class PayloadsDelta implements DeltaInterface {
  /**
   * @param baseCollection The authoratitive collection on top of which to compute changes.
   * @param applyCollection The collection of payloads to apply, from one given source only.
   */
  constructor(
    readonly baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    protected readonly applyCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
    protected readonly historyMap: HistoryMap,
  ) {}

  public abstract result(): DeltaEmit

  findBasePayload(uuid: Uuid): FullyFormedPayloadInterface | undefined {
    return this.baseCollection.find(uuid)
  }
}
