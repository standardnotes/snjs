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
/**
 * The key recovery service listens to items key changes to detect any that cannot be decrypted.
 * If it detects an items key that is not properly decrypted, it will present a key recovery
 * wizard (using existing UI like Challenges and AlertService) that will attempt to recover
 * the root key for those keys.
 *
 * When we encounter an items key we cannot decrypt, this is a sign that the user's password may
 * have recently changed (even though their session is still valid). If the user has been
 * previously signed in, we take this opportunity to reach out to the server to get the
 * user's current key_params. We ensure these key params' version is equal to or greater than our own.

 * - If this key's key params are equal to the retrieved parameters,
    and this keys created date is greater than any existing valid items key,
    or if we do not have any items keys:
       1. Use the decryption of this key as a source of validation
       2. If valid, replace our local root key with this new root key and emit the decrypted items key
 * - Else, if the key params are not equal,
     or its created date is less than an existing valid items key
        1. Attempt to decrypt this key using its attached key paramas
        2. If valid, emit decrypted items key. DO NOT replace local root key.
 * - If by the end we did not find an items key with matching key params to the retrieved
     key params, AND the retrieved key params are newer than what we have locally, we must
     issue a sign in request to the server.

 * If the user is not signed in and we detect an undecryptable items key, we present a detached
 * recovery wizard that doesn't affect our local root key.
 *
 * When an items key is emitted, protocol service will automatically try to decrypt any
 * related items that are in an errored state.
 */
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
    constructor(itemManager: ItemManager, modelManager: PayloadManager, apiService: SNApiService, sessionManager: SNSessionManager, protocolService: SNProtocolService, challengeService: ChallengeService, alertService: SNAlertService, storageService: SNStorageService);
    deinit(): void;
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
    handleIgnoredItemsKeys(keys: SNItemsKey[]): Promise<void>;
    handleUndecryptableItemsKeys(keys: SNItemsKey[]): Promise<void>;
    performServerSignIn(keyParams: SNRootKeyParams): Promise<void>;
    /**
     * When we've successfully validated a root key that matches server params,
     * we replace our current client root key with the newly generated key
     */
    replaceClientRootKey(rootKey: SNRootKey): Promise<void>;
    getWrappingKeyIfApplicable(): Promise<SNRootKey | undefined>;
    /** A detached recovery does not affect our local items key */
    tryDecryptingKeys(keys: SNItemsKey[]): Promise<void>;
    /**
     * If this function succeeds, it will emit the items key, and
     * return the decrypted key payload, as well as the root key used to decrypt the key.
     * If it fails, it will keep trying until the user aborts.
     */
    tryDecryptingKey(key: SNItemsKey): Promise<{
        rootKey?: SNRootKey;
        success: boolean;
    }>;
}
