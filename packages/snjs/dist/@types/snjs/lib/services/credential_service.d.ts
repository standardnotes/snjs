import { SNProtectionService } from './protection_service';
import { SNRootKey } from '../../../protocol/root_key';
import { SNAlertService } from '../../../services/alert_service';
import { KeyParamsOrigination } from './../protocol/key_params';
import { HttpResponse, SignInResponse } from './api/responses';
import { SNProtocolService } from '../../../services/protocol_service';
import { ItemManager } from '../../../services/item_manager';
import { SNStorageService } from '../../../services/storage_service';
import { SNSyncService } from './sync/sync_service';
import { SNSessionManager } from './api/session_manager';
import { PureService } from '../../../services/pure_service';
import { ChallengeService } from './challenge/challenge_service';
export declare type CredentialsChangeFunctionResponse = {
    error?: {
        message: string;
    };
};
export declare type AccountServiceResponse = HttpResponse;
export declare const enum AccountEvent {
    SignedInOrRegistered = "SignedInOrRegistered"
}
export declare class SNCredentialService extends PureService<AccountEvent> {
    private sessionManager;
    private syncService;
    private storageService;
    private itemManager;
    private protocolService;
    private alertService;
    private challengeService;
    private protectionService;
    private signingIn;
    private registering;
    constructor(sessionManager: SNSessionManager, syncService: SNSyncService, storageService: SNStorageService, itemManager: ItemManager, protocolService: SNProtocolService, alertService: SNAlertService, challengeService: ChallengeService, protectionService: SNProtectionService);
    deinit(): void;
    /**
     *  @param mergeLocal  Whether to merge existing offline data into account. If false,
     *                     any pre-existing data will be fully deleted upon success.
     */
    register(email: string, password: string, ephemeral?: boolean, mergeLocal?: boolean): Promise<AccountServiceResponse>;
    /**
     * @param mergeLocal  Whether to merge existing offline data into account.
     * If false, any pre-existing data will be fully deleted upon success.
     */
    signIn(email: string, password: string, strict?: boolean, ephemeral?: boolean, mergeLocal?: boolean, awaitSync?: boolean): Promise<AccountServiceResponse>;
    /**
     * A sign in request that occurs while the user was previously signed in, to correct
     * for missing keys or storage values. Unlike regular sign in, this doesn't worry about
     * performing one of marking all items as needing sync or deleting all local data.
     */
    correctiveSignIn(rootKey: SNRootKey): Promise<HttpResponse | SignInResponse>;
    /**
     * @param passcode - Changing the account password or email requires the local
     * passcode if configured (to rewrap the account key with passcode). If the passcode
     * is not passed in, the user will be prompted for the passcode. However if the consumer
     * already has reference to the passcode, they can pass it in here so that the user
     * is not prompted again.
     */
    changeCredentials(parameters: {
        currentPassword: string;
        origination: KeyParamsOrigination;
        validateNewPasswordStrength: boolean;
        newEmail?: string;
        newPassword?: string;
        passcode?: string;
    }): Promise<CredentialsChangeFunctionResponse>;
    signOut(): Promise<void>;
    performProtocolUpgrade(): Promise<{
        success?: true;
        canceled?: true;
        error?: {
            message: string;
        };
    }>;
    addPasscode(passcode: string): Promise<boolean>;
    removePasscode(): Promise<boolean>;
    /**
     * @returns whether the passcode was successfuly changed or not
     */
    changePasscode(newPasscode: string, origination?: KeyParamsOrigination): Promise<boolean>;
    private setPasscodeWithoutWarning;
    private removePasscodeWithoutWarning;
    /**
     * Allows items keys to be rewritten to local db on local credential status change,
     * such as if passcode is added, changed, or removed.
     * This allows IndexedDB unencrypted logs to be deleted
     * `deletePayloads` will remove data from backing store,
     * but not from working memory See:
     * https://github.com/standardnotes/desktop/issues/131
     */
    private rewriteItemsKeys;
    private lockSyncing;
    private unlockSyncing;
    private clearDatabase;
    private performCredentialsChange;
    private recomputeRootKeysForCredentialChange;
}
