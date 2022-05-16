import { Environment } from './Environments'
import { ApplicationIdentifier } from '@standardnotes/common'
import {
  FullyFormedTransferPayload,
  TransferPayload,
  LegacyRawKeychainValue,
  NamespacedRootKeyInKeychain,
} from '@standardnotes/models'

/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 */
export interface DeviceInterface {
  environment: Environment

  deinit(): void

  getRawStorageValue(key: string): Promise<string | undefined>

  getJsonParsedRawStorageValue(key: string): Promise<unknown | undefined>

  getAllRawStorageKeyValues(): Promise<{ key: string; value: unknown }[]>

  setRawStorageValue(key: string, value: string): Promise<void>

  removeRawStorageValue(key: string): Promise<void>

  removeAllRawStorageValues(): Promise<void>

  /**
   * On web platforms, databased created may be new.
   * New databases can be because of new sessions, or if the browser deleted it.
   * In this case, callers should orchestrate with the server to redownload all items
   * from scratch.
   * @returns { isNewDatabase } - True if the database was newly created
   */
  openDatabase(identifier: ApplicationIdentifier): Promise<{ isNewDatabase?: boolean } | undefined>

  /**
   * In a key/value database, this function returns just the keys.
   */
  getDatabaseKeys(): Promise<string[]>

  getAllRawDatabasePayloads<T extends FullyFormedTransferPayload = FullyFormedTransferPayload>(
    identifier: ApplicationIdentifier,
  ): Promise<T[]>

  saveRawDatabasePayload(payload: TransferPayload, identifier: ApplicationIdentifier): Promise<void>

  saveRawDatabasePayloads(payloads: TransferPayload[], identifier: ApplicationIdentifier): Promise<void>

  removeRawDatabasePayloadWithId(id: string, identifier: ApplicationIdentifier): Promise<void>

  removeAllRawDatabasePayloads(identifier: ApplicationIdentifier): Promise<void>

  getNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<NamespacedRootKeyInKeychain | undefined>

  setNamespacedKeychainValue(value: NamespacedRootKeyInKeychain, identifier: ApplicationIdentifier): Promise<void>

  clearNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<void>

  setLegacyRawKeychainValue(value: LegacyRawKeychainValue): Promise<void>

  clearRawKeychainValue(): Promise<void>

  openUrl(url: string): void

  performSoftReset(): void

  performHardReset(): void
}
