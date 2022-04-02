import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { CopyPayload } from '../../Abstract/Payload/Utilities/Functions'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PurePayload } from '../../Abstract/Payload/Implementations/PurePayload'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'

export class DeltaFileImport extends PayloadsDelta {
  public async resultingCollection() {
    const results: Array<PurePayload> = []
    for (const payload of this.applyCollection!.all()) {
      const handled = await this.payloadsByHandlingPayload(payload, results)
      const payloads = handled.map((result) => {
        return CopyPayload(result, {
          dirty: true,
          dirtiedDate: new Date(),
          deleted: false,
        })
      })
      extendArray(results, payloads)
    }
    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.FileImport)
  }

  private async payloadsByHandlingPayload(
    payload: PurePayload,
    currentResults: Array<PurePayload>,
  ) {
    /**
     * Check to see if we've already processed a payload for this id.
     * If so, that would be the latest value, and not what's in the base collection.
     */
    /*
     * Find the most recently created conflict if available, as that
     * would contain the most recent value.
     */
    let current = currentResults.find((candidate) => {
      return candidate.contentObject.conflict_of === payload.uuid
    })
    /**
     * If no latest conflict, find by uuid directly.
     */
    if (!current) {
      current = currentResults.find((candidate) => {
        return candidate.uuid === payload.uuid
      })
    }
    /**
     * If not found in current results, use the base value.
     */
    if (!current) {
      current = this.findBasePayload(payload.uuid)
    }
    /**
     * If the current doesn't exist, we're creating a new item from payload.
     */
    if (!current) {
      return [payload]
    }

    const delta = new ConflictDelta(this.baseCollection, current, payload, PayloadSource.FileImport)
    const deltaCollection = await delta.resultingCollection()
    return deltaCollection.all()
  }
}
