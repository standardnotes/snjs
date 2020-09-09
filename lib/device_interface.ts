import { getGlobalScope } from '@Lib/utils';
import { SNNamespace } from '@Services/namespace_service';

/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 * This avoids the need for platforms to override migrations directly.
 */
export abstract class DeviceInterface {

  public timeout: any
  public interval: any
  protected namespace?: SNNamespace

  /**
    * @param {function} timeout
       A platform-specific function that is fed functions to run
       when other operations have completed. This is similar to
       setImmediate on the web, or setTimeout(fn, 0).
    * @param {function} interval
       A platform-specific function that is fed functions to
       perform repeatedly. Similar to setInterval.
  */
  constructor(
    timeout: any,
    interval: any
  ) {
    this.timeout = timeout || setTimeout.bind(getGlobalScope());
    this.interval = interval || setInterval.bind(getGlobalScope());
  }

  public deinit() {
    this.timeout = null;
    this.interval = null;
  }

  abstract async getRawStorageValue(key: string) : Promise<any>;

  /**
   * Gets the parsed raw storage value.
   * The return value from getRawStorageValue could be an object.
   * This is most likely the case for legacy values.
   * So we return the value as-is if JSON.parse throws an exception.
   */
  public async getJsonParsedStorageValue(key: string) {
    const value = await this.getRawStorageValue(key);
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

  abstract async getAllRawStorageKeyValues() : Promise<{ key: string, value: unknown }[]>;

  abstract async setRawStorageValue(key: string, value: any) : Promise<void>;

  abstract async removeRawStorageValue(key: string) : Promise<void>;

  abstract async removeAllRawStorageValues() : Promise<void>;

  /**
   * On web platforms, databased created may be new.
   * New databases can be because of new sessions, or if the browser deleted it.
   * In this case, callers should orchestrate with the server to redownload all items
   * from scratch.
   * @returns { isNewDatabase } - True if the database was newly created
   */
  abstract async openDatabase() : Promise<{ isNewDatabase?: boolean } | undefined>

  abstract async getAllRawDatabasePayloads() : Promise<unknown[]>;

  abstract async saveRawDatabasePayload(payload: any) : Promise<void>;

  abstract async saveRawDatabasePayloads(payloads: any[]) : Promise<void>;

  abstract async removeRawDatabasePayloadWithId(id: string) : Promise<void>;

  abstract async removeAllRawDatabasePayloads() : Promise<void>;

  abstract async getNamespacedKeychainValue() : Promise<any>;

  abstract async setNamespacedKeychainValue(value: any) : Promise<void>;

  abstract async clearNamespacedKeychainValue() : Promise<void>;

  abstract async getRawKeychainValue() : Promise<any>;

  abstract async clearRawKeychainValue() : Promise<void>;

  public setNamespace(namespace: SNNamespace) {
    this.namespace = namespace;
  }

  abstract openUrl(url: string): void;

}
