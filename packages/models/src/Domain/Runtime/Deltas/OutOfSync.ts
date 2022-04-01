import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/PayloadSource'
import { PayloadsDelta } from './Delta'
import { PayloadsByDuplicating } from "../../Abstract/Payload/Utilities/PayloadsByDuplicating"
import { PayloadContentsEqual } from "../../Abstract/Payload/Utilities/PayloadContentsEqual"

export class DeltaOutOfSync extends PayloadsDelta {
  public async resultingCollection(): Promise<ImmutablePayloadCollection> {
    const results = []
    for (const payload of this.applyCollection.all()) {
      /**
       * Map the server payload as authoritive content. If client copy differs,
       * we will create a duplicate of it below.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload)
      const current = this.findBasePayload(payload.uuid)
      if (!current) {
        continue
      }
      const equal = PayloadContentsEqual(payload, current)
      if (equal) {
        continue
      }
      /**
       * We create a copy of the local existing item and sync that up.
       * It will be a 'conflict' of itself
       */
      const copyResults = await PayloadsByDuplicating(current, this.baseCollection, true)
      extendArray(results, copyResults)
    }
    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }
}
