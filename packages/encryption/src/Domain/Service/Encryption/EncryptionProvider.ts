import { ProtocolVersion } from '@standardnotes/common'
import {
  DecryptedPayloadInterface,
  EncryptedPayloadInterface,
  ItemContent,
} from '@standardnotes/models'
import { ClientDisplayableError } from '@standardnotes/responses'
import { BackupFile } from '../../Backups/BackupFile'
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

  /**
   * @returns The versions that this library supports.
   */
  supportedVersions(): ProtocolVersion[]

  getUserVersion(): ProtocolVersion | undefined

  /**
   * Decrypts a backup file using user-inputted password
   * @param password - The raw user password associated with this backup file
   */
  decryptBackupFile(
    file: BackupFile,
    password?: string,
  ): Promise<ClientDisplayableError | (EncryptedPayloadInterface | DecryptedPayloadInterface)[]>
}
