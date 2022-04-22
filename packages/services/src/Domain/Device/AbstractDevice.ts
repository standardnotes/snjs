/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationIdentifier } from '@standardnotes/common'
import { TransferPayload } from '@standardnotes/models'
import { getGlobalScope, isNullOrUndefined } from '@standardnotes/utils'
import { DeviceInterface } from './DeviceInterface'

/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 * This avoids the need for platforms to override migrations directly.
 */
/* istanbul ignore file */
export abstract class AbstractDevice implements DeviceInterface {
  public interval: any
  public timeout: any

  /**
    * @param {function} timeout
       A platform-specific function that is fed functions to run
       when other operations have completed. This is similar to
       setImmediate on the web, or setTimeout(fn, 0).
    * @param {function} interval
       A platform-specific function that is fed functions to
       perform repeatedly. Similar to setInterval.
  */
  constructor(timeout: any, interval: any) {
    this.timeout = timeout || setTimeout.bind(getGlobalScope())
    this.interval = interval || setInterval.bind(getGlobalScope())
  }

  public deinit(): void {
    this.timeout = undefined
    this.interval = undefined
  }

  public cancelTimeout(timeout: unknown): void {
    clearTimeout(timeout as any)
  }

  abstract getRawStorageValue(key: string): Promise<string | undefined>

  /**
   * Gets the parsed raw storage value.
   * The return value from getRawStorageValue could be an object.
   * This is most likely the case for legacy values.
   * So we return the value as-is if JSON.parse throws an exception.
   */
  public async getJsonParsedRawStorageValue(key: string): Promise<unknown | undefined> {
    const value = await this.getRawStorageValue(key)
    if (isNullOrUndefined(value)) {
      return undefined
    }
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }

  abstract getAllRawStorageKeyValues(): Promise<{ key: string; value: unknown }[]>

  abstract setRawStorageValue(key: string, value: any): Promise<void>

  abstract removeRawStorageValue(key: string): Promise<void>

  abstract removeAllRawStorageValues(): Promise<void>

  /**
   * On web platforms, databased created may be new.
   * New databases can be because of new sessions, or if the browser deleted it.
   * In this case, callers should orchestrate with the server to redownload all items
   * from scratch.
   * @returns { isNewDatabase } - True if the database was newly created
   */
  abstract openDatabase(identifier: ApplicationIdentifier): Promise<{ isNewDatabase?: boolean } | undefined>

  abstract getAllRawDatabasePayloads<T extends TransferPayload = TransferPayload>(
    identifier: ApplicationIdentifier,
  ): Promise<T[]>

  abstract saveRawDatabasePayload(payload: any, identifier: ApplicationIdentifier): Promise<void>

  abstract saveRawDatabasePayloads(payloads: any[], identifier: ApplicationIdentifier): Promise<void>

  abstract removeRawDatabasePayloadWithId(id: string, identifier: ApplicationIdentifier): Promise<void>

  abstract removeAllRawDatabasePayloads(identifier: ApplicationIdentifier): Promise<void>

  abstract getNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<any>

  /** Allows SNJS to set the top level keychain value */
  abstract legacy_setRawKeychainValue(value: any): Promise<void>

  abstract setNamespacedKeychainValue(value: any, identifier: ApplicationIdentifier): Promise<void>

  abstract clearNamespacedKeychainValue(identifier: ApplicationIdentifier): Promise<void>

  abstract getRawKeychainValue(): Promise<Record<string, any> | undefined | null>

  abstract clearRawKeychainValue(): Promise<void>

  abstract openUrl(url: string): void
}
