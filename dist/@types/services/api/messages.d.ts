import { SNRootKeyParams } from './../../protocol/key_params';
import { ProtocolVersion } from '../../protocol/versions';
export declare const API_MESSAGE_GENERIC_INVALID_LOGIN = "A server error occurred while trying to sign in. Please try again.";
export declare const API_MESSAGE_GENERIC_REGISTRATION_FAIL = "A server error occurred while trying to register. Please try again.";
export declare const API_MESSAGE_GENERIC_CHANGE_PW_FAIL = "Something went wrong while changing your password. Your password was not changed. Please try again.";
export declare const API_MESSAGE_GENERIC_SYNC_FAIL = "Could not connect to server.";
export declare const API_MESSAGE_REGISTRATION_IN_PROGRESS = "An existing registration request is already in progress.";
export declare const API_MESSAGE_LOGIN_IN_PROGRESS = "An existing sign in request is already in progress.";
export declare const API_MESSAGE_CHANGE_PW_IN_PROGRESS = "An existing change password request is already in progress.";
export declare const API_MESSAGE_FALLBACK_LOGIN_FAIL = "Invalid email or password.";
export declare const API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL = "A server error occurred while trying to refresh your session. Please try again.";
export declare const API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS = "Your account session is being renewed with the server. Please try your request again.";
export declare const API_MESSAGE_INVALID_SESSION = "Please sign in to an account in order to continue with your request.";
export declare const UNSUPPORTED_PROTOCOL_VERSION = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
export declare const EXPIRED_PROTOCOL_VERSION = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
export declare const OUTDATED_PROTOCOL_VERSION = "The encryption version for your account is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.";
export declare const UNSUPPORTED_KEY_DERIVATION = "Your account was created on a platform with higher security capabilities than this browser supports. If we attempted to generate your login keys here, it would take hours. Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.";
export declare const INVALID_PASSWORD_COST = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
export declare const INVALID_PASSWORD = "Invalid password.";
export declare const OUTDATED_PROTOCOL_ALERT_TITLE = "Update Recommended";
export declare const OUTDATED_PROTOCOL_ALERT_IGNORE = "Sign In";
export declare const UPGRADING_ENCRYPTION = "Upgrading your account's encryption version\u2026";
export declare const SETTING_PASSCODE = "Setting passcode\u2026";
export declare const CHANGING_PASSCODE = "Changing passcode\u2026";
export declare const REMOVING_PASSCODE = "Removing passcode\u2026";
export declare const DO_NOT_CLOSE_APPLICATION = "Do not close the application until this process completes.";
export declare const UNKNOWN_ERROR = "Unknown error.";
export declare function InsufficientPasswordMessage(minimum: number): string;
export declare function StrictSignInFailed(current: ProtocolVersion, latest: ProtocolVersion): string;
export declare const UNSUPPORTED_BACKUP_FILE_VERSION = "This backup file was created using a newer version of the application and cannot be imported here. Please update your application and try again.";
export declare const BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT = "This backup file was created using a newer encryption version than your account's. Please run the available encryption upgrade and try again.";
export declare const PasswordChangeStrings: {
    PasscodeRequired: string;
    Failed: string;
};
export declare const RegisterStrings: {
    PasscodeRequired: string;
};
export declare const SignInStrings: {
    PasscodeRequired: string;
    IncorrectMfa: string;
    SignInCanceledMissingMfa: string;
};
export declare const ProtocolUpgradeStrings: {
    SuccessAccount: string;
    SuccessPasscodeOnly: string;
    Fail: string;
    UpgradingPasscode: string;
};
export declare const KeyRecoveryStrings: {
    KeyRecoveryLoginFlowPrompt: (keyParams: SNRootKeyParams) => string;
    KeyRecoveryLoginFlowReason: string;
    KeyRecoveryLoginFlowInvalidPassword: string;
    KeyRecoveryRootKeyReplaced: string;
    KeyRecoveryPasscodeRequiredTitle: string;
    KeyRecoveryPasscodeRequiredText: string;
    KeyRecoveryPasswordRequired: string;
    KeyRecoveryKeyRecovered: string;
    KeyRecoveryUnableToRecover: string;
};
export declare const ChallengeModalTitle: {
    Generic: string;
    Migration: string;
};
export declare const SessionStrings: {
    EnterEmailAndPassword: string;
    RecoverSession(email?: string | undefined): string;
    SessionRestored: string;
    EnterMfa: string;
    MfaInputPlaceholder: string;
    EmailInputPlaceholder: string;
    PasswordInputPlaceholder: string;
    KeychainRecoveryErrorTitle: string;
    KeychainRecoveryError: string;
};
export declare const ChallengeStrings: {
    UnlockApplication: string;
    EnterAccountPassword: string;
    EnterLocalPasscode: string;
    EnterPasscodeForMigration: string;
    EnterPasscodeForRootResave: string;
    EnterCredentialsForProtocolUpgrade: string;
    AccountPasswordPlaceholder: string;
    LocalPasscodePlaceholder: string;
};
export declare const PromptTitles: {
    AccountPassword: string;
    LocalPasscode: string;
    Biometrics: string;
};
export declare const ErrorAlertStrings: {
    MissingSessionTitle: string;
    MissingSessionBody: string;
    StorageDecryptErrorTitle: string;
    StorageDecryptErrorBody: string;
};
export declare const KeychainRecoveryStrings: {
    Title: string;
    Text: string;
};
