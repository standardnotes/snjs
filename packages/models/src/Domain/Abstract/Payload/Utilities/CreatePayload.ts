import { EncryptedPayload } from '../Implementations/EncryptedPayload'
import { DeletedPayload } from '../Implementations/DeletedPayload'
import { DecryptedPayload } from '../Implementations/DecryptedPayload'
import {
  AnyTransferPayload,
  isContentlessTransferPayload,
  isDecryptedTransferPayload,
  isDeletedTransferPayload,
  isEncryptedTransferPayload,
} from '../../TransferPayload'
import { PayloadSource } from '../Types/PayloadSource'
import { ConditionalPayloadType } from './ConditionalPayloadType'
import { ContentlessPayload } from '../Implementations/ContentlessPayload'

export function CreatePayload<T extends AnyTransferPayload>(
  from: T,
  source: PayloadSource = PayloadSource.Constructor,
): ConditionalPayloadType<T> {
  if (isDecryptedTransferPayload(from)) {
    return new DecryptedPayload(from, source) as unknown as ConditionalPayloadType<T>
  } else if (isEncryptedTransferPayload(from)) {
    return new EncryptedPayload(from, source) as unknown as ConditionalPayloadType<T>
  } else if (isDeletedTransferPayload(from)) {
    return new DeletedPayload(from, source) as unknown as ConditionalPayloadType<T>
  } else if (isContentlessTransferPayload(from)) {
    return new ContentlessPayload(from, source) as unknown as ConditionalPayloadType<T>
  }

  throw Error('Unhandled case in MergePayloads')
}
