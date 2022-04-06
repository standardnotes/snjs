import {
  DecryptedPayloadInterface,
  EncryptedPayloadInterface,
  ItemContent,
} from '@standardnotes/models'
import { KeyedDecryptionSplit, KeyedEncryptionSplit } from '../../Encryption/Split/EncryptionSplit'

export interface EncryptionProvider {
  encryptSplitSingle(split: KeyedEncryptionSplit): Promise<EncryptedPayloadInterface>

  encryptSplit(split: KeyedEncryptionSplit): Promise<EncryptedPayloadInterface[]>

  decryptSplitSingle<C extends ItemContent = ItemContent>(
    split: KeyedDecryptionSplit,
  ): Promise<DecryptedPayloadInterface<C> | EncryptedPayloadInterface>

  decryptSplit<C extends ItemContent = ItemContent>(
    split: KeyedDecryptionSplit,
  ): Promise<(DecryptedPayloadInterface<C> | EncryptedPayloadInterface)[]>

  hasRootKeyEncryptionSource(): boolean
}
