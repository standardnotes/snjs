import { PurePayload } from '@standardnotes/payloads'
import { EncryptedEncryptionIntent } from '../../Intent/EncryptionIntent'
import { EncryptionSplitWithKey } from './EncryptionSplit'

export interface EncryptionProvider {
  encryptSplit(
    split: EncryptionSplitWithKey<PurePayload>,
    intent: EncryptedEncryptionIntent,
  ): Promise<PurePayload[]>

  encryptSplitSingle(
    split: EncryptionSplitWithKey<PurePayload>,
    intent: EncryptedEncryptionIntent,
  ): Promise<PurePayload>

  decryptSplit(split: EncryptionSplitWithKey<PurePayload>): Promise<PurePayload[]>

  decryptSplitSingle(split: EncryptionSplitWithKey<PurePayload>): Promise<PurePayload>

  hasRootKeyEncryptionSource(): boolean
}
