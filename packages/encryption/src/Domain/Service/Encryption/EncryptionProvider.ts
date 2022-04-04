import {
  DecryptedPayloadInterface,
  EncryptedPayloadInterface,
  ItemContent,
} from '@standardnotes/models'
import { EncryptionSplitWithKey } from './EncryptionSplit'

export interface EncryptionProvider {
  encryptSplit(
    split: EncryptionSplitWithKey<DecryptedPayloadInterface>,
  ): Promise<EncryptedPayloadInterface[]>

  encryptSplitSingle(
    split: EncryptionSplitWithKey<DecryptedPayloadInterface>,
  ): Promise<EncryptedPayloadInterface>

  decryptSplitSingle<C extends ItemContent = ItemContent>(
    split: EncryptionSplitWithKey<EncryptedPayloadInterface>,
  ): Promise<DecryptedPayloadInterface<C> | EncryptedPayloadInterface>

  decryptSplit<C extends ItemContent = ItemContent>(
    split: EncryptionSplitWithKey<EncryptedPayloadInterface>,
  ): Promise<(DecryptedPayloadInterface<C> | EncryptedPayloadInterface)[]>

  hasRootKeyEncryptionSource(): boolean
}
