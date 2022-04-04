import { ItemContent, PayloadInterface } from '@standardnotes/models'
import { EncryptedExportIntent } from '../../Intent/ExportIntent'
import { EncryptionSplitWithKey } from './EncryptionSplit'

export interface EncryptionProvider {
  encryptSplit(
    split: EncryptionSplitWithKey<PayloadInterface>,
    intent: EncryptedExportIntent,
  ): Promise<PayloadInterface[]>

  encryptSplitSingle(
    split: EncryptionSplitWithKey<PayloadInterface>,
    intent: EncryptedExportIntent,
  ): Promise<PayloadInterface>

  decryptSplitSingle<C extends ItemContent = ItemContent>(
    split: EncryptionSplitWithKey<PayloadInterface<C>>,
  ): Promise<PayloadInterface<C>>

  decryptSplit<C extends ItemContent = ItemContent>(
    split: EncryptionSplitWithKey<PayloadInterface<C>>,
  ): Promise<PayloadInterface<C>[]>

  hasRootKeyEncryptionSource(): boolean
}
