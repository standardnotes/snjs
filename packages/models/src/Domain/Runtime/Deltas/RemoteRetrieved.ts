import { ImmutablePayloadCollection } from './../Collection/Payload/ImmutablePayloadCollection'
import { extendArray } from '@standardnotes/utils'
import { ConflictDelta } from './Conflict'
import { PayloadsDelta } from './Abstract/Delta'
import {
  isErrorDecryptingPayload,
  isDecryptedPayload,
} from '../../Abstract/Payload/Interfaces/TypeCheck'
import { EncryptedPayloadInterface, FullyFormedPayloadInterface, PayloadEmitSource } from '../../Abstract/Payload'
import { ContentType, Uuid } from '@standardnotes/common'
import { HistoryMap } from '../History'
import { ServerSyncPushContextualPayload } from '../../Abstract/Contextual/ServerSyncPush'
import {
  payloadByRedirtyingBasedOnBaseState,
  payloadsByRedirtyingBasedOnBaseState,
} from './Utilities.ts/ApplyDirtyState'
import { DeltaEmit } from './Abstract/DeltaEmit'
import { ItemsKeyDelta } from './ItemsKeyDelta'

export class DeltaRemoteRetrieved extends PayloadsDelta {
  constructor(
    baseCollection: ImmutablePayloadCollection,
    applyCollection: ImmutablePayloadCollection,
    private itemsSavedOrSaving: ServerSyncPushContextualPayload[],
    historyMap: HistoryMap,
  ) {
    super(baseCollection, applyCollection, historyMap)
  }

  private isUuidOfPayloadCurrentlySavingOrSaved(uuid: Uuid): boolean {
    return this.itemsSavedOrSaving.find((i) => i.uuid === uuid) != undefined
  }

  public result(): DeltaEmit {
    const results: FullyFormedPayloadInterface[] = []
    const ignored: EncryptedPayloadInterface[] = []
    const conflicted: FullyFormedPayloadInterface[] = []

    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
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

      const isSavedOrSaving = this.isUuidOfPayloadCurrentlySavingOrSaved(apply.uuid)

      if (isSavedOrSaving) {
        conflicted.push(apply)

        continue
      }

      const base = this.findBasePayload(apply.uuid)
      if (base?.dirty && !isErrorDecryptingPayload(base)) {
        conflicted.push(apply)

        continue
      }

      results.push(payloadByRedirtyingBasedOnBaseState(apply, this.baseCollection))
    }

    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    for (const conflict of conflicted) {
      if (!isDecryptedPayload(conflict)) {
        continue
      }

      const base = this.findBasePayload(conflict.uuid)
      if (!base) {
        continue
      }

      const delta = new ConflictDelta(this.baseCollection, base, conflict, this.historyMap)

      const payloads = payloadsByRedirtyingBasedOnBaseState(delta.result(), this.baseCollection)

      extendArray(results, payloads)
    }

    return {
      changed: results,
      ignored: ignored,
      source: PayloadEmitSource.RemoteRetrieved,
    }
  }
}
