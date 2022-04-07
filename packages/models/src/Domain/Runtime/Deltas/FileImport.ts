import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Delta'
import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import {
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  isDecryptedPayload,
} from '../../Abstract/Payload'

type Return = DecryptedPayloadInterface

export class DeltaFileImport extends PayloadsDelta<
  FullyFormedPayloadInterface,
  DecryptedPayloadInterface,
  DecryptedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []

    for (const payload of this.applyCollection.all()) {
      const handled = await this.payloadsByHandlingPayload(payload, results)
      const payloads = handled.map((result) => {
        return result.copy({
          dirty: true,
          dirtiedDate: new Date(),
        })
      })
      extendArray(results, payloads)
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.FileImport)
  }

  private async payloadsByHandlingPayload(
    payload: DecryptedPayloadInterface | DeletedPayloadInterface,
    currentResults: Return[],
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
      return isDecryptedPayload(candidate) && candidate.content.conflict_of === payload.uuid
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
      const baseCurrent = this.findBasePayload(payload.uuid)
      if (baseCurrent && isDecryptedPayload(baseCurrent)) {
        current = baseCurrent
      }
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
