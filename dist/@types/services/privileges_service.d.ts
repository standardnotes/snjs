import { ItemManager } from './item_manager';
import { SNSessionManager } from './api/session_manager';
import { SNStorageService } from './storage_service';
import { SNProtocolService } from './protocol_service';
import { SNSingletonManager } from './singleton_manager';
import { SNSyncService } from './sync/sync_service';
import { PureService } from './pure_service';
import { ProtectedAction, PrivilegeCredential, SNPrivileges } from '../models/app/privileges';
export declare enum PrivilegeSessionLength {
    None = 0,
    FiveMinutes = 300,
    OneHour = 3600,
    OneWeek = 604800
}
declare type CredentialAuthMapping = Partial<Record<PrivilegeCredential, string>>;
/**
 * Privileges allows certain actions within the application to require extra authentication.
 * For example, the privileges service exposes functions that allow the action of deleting
 * a note or viewing a note to require extra authentication.
 * Privileges are a superficial-level locking feature; they do not deal at all with underlying
 * data state. For example, viewing a protected note may require extra authentication,
 * but the underlying note data may already be decrypted in application memory, whether or not
 * the user has yet authenticated this action.
 */
export declare class SNPrivilegesService extends PureService {
    private itemManager?;
    private syncService?;
    private singletonManager?;
    private protocolService?;
    private storageService?;
    private sessionManager?;
    private availableActions;
    private availableCredentials;
    private sessionLengths;
    constructor(itemManager: ItemManager, syncService: SNSyncService, singletonManager: SNSingletonManager, protocolService: SNProtocolService, storageService: SNStorageService, sessionManager: SNSessionManager);
    deinit(): void;
    private loadDefaults;
    getAvailableActions(): ProtectedAction[];
    getAvailableCredentials(): PrivilegeCredential[];
    /**
     * The credentials currently required to perform this action.
     */
    netCredentialsForAction(action: ProtectedAction): Promise<PrivilegeCredential[]>;
    getPrivileges(): Promise<SNPrivileges>;
    savePrivileges(): Promise<any>;
    setSessionLength(length: PrivilegeSessionLength): Promise<void>;
    clearSession(): Promise<void>;
    getSelectedSessionLength(): Promise<any>;
    getSessionExpirey(): Promise<Date>;
    actionHasPrivilegesConfigured(action: ProtectedAction): Promise<boolean>;
    /**
     * Whether the action requires present authentication.
     */
    actionRequiresPrivilege(action: ProtectedAction): Promise<boolean>;
    authenticateAction(action: ProtectedAction, credentialAuthMapping: CredentialAuthMapping): Promise<{
        success: boolean;
        successfulCredentials: PrivilegeCredential[];
        failedCredentials: PrivilegeCredential[];
    }>;
    verifyAuthenticationParameters(credential: PrivilegeCredential, value: string): Promise<boolean | undefined>;
    displayInfoForCredential(credential: PrivilegeCredential): {
        label: string;
        prompt: string;
    } | {
        label: string;
        prompt: string;
    };
    displayInfoForAction(action: ProtectedAction): {
        label: string;
    } | {
        label: string;
    } | {
        label: string;
    } | {
        label: string;
    } | {
        label: string;
    } | {
        label: string;
    };
    getSessionLengthOptions(): {
        value: PrivilegeSessionLength;
        label: string;
    }[];
}
export {};
