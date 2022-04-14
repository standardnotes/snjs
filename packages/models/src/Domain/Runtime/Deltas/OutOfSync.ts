import {
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
  PayloadEmitSource,
} from '../../Abstract/Payload'
import { extendArray } from '@standardnotes/utils'
import { isDecryptedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { PayloadContentsEqual } from '../../Utilities/Payload/PayloadContentsEqual'
import { PayloadsDelta } from './Abstract/Delta'
import { ConflictDelta } from './Conflict'
import { DeltaEmit } from './Abstract/DeltaEmit'
import { ContentType } from '@standardnotes/common'
import { ItemsKeyDelta } from './ItemsKeyDelta'

export class DeltaOutOfSync extends PayloadsDelta {
  public result(): DeltaEmit {
    const results: FullyFormedPayloadInterface[] = []
    const ignored: EncryptedPayloadInterface[] = []

    for (const apply of this.applyCollection.all()) {
      if (apply.content_type === ContentType.ItemsKey) {
        const itemsKeyDeltaEmit = new ItemsKeyDelta(this.baseCollection, [apply]).result()

        if (itemsKeyDeltaEmit.changed) {
          extendArray(results, itemsKeyDeltaEmit.changed)
        }
        if (itemsKeyDeltaEmit.ignored) {
          extendArray(ignored, itemsKeyDeltaEmit.ignored)
        }

        continue
      }

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

        const deltaResults = delta.result()

        extendArray(results, deltaResults)
      } else {
        results.push(apply)
      }
    }

    return {
      changed: results,
      ignored: ignored,
      source: PayloadEmitSource.RemoteRetrieved,
    }
  }
}
