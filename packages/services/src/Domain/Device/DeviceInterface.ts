/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransferPayload } from '@standardnotes/models'
import { ApplicationIdentifier } from '@standardnotes/common'

export interface DeviceInterface {
  interval: any
  timeout: any
  deinit(): void
  cancelTimeout(timeout: unknown): void
  getRawStorageValue(key: string): Promise<string | undefined>
  getJsonParsedRawStorageValue(key: string): Promise<unknown | undefined>
  getAllRawStorageKeyValues(): Promise<{ key: string; value: unknown }[]>
  setRawStorageValue(key: string, value: any): Promise<void>
  removeRawStorageValue(key: string): Promise<void>
  removeAllRawStorageValues(): Promise<void>
  openDatabase(identifier: ApplicationIdentifier): Promise<{ isNewDatabase?: boolean } | undefined>
  getAllRawDatabasePayloads<T extends TransferPayload = TransferPayload>(
    identifier: ApplicationIdentifier,
  ): Promise<T[]>
  saveRawDatabasePayload(payload: any, identifier: ApplicationIdentifier): Promise<void>
  saveRawDatabasePayloads(payloads: any[], identifier: ApplicationIdentifier): Promise<void>
  removeRawDatabasePayloadWithId(id: string, identifier: ApplicationIdentifier): Promise<void>
  removeAllRawDatabasePayloads(identifier: ApplicationIdentifier): Promise<void>
  getNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<any>
  legacy_setRawKeychainValue(value: any): Promise<void>
  setNamespacedKeychainValue(value: any, identifier: ApplicationIdentifier): Promise<void>
  clearNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<void>
  getRawKeychainValue(): Promise<Record<string, any> | undefined | null>
  clearRawKeychainValue(): Promise<void>
  openUrl(url: string): void
}
