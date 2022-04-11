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
import { PayloadsByDuplicating } from '../../Utilities/Payload/PayloadsByDuplicating'
import { PayloadsDelta } from './Delta'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'

type Return = EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface

export class DeltaOutOfSync extends PayloadsDelta<
  FullyFormedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface,
  EncryptedPayloadInterface | DecryptedPayloadInterface | DeletedPayloadInterface
> {
  public async resultingCollection(): Promise<ImmutablePayloadCollection<Return>> {
    const results: Return[] = []

    for (const payload of this.applyCollection.all()) {
      /**
       * Map the server payload as authoritive content. If client copy differs,
       * we will create a duplicate of it below.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload)

      const base = this.findBasePayload(payload.uuid)
      if (!base) {
        continue
      }

      const isBaseDecrypted = isDecryptedPayload(base)
      const isApplyDecrypted = isDecryptedPayload(payload)
      const needsConflict =
        isApplyDecrypted !== isBaseDecrypted ||
        (isApplyDecrypted && isBaseDecrypted && !PayloadContentsEqual(payload, base))

      if (needsConflict) {
        /**
         * We create a copy of the local existing item and sync that up.
         * It will be a 'conflict' of itself
         */
        const copyResults = await PayloadsByDuplicating({
          payload: base,
          baseCollection: this.baseCollection,
          isConflict: true,
        })
        extendArray(results, copyResults)
        continue
      }
    }

    return ImmutablePayloadCollection.WithPayloads(results, PayloadSource.RemoteRetrieved)
  }
}