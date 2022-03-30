import { RootKeyInterface } from '@standardnotes/models'
import { PurePayload } from '@standardnotes/payloads'
import { StorageValueModes } from './StorageTypes'

export interface StorageServiceInterface {
  getValue<T>(key: string, mode?: StorageValueModes, defaultValue?: T): T

  canDecryptWithKey(key: RootKeyInterface): Promise<boolean>

  savePayload(payload: PurePayload): Promise<void>

  savePayloads(decryptedPayloads: PurePayload[]): Promise<void>

  setValue(key: string, value: unknown, mode?: StorageValueModes): void

  removeValue(key: string, mode?: StorageValueModes): Promise<void>
}
