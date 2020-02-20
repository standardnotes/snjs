import { PureService } from '@Lib/services/pure_service';
import { SFPrivileges } from '@Models/privileges/privileges';
import { SFPredicate } from '@Models/core/predicate';
import { StorageKeys } from '@Lib/storage_keys';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';

export const ProtectedActions = {
  ManageExtensions: 'ActionManageExtensions',
  ManageBackups: 'ActionManageBackups',
  ViewProtectedNotes: 'ActionViewProtectedNotes',
  ManagePrivileges: 'ActionManagePrivileges',
  ManagePasscode: 'ActionManagePasscode',
  DeleteNote: 'ActionDeleteNote',
};

export const PrivilegeCredentials = {
  AccountPassword: 'CredentialAccountPassword',
  LocalPasscode: 'CredentialLocalPasscode'
};

export const PRIVILEGE_SESSION_LENGTH_NONE = 0;
export const PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES = 300;
export const PRIVILEGE_SESSION_LENGTH_ONE_HOUR = 3600;
export const PRIVILEGE_SESSION_LENGTH_ONE_WEEK = 604800;

export class SNPrivilegesService extends PureService {
  constructor({
    modelManager,
    syncService,
    singletonManager,
    keyManager,
    storageService,
    sessionManager
  }) {
    if (!modelManager || !syncService || !singletonManager || !keyManager) {
      throw 'Invalid privileges manager construction.';
    }
    super();
    this.modelManager = modelManager;
    this.syncService = syncService;
    this.singletonManager = singletonManager;
    this.keyManager = keyManager;
    this.storageService = storageService;
    this.sessionManager = sessionManager;
    this.loadDefaults();
  }

  loadDefaults() {
    this.availableActions = Object.keys(ProtectedActions).map((key) => {
      return ProtectedActions[key];
    });

    this.availableCredentials = [
      PrivilegeCredentials.AccountPassword,
      PrivilegeCredentials.LocalPasscode
    ];

    this.sessionLengths = [
      PRIVILEGE_SESSION_LENGTH_NONE,
      PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES,
      PRIVILEGE_SESSION_LENGTH_ONE_HOUR,
      PRIVILEGE_SESSION_LENGTH_ONE_WEEK
    ];
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
    for (const credential of credentials) {
      if (credential === PrivilegeCredentials.AccountPassword) {
        const isOnline = await this.sessionManager.online();
        if (isOnline) {
          netCredentials.push(credential);
        }
      } else if (credential === PrivilegeCredentials.LocalPasscode) {
        const hasPasscode = await this.keyManager.hasRootKeyWrapper();
        if (hasPasscode) {
          netCredentials.push(credential);
        }
      }
    }
    return netCredentials;
  }

  async getPrivileges() {
    const contentType = SFPrivileges.contentType();
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
    return this.syncService.sync();
  }

  async setSessionLength(length) {
    const addSecondsToNow = function (seconds) {
      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    };

    const expiresAt = addSecondsToNow(length);
    await this.storageService.setValue(
      StorageKeys.PrivilegesExpirey,
      expiresAt
    );
    await this.storageService.setValue(
      StorageKeys.PrivilegesSessionLength,
      length
    );
  }

  async clearSession() {
    return this.setSessionLength(PRIVILEGE_SESSION_LENGTH_NONE);
  }

  async getSelectedSessionLength() {
    const length = await this.storageService.getValue(
      StorageKeys.PrivilegesSessionLength
    );
    if (length) {
      return length;
    } else {
      return PRIVILEGE_SESSION_LENGTH_NONE;
    }
  }

  async getSessionExpirey() {
    const expiresAt = await this.storageService.getValue(
      StorageKeys.PrivilegesExpirey
    );
    if (expiresAt) {
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
    if (expiresAt > new Date()) {
      return false;
    }
    const netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async authenticateAction(action, credentialAuthMapping) {
    const requiredCredentials = await this.netCredentialsForAction(action);
    const successfulCredentials = [];
    const failedCredentials = [];
    for (const credential of requiredCredentials) {
      const passesAuth = await this.verifyAuthenticationParameters(
        credential,
        credentialAuthMapping[credential]
      );
      if (passesAuth) {
        successfulCredentials.push(credential);
      } else {
        failedCredentials.push(credential);
      }
    }
    return {
      success: failedCredentials.length === 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    };
  }

  async verifyAuthenticationParameters(credential, value) {
    if (credential === PrivilegeCredentials.AccountPassword) {
      return this.keyManager.validateAccountPassword(value);
    } else if (credential === PrivilegeCredentials.LocalPasscode) {
      return this.keyManager.validatePasscode(value);
    }
  }

  displayInfoForCredential(credential) {
    const metadata = {};
    metadata[PrivilegeCredentials.AccountPassword] = {
      label: "Account Password",
      prompt: "Please enter your account password."
    };
    metadata[PrivilegeCredentials.LocalPasscode] = {
      label: "Local Passcode",
      prompt: "Please enter your local passcode."
    };
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
    };
    metadata[ProtectedActions.DeleteNote] = {
      label: "Delete Notes"
    };
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
    ];
  }
}
