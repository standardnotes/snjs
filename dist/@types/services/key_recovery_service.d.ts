import { ApplicationStage } from './../stages';
import { SNStorageService } from './storage_service';
import { SNRootKeyParams } from './../protocol/key_params';
import { SNSessionManager } from './api/session_manager';
import { PayloadManager } from './model_manager';
import { SNAlertService } from './alert_service';
import { ChallengeService } from './challenge/challenge_service';
import { SNRootKey } from '../protocol/root_key';
import { SNProtocolService } from './protocol_service';
import { SNApiService } from './api/api_service';
import { SNItemsKey } from './../models/app/items_key';
import { ItemManager } from './item_manager';
import { PureService } from './pure_service';
declare type DecryptionResponse = {
    success: boolean;
    rootKey?: SNRootKey;
};
declare type DecryptionQueueItem = {
    key: SNItemsKey;
    keyParams: SNRootKeyParams;
    resolve?: (result: DecryptionResponse) => void;
};
export declare class SNKeyRecoveryService extends PureService {
    private itemManager;
    private modelManager;
    private apiService;
    private sessionManager;
    private protocolService;
    private challengeService;
    private alertService;
    private storageService;
    private removeItemObserver;
    private decryptionQueue;
    private serverParams?;
    constructor(itemManager: ItemManager, modelManager: PayloadManager, apiService: SNApiService, sessionManager: SNSessionManager, protocolService: SNProtocolService, challengeService: ChallengeService, alertService: SNAlertService, storageService: SNStorageService);
    deinit(): void;
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    /**
     * Ignored items keys are items keys which arrived from a remote source, which we were
     * not able to decrypt, and for which we already had an existing items key that was
     * properly decrypted. Since items keys key contents are immutable, if we already have a
     * successfully decrypted version, yet we can't decrypt the new version, we should should
     * temporarily ignore the new version until we can properly decrypt it (through the recovery flow),
     * and not overwrite the local copy.
     *
     * Ignored items are persisted to disk in isolated storage so that they may be decrypted
     * whenever. When they are finally decryptable, we will emit them and update our database
     * with the new decrypted value.
     *
     * When the app first launches, we will query the isolated storage to see if there are any
     * keys we need to decrypt.
     */
    handleIgnoredItemsKeys(keys: SNItemsKey[], persistIncoming?: boolean): Promise<void>;
    private processPersistedUndecryptables;
    private getUndecryptables;
    private persistUndecryptables;
    private saveToUndecryptables;
    private removeFromUndecryptables;
    handleUndecryptableItemsKeys(keys: SNItemsKey[]): Promise<void>;
    getClientKeyParams(): Promise<SNRootKeyParams | undefined>;
    serverKeyParamsAreSafe(clientParams: SNRootKeyParams): boolean;
    performServerSignIn(keyParams: SNRootKeyParams): Promise<void>;
    /**
     * When we've successfully validated a root key that matches server params,
     * we replace our current client root key with the newly generated key
     */
    replaceClientRootKey(rootKey: SNRootKey): Promise<void>;
    getWrappingKeyIfApplicable(): Promise<SNRootKey | undefined>;
    addKeysToQueue(keys: SNItemsKey[]): Promise<void>;
    /** A detached recovery does not affect our local items key */
    tryDecryptingKeys(keys: SNItemsKey[]): Promise<void>;
    /**
     * If this function succeeds, it will emit the items key, and
     * return the decrypted key payload, as well as the root key used to decrypt the key.
     * If it fails, it will keep trying until the user aborts.
     */
    tryDecryptingKey(key: SNItemsKey): Promise<DecryptionResponse>;
    popQueueItem(queueItem: DecryptionQueueItem): Promise<void>;
    popQueueForKeyParams(keyParams: SNRootKeyParams): DecryptionQueueItem[];
}
export {};
