/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 * This avoids the need for platforms to override migrations directly.
 */
export declare abstract class DeviceInterface {
    timeout: any;
    interval: any;
    protected namespace: string;
    /**
      * @param {function} timeout
         A platform-specific function that is fed functions to run
         when other operations have completed. This is similar to
         setImmediate on the web, or setTimeout(fn, 0).
      * @param {function} interval
         A platform-specific function that is fed functions to
         perform repeatedly. Similar to setInterval.
    */
    constructor(namespace: string, timeout: any, interval: any);
    deinit(): void;
    abstract getRawStorageValue(key: string): Promise<any>;
    getJsonParsedStorageValue(key: string): Promise<any>;
    abstract getAllRawStorageKeyValues(): Promise<Record<string, any>[]>;
    abstract setRawStorageValue(key: string, value: any): Promise<void>;
    abstract removeRawStorageValue(key: string): Promise<void>;
    abstract removeAllRawStorageValues(): Promise<void>;
    /**
     * On web platforms, databased created may be new.
     * New databases can be because of new sessions, or if the browser deleted it.
     * In this case, callers should orchestrate with the server to redownload all items
     * from scratch.
     * @returns { isNewDatabase } - True if the database was newly created
     */
    abstract openDatabase(): Promise<{
        isNewDatabase?: boolean;
    } | undefined>;
    abstract getAllRawDatabasePayloads(): Promise<any[]>;
    abstract saveRawDatabasePayload(payload: any): Promise<void>;
    abstract saveRawDatabasePayloads(payloads: any[]): Promise<void>;
    abstract removeRawDatabasePayloadWithId(id: string): Promise<void>;
    abstract removeAllRawDatabasePayloads(): Promise<void>;
    abstract getKeychainValue(): Promise<any>;
    abstract setKeychainValue(value: any): Promise<void>;
    abstract clearKeychainValue(): Promise<void>;
    abstract openUrl(url: string): void;
}
