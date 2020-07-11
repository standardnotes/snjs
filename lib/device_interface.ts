import { getGlobalScope } from '@Lib/utils';

/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 * This avoids the need for platforms to override migrations directly.
 */
export abstract class DeviceInterface {

  public timeout: any
  public interval: any
  protected namespace: string
  protected keychainStorageKey: string

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
    namespace: string,
    timeout: any,
    interval: any
  ) {
    this.namespace = namespace;
    this.timeout = timeout || setTimeout.bind(getGlobalScope());
    this.interval = interval || setInterval.bind(getGlobalScope());
    this.keychainStorageKey = this.keyForKeychainStorage();
  }

  public deinit() {
    this.timeout = null;
    this.interval = null;
  }

  abstract async getRawStorageValue(key: string) : Promise<any>;

  public async getJsonParsedStorageValue(key: string) {
    const value = await this.getRawStorageValue(key);
    return value ? JSON.parse(value) : value;
  }

  abstract async getAllRawStorageKeyValues() : Promise<Record<string, any>[]>;

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

  abstract async getAllRawDatabasePayloads() : Promise<any[]>;

  abstract async saveRawDatabasePayload(payload: any) : Promise<void>;

  abstract async saveRawDatabasePayloads(payloads: any[]) : Promise<void>;

  abstract async removeRawDatabasePayloadWithId(id: string) : Promise<void>;

  abstract async removeAllRawDatabasePayloads() : Promise<void>;

  private keyForKeychainStorage() {
    const keychainStorageKey = 'keychain';
    if (this.namespace) {
      return `${this.namespace}-${keychainStorageKey}`;
    } else {
      return keychainStorageKey;
    }
  }

  abstract async getKeychainValue() : Promise<any>;

  abstract async setKeychainValue(value: any) : Promise<void>;

  abstract async clearKeychainValue() : Promise<void>;

  abstract openUrl(url: string): void;

}
