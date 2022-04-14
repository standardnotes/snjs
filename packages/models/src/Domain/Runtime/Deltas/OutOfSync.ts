import { FullyFormedPayloadInterface, PayloadEmitSource } from '../../Abstract/Payload'
import { extendArray } from '@standardnotes/utils'
import { isDecryptedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { PayloadContentsEqual } from '../../Utilities/Payload/PayloadContentsEqual'
import { PayloadsDelta } from './Abstract/Delta'
import { ConflictDelta } from './Conflict'
import { DeltaEmit } from './Abstract/DeltaEmit'

export class DeltaOutOfSync extends PayloadsDelta {
  public async result(): Promise<DeltaEmit> {
    const results: FullyFormedPayloadInterface[] = []

    for (const apply of this.applyCollection.all()) {
      const base = this.findBasePayload(apply.uuid)

      if (!base) {
        results.push(apply)

        continue
      }

      const isBaseDecrypted = isDecryptedPayload(base)
      const isApplyDecrypted = isDecryptedPayload(apply)

      const needsConflict =
        isApplyDecrypted !== isBaseDecrypted ||
        (isApplyDecrypted && isBaseDecrypted && !PayloadContentsEqual(apply, base))

      if (needsConflict) {
        const delta = new ConflictDelta(this.baseCollection, base, apply, this.historyMap)

        const deltaResults = await delta.result()

        extendArray(results, deltaResults)
      } else {
        results.push(apply)
      }
    }

    return {
      changed: results,
      source: PayloadEmitSource.RemoteRetrieved,
    }
  }
}
