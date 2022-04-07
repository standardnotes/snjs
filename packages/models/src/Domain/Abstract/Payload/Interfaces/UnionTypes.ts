import { ItemContent } from '../../Item'
import { ContentlessPayloadInterface } from './ContentLessPayload'
import { DecryptedPayloadInterface } from './DecryptedPayload'
import { DeletedPayloadInterface } from './DeletedPayload'
import { EncryptedPayloadInterface } from './EncryptedPayload'

export type FullyFormedPayloadInterface<C extends ItemContent = ItemContent> =
  | DecryptedPayloadInterface<C>
  | EncryptedPayloadInterface
  | DeletedPayloadInterface

export type AnyPayloadInterface<C extends ItemContent = ItemContent> =
  | DecryptedPayloadInterface<C>
  | EncryptedPayloadInterface
  | DeletedPayloadInterface
  | ContentlessPayloadInterface

export type AnyNonDecryptedPayloadInterface =
  | EncryptedPayloadInterface
  | DeletedPayloadInterface
  | ContentlessPayloadInterface
