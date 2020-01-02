export const API_MESSAGE_GENERIC_INVALID_LOGIN     = "A server error occurred while trying to sign in. Please try again.";
export const API_MESSAGE_GENERIC_REGISTRATION_FAIL = "A server error occurred while trying to register. Please try again.";
export const API_MESSAGE_GENERIC_CHANGE_PW_FAIL    = `Something went wrong while changing your password.
                                                      Your password was not changed. Please try again.`
export const API_MESSAGE_GENERIC_SYNC_FAIL         = "Could not connect to server.";

export const API_MESSAGE_REGISTRATION_IN_PROGRESS  = "An existing registration request is already in progress.";
export const API_MESSAGE_LOGIN_IN_PROGRESS         = "An existing sign in request is already in progress.";
export const API_MESSAGE_CHANGE_PW_IN_PROGRESS     = "An existing change password request is already in progress.";

export const API_MESSAGE_FAILBACK_LOGIN_FAIL       = "Invalid email or password."

export const UNSUPPORTED_PROTOCOL_VERSION          = `This version of the application does not support your
                                                      newer account type. Please upgrade to the latest version
                                                      of Standard Notes to sign in.`

export const EXPIRED_PROTOCOL_VERSION              = `The protocol version associated with your account is
                                                      outdated and no longer supported by this application.
                                                      Please visit standardnotes.org/help/security for more
                                                      information.`

export const OUTDATED_PROTOCOL_VERSION             = `The encryption version for your account is outdated and
                                                      requires upgrade. You may proceed with login, but are
                                                      advised to perform a security update using the web or
                                                      desktop application. Please visit
                                                      standardnotes.org/help/security for more information.`

export const UNSUPPORTED_PASSWORD_COST             = `Your account was created on a platform with higher security
                                                      capabilities than this browser supports. If we attempted
                                                      to generate your login keys here, it would take hours. Please
                                                      use a browser with more up to date security capabilities,
                                                      like Google Chrome or Firefox, to log in.`

export const INVALID_PASSWORD_COST                 = `Unable to login due to insecure password parameters.
                                                      Please visit standardnotes.org/help/security for
                                                      more information.`

export const OUTDATED_PROTOCOL_ALERT_TITLE         = "Update Recommended"
export const OUTDATED_PROTOCOL_ALERT_IGNORE        = "Sign In"

export function InsufficientPasswordMessage(minimum) {
  return `
          Your password must be at least ${minimum} characters in length.
          For your security, please choose a longer password or,
          ideally, a passphrase, and try again.
         `
}

export function StrictSignInFailed(current, latest) {
  return `
          Strict sign in refused server sign in parameters.
          The latest security version is ${latest}, but your account is
          reported to have version ${current}. If you'd like to proceed
          with sign in anyway, please disable strict sign in and try again.`

          `
}
