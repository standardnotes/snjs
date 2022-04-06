import { DecryptedPayloadInterface } from './../Interfaces/DecryptedPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import {
  DecryptedTransferPayload,
  DeletedTransferPayload,
  EncryptedTransferPayload,
} from '../../TransferPayload'

export type ConditionalPayloadType<T> = T extends DecryptedTransferPayload<infer C>
  ? DecryptedPayloadInterface<C>
  : T extends EncryptedTransferPayload
  ? EncryptedPayloadInterface
  : DeletedPayloadInterface

export type ConditionalTransferPayloadType<P> = P extends DecryptedPayloadInterface<infer C>
  ? DecryptedTransferPayload<C>
  : P extends EncryptedPayloadInterface
  ? EncryptedTransferPayload
  : DeletedTransferPayload
