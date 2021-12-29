import { Challenge, ChallengeReason } from '../challenges';
import { ChallengeService } from './challenge/challenge_service';
import { PureService } from './pure_service';
import { SNNote } from '../models';
import { SNProtocolService } from './protocol_service';
import { SNStorageService } from './storage_service';
import { ApplicationStage } from '../stages';
import { ItemManager } from './item_manager';
export declare enum ProtectionEvent {
    UnprotectedSessionBegan = "UnprotectedSessionBegan",
    UnprotectedSessionExpired = "UnprotectedSessionExpired"
}
export declare const ProposedSecondsToDeferUILevelSessionExpirationDuringActiveInteraction = 30;
export declare enum UnprotectedAccessSecondsDuration {
    OneMinute = 60,
    FiveMinutes = 300,
    OneHour = 3600,
    OneWeek = 604800
}
export declare function isValidProtectionSessionLength(number: unknown): boolean;
export declare const ProtectionSessionDurations: {
    valueInSeconds: UnprotectedAccessSecondsDuration;
    label: string;
}[];
/**
 * Enforces certain actions to require extra authentication,
 * like viewing a protected note, as well as managing how long that
 * authentication should be valid for.
 */
export declare class SNProtectionService extends PureService<ProtectionEvent> {
    private protocolService;
    private challengeService;
    private storageService;
    private itemManager;
    private sessionExpiryTimeout;
    constructor(protocolService: SNProtocolService, challengeService: ChallengeService, storageService: SNStorageService, itemManager: ItemManager);
    deinit(): void;
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    hasProtectionSources(): boolean;
    hasUnprotectedAccessSession(): boolean;
    hasBiometricsEnabled(): boolean;
    enableBiometrics(): Promise<boolean>;
    disableBiometrics(): Promise<boolean>;
    createLaunchChallenge(): Challenge | undefined;
    protectNote(note: SNNote): Promise<SNNote>;
    unprotectNote(note: SNNote): Promise<SNNote | undefined>;
    authorizeProtectedActionForNotes(notes: SNNote[], challengeReason: ChallengeReason): Promise<SNNote[]>;
    protectNotes(notes: SNNote[]): Promise<SNNote[]>;
    unprotectNotes(notes: SNNote[]): Promise<SNNote[]>;
    authorizeNoteAccess(note: SNNote): Promise<boolean>;
    authorizeAddingPasscode(): Promise<boolean>;
    authorizeChangingPasscode(): Promise<boolean>;
    authorizeRemovingPasscode(): Promise<boolean>;
    authorizeSearchingProtectedNotesText(): Promise<boolean>;
    authorizeFileImport(): Promise<boolean>;
    authorizeBackupCreation(encrypted: boolean): Promise<boolean>;
    authorizeMfaDisable(): Promise<boolean>;
    authorizeAutolockIntervalChange(): Promise<boolean>;
    authorizeSessionRevoking(): Promise<boolean>;
    authorizeCloudLinkAccess(): Promise<boolean>;
    private validateOrRenewSession;
    getSessionExpiryDate(): Date;
    clearSession(): Promise<void>;
    private setSessionExpiryDate;
    private getLastSessionLength;
    private setSessionLength;
    private updateSessionExpiryTimer;
}
