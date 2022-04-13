import {
  FullyFormedPayloadInterface,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../../Abstract/Payload'
import { extendArray } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { isDecryptedPayload } from '../../Abstract/Payload/Interfaces/TypeCheck'
import { PayloadContentsEqual } from '../../Utilities/Payload/PayloadContentsEqual'
import { PayloadsDelta } from './Delta'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { ConflictDelta } from './Conflict'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaOutOfSync extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []

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
        const delta = new ConflictDelta(
          this.baseCollection,
          base,
          apply,
          PayloadSource.ConflictData,
        )

        const deltaCollection = await delta.resultingCollection()
        const conflictResults = deltaCollection.all()
        extendArray(results, conflictResults)
      } else {
        results.push(apply)
      }
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }
}
