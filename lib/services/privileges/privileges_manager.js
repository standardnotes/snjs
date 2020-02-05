import { PureService } from '@Lib/services/pure_service';
import { SFItem } from '@Models/core/item';
import { SFPrivileges } from '@Models/privileges/privileges';
import { SFPredicate } from '@Models/core/predicate';
import {
  STORAGE_KEY_PRIVILEGES_EXPIREY,
  STORAGE_KEY_PRIVILEGES_SESSION_LENGTH
} from '@Lib/storage_keys'

export const ProtectedActions = {
  ManageExtensions: 'ActionManageExtensions',
  ManageBackups: 'ActionManageBackups',
  ViewProtectedNotes: 'ActionViewProtectedNotes',
  ManagePrivileges: 'ActionManagePrivileges',
  ManagePasscode: 'ActionManagePasscode',
  DeleteNote: 'ActionDeleteNote',
}

export const PRIVILEGE_CREDENTIAL_ACCOUNT_PASSWORD = 'CredentialAccountPassword';
export const PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE   = 'CredentialLocalPasscode';

export const PRIVILEGE_SESSION_LENGTH_NONE         = 0;
export const PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES = 300;
export const PRIVILEGE_SESSION_LENGTH_ONE_HOUR     = 3600;
export const PRIVILEGE_SESSION_LENGTH_ONE_WEEK     = 604800;

export class SNPrivilegesManager extends PureService {
  constructor({
    modelManager,
    syncManager,
    singletonManager,
    keyManager,
    storageManager,
    sessionManager
  }) {
    if(!modelManager || !syncManager || !singletonManager || !keyManager) {
      throw 'Invalid privileges manager construction.';
    }
    super();
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;
    this.keyManager = keyManager;
    this.storageManager = storageManager;
    this.sessionManager = sessionManager;
    this.loadDefaults();
  }

  loadDefaults() {
    this.availableActions = Object.keys(ProtectedActions).map((key) => {
      return ProtectedActions[key];
    })

    this.availableCredentials = [
      PRIVILEGE_CREDENTIAL_ACCOUNT_PASSWORD,
      PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE
    ];

    this.sessionLengths = [
      PRIVILEGE_SESSION_LENGTH_NONE,
      PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES,
      PRIVILEGE_SESSION_LENGTH_ONE_HOUR,
      PRIVILEGE_SESSION_LENGTH_ONE_WEEK
    ]
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }

  /**
   * The credentials currently required to perform this action.
   */
  async netCredentialsForAction(action) {
    const privileges = await this.getPrivileges();
    const credentials = privileges.getCredentialsForAction(action);
    const netCredentials = [];
    for(const credential of credentials) {
      if(credential === PRIVILEGE_CREDENTIAL_ACCOUNT_PASSWORD) {
        const isOnline = await this.sessionManager.online();
        if(isOnline) {
          netCredentials.push(credential);
        }
      } else if(credential === PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE) {
        const hasPasscode = await this.keyManager.hasRootKeyWrapper();
        if(hasPasscode) {
          netCredentials.push(credential);
        }
      }
    }
    return netCredentials;
  }

  async getPrivileges() {
    const contentType = SFPrivileges.contentType()
    const predicate = new SFPredicate('content_type', '=', contentType);
    return this.singletonManager.findOrCreateSingleton({
      predicate: predicate,
      createPayload: CreateMaxPayloadFromAnyObject({
        object: {
          content_type: contentType,
          content: {}
        }
      })
    });
  }

  async savePrivileges() {
    const privileges = await this.getPrivileges();
    await this.modelManager.setItemDirty(privileges);
    return this.syncManager.sync();
  }

  async setSessionLength(length) {
    const addSecondsToNow = function(seconds) {
      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    }

    const expiresAt = addSecondsToNow(length);
    await this.storageManager.setValue(
      STORAGE_KEY_PRIVILEGES_EXPIREY,
      expiresAt
    );
    await this.storageManager.setValue(
      STORAGE_KEY_PRIVILEGES_SESSION_LENGTH,
      length
    );
  }

  async clearSession() {
    return this.setSessionLength(PRIVILEGE_SESSION_LENGTH_NONE);
  }

  async getSelectedSessionLength() {
    const length = await this.storageManager.getValue(
      STORAGE_KEY_PRIVILEGES_SESSION_LENGTH
    );
    if(length) {
      return length;
    } else {
      return PRIVILEGE_SESSION_LENGTH_NONE;
    }
  }

  async getSessionExpirey() {
    const expiresAt = await this.storageManager.getValue(
      STORAGE_KEY_PRIVILEGES_EXPIREY
    );
    if(expiresAt) {
      return new Date(expiresAt);
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }

  /**
   * Whether the action requires present authentication.
   */
  async actionRequiresPrivilege(action) {
    const expiresAt = await this.getSessionExpirey();
    if(expiresAt > new Date()) {
      return false;
    }
    const netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async authenticateAction(action, credentialAuthMapping) {
    const requiredCredentials = await this.netCredentialsForAction(action);
    const successfulCredentials = [], failedCredentials = [];
    for(const credential of requiredCredentials) {
      const passesAuth = await this.verifyAuthenticationParameters(
        credential,
        credentialAuthMapping[credential]
      );
      if(passesAuth) {
        successfulCredentials.push(credential);
      } else {
        failedCredentials.push(credential);
      }
    }
    return {
      success: failedCredentials.length == 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    }
  }

  async verifyAuthenticationParameters(credential, value) {
    if(credential == PRIVILEGE_CREDENTIAL_ACCOUNT_PASSWORD) {
      return this.keyManager.validateAccountPassword(value);
    } else if(credential == PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE) {
      return this.keyManager.validateLocalPasscode(value);
    }
  }

  displayInfoForCredential(credential) {
    const metadata = {}
    metadata[PRIVILEGE_CREDENTIAL_ACCOUNT_PASSWORD] = {
      label: "Account Password",
      prompt: "Please enter your account password."
    }
    metadata[PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE] = {
      label: "Local Passcode",
      prompt: "Please enter your local passcode."
    }
    return metadata[credential];
  }

  displayInfoForAction(action) {
    const metadata = {};
    metadata[ProtectedActions.ManageExtensions] = {
      label: "Manage Extensions"
    };
    metadata[ProtectedActions.ManageBackups] = {
      label: "Download/Import Backups"
    };
    metadata[ProtectedActions.ViewProtectedNotes] = {
      label: "View Protected Notes"
    };
    metadata[ProtectedActions.ManagePrivileges] = {
      label: "Manage Privileges"
    };
    metadata[ProtectedActions.ManagePasscode] = {
      label: "Manage Passcode"
    }
    metadata[ProtectedActions.DeleteNote] = {
      label: "Delete Notes"
    }
    return metadata[action];
  }

  getSessionLengthOptions() {
    return [
      {
        value: PRIVILEGE_SESSION_LENGTH_NONE,
        label: "Don't Remember"
      },
      {
        value: PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES,
        label: "5 Minutes"
      },
      {
        value: PRIVILEGE_SESSION_LENGTH_ONE_HOUR,
        label: "1 Hour"
      },
      {
        value: PRIVILEGE_SESSION_LENGTH_ONE_WEEK,
        label: "1 Week"
      }
    ]
  }
}
