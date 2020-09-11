import { ProtocolVersion } from '@Protocol/versions';
export const API_MESSAGE_GENERIC_INVALID_LOGIN     = 'A server error occurred while trying to sign in. Please try again.';
export const API_MESSAGE_GENERIC_REGISTRATION_FAIL = 'A server error occurred while trying to register. Please try again.';
export const API_MESSAGE_GENERIC_CHANGE_PW_FAIL    = `Something went wrong while changing your password. Your password was not changed. Please try again.`;
export const API_MESSAGE_GENERIC_SYNC_FAIL         = 'Could not connect to server.';

export const API_MESSAGE_REGISTRATION_IN_PROGRESS  = 'An existing registration request is already in progress.';
export const API_MESSAGE_LOGIN_IN_PROGRESS         = 'An existing sign in request is already in progress.';
export const API_MESSAGE_CHANGE_PW_IN_PROGRESS     = 'An existing change password request is already in progress.';

export const API_MESSAGE_FALLBACK_LOGIN_FAIL       = 'Invalid email or password.';

export const API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL= `A server error occurred while trying to refresh your session. Please try again.`;

export const API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS = `Your account session is being renewed with the server. Please try your request again.`;

export const API_MESSAGE_INVALID_SESSION           = 'Please sign in to an account in order to continue with your request.';

export const UNSUPPORTED_PROTOCOL_VERSION          = `This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.`;

export const EXPIRED_PROTOCOL_VERSION              = `The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.`;

export const OUTDATED_PROTOCOL_VERSION             = `The encryption version for your account is outdated and requires upgrade. You may proceed with login, but areadvised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.`;

export const UNSUPPORTED_KEY_DERIVATION             = `Your account was created on a platform with higher security capabilities than this browser supports. If we attempted to generate your login keys here, it would take hours. Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.`;

export const INVALID_PASSWORD_COST                 = `Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.`;
export const INVALID_PASSWORD                      = `Invalid password.`;

export const OUTDATED_PROTOCOL_ALERT_TITLE         = 'Update Recommended';
export const OUTDATED_PROTOCOL_ALERT_IGNORE        = 'Sign In';
export const UPGRADING_ENCRYPTION                  = `Upgrading your account's encryption version…`;

export const SETTING_PASSCODE                      = `Setting passcode…`;
export const CHANGING_PASSCODE                     = `Changing passcode…`;
export const REMOVING_PASSCODE                     = `Removing passcode…`;

export const DO_NOT_CLOSE_APPLICATION              = 'Do not close the application until this process completes.';

export function InsufficientPasswordMessage(minimum: number) {
  return `Your password must be at least ${minimum} characters in length. For your security, please choose a longer password or, ideally, a passphrase, and try again.`;
}

export function StrictSignInFailed(current: ProtocolVersion, latest: ProtocolVersion) {
  return `Strict Sign In has refused the server's sign-in parameters. The latest account version is ${latest}, but the server is reporting a version of ${current} for your account. If you'd like to proceed with sign in anyway, please disable Strict Sign In and try again.`;
}

export const UNSUPPORTED_BACKUP_FILE_VERSION = `This backup file was created using a newer version of the application and cannot be imported here. Please update your application and try again.`;
export const BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT = `This backup file was created using a newer encryption version than your account's. Please run the available encryption upgrade and try again.`;
