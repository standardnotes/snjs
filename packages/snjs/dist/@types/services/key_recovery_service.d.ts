import { SNCredentialService } from './credential_service';
import { SNSyncService } from './sync/sync_service';
import { ApplicationStage } from './../stages';
import { SNStorageService } from './storage_service';
import { PayloadManager } from './payload_manager';
import { SNAlertService } from './alert_service';
import { ChallengeService } from './challenge/challenge_service';
import { SNProtocolService } from './protocol_service';
import { SNApiService } from './api/api_service';
import { ItemManager } from './item_manager';
import { PureService } from './pure_service';
export declare class SNKeyRecoveryService extends PureService {
    private itemManager;
    private payloadManager;
    private apiService;
    private protocolService;
    private challengeService;
    private alertService;
    private storageService;
    private syncService;
    private credentialService;
    private removeItemObserver;
    private decryptionQueue;
    private serverParams?;
    private isProcessingQueue;
    constructor(itemManager: ItemManager, payloadManager: PayloadManager, apiService: SNApiService, protocolService: SNProtocolService, challengeService: ChallengeService, alertService: SNAlertService, storageService: SNStorageService, syncService: SNSyncService, credentialService: SNCredentialService);
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
    private handleIgnoredItemsKeys;
    private handleUndecryptableItemsKeys;
    processPersistedUndecryptables(): Promise<void>;
    private getUndecryptables;
    private persistUndecryptables;
    private saveToUndecryptables;
    private removeFromUndecryptables;
    private get queuePromise();
    private getClientKeyParams;
    private serverKeyParamsAreSafe;
    private performServerSignIn;
    private getWrappingKeyIfApplicable;
    private addKeysToQueue;
    private readdQueueItem;
    private beginProcessingQueue;
    private popQueueItem;
    private handleDecryptionOfAllKeysMatchingCorrectRootKey;
    private popQueueForKeyParams;
}
