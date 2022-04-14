import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { ConflictDelta } from './Conflict'
import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import {
  FullyFormedPayloadInterface,
  DeletedPayloadInterface,
  isDecryptedPayload,
  PayloadEmitSource,
} from '../../Abstract/Payload'
import { CustomApplyDelta } from './Abstract/CustomApplyDelta'
import { HistoryMap } from '../History'
import { DeltaEmit } from './Abstract/DeltaEmit'

type Return = DecryptedPayloadInterface

export class DeltaFileImport extends CustomApplyDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection,
    private readonly applyPayloads: DecryptedPayloadInterface[],
    protected readonly historyMap: HistoryMap,
  ) {
    super(baseCollection)
  }

  public result(): DeltaEmit<Return> {
    const results: Return[] = []

    for (const payload of this.applyPayloads) {
      const handled = this.payloadsByHandlingPayload(payload, results)

      const payloads = handled.map((result) => {
        return result.copy({
          dirty: true,
          dirtiedDate: new Date(),
        })
      })

      extendArray(results, payloads)
    }

    return {
      changed: results,
      source: PayloadEmitSource.FileImport,
    }
  }

  private payloadsByHandlingPayload(
    payload: DecryptedPayloadInterface | DeletedPayloadInterface,
    currentResults: Return[],
  ): FullyFormedPayloadInterface[] {
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

    const delta = new ConflictDelta(this.baseCollection, current, payload, this.historyMap)

    return delta.result()
  }
}
