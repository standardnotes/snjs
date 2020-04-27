import { protocolManager } from '@Protocol/manager';
import { SFPrivileges } from '@Models/privileges/privileges'
import { SFPredicate } from '@Models/core/predicate'
import { isReactNativeEnvironment } from "@Lib/utils";

export class SFPrivilegesManager {

  constructor(modelManager, syncManager, singletonManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;

    this.loadPrivileges();

    SFPrivilegesManager.CredentialAccountPassword = "CredentialAccountPassword";
    SFPrivilegesManager.CredentialLocalPasscode = "CredentialLocalPasscode";

    SFPrivilegesManager.ActionManageExtensions = "ActionManageExtensions";
    SFPrivilegesManager.ActionManageBackups = "ActionManageBackups";
    SFPrivilegesManager.ActionViewProtectedNotes = "ActionViewProtectedNotes";
    SFPrivilegesManager.ActionManagePrivileges = "ActionManagePrivileges";
    SFPrivilegesManager.ActionManagePasscode = "ActionManagePasscode";
    SFPrivilegesManager.ActionDeleteNote = "ActionDeleteNote";

    SFPrivilegesManager.SessionExpiresAtKey = "SessionExpiresAtKey";
    SFPrivilegesManager.SessionLengthKey = "SessionLengthKey";

    SFPrivilegesManager.SessionLengthNone = 0;
    SFPrivilegesManager.SessionLengthFiveMinutes = 300;
    SFPrivilegesManager.SessionLengthOneHour = 3600;
    SFPrivilegesManager.SessionLengthOneWeek = 604800;

    this.availableActions = [
      SFPrivilegesManager.ActionViewProtectedNotes,
      SFPrivilegesManager.ActionDeleteNote,
      SFPrivilegesManager.ActionManagePasscode,
      SFPrivilegesManager.ActionManageBackups,
      SFPrivilegesManager.ActionManageExtensions,
      SFPrivilegesManager.ActionManagePrivileges,
    ]

    this.availableCredentials = [
      SFPrivilegesManager.CredentialAccountPassword,
      SFPrivilegesManager.CredentialLocalPasscode
    ];

    this.sessionLengths = [
      SFPrivilegesManager.SessionLengthNone,
      SFPrivilegesManager.SessionLengthFiveMinutes,
      SFPrivilegesManager.SessionLengthOneHour,
      SFPrivilegesManager.SessionLengthOneWeek,
      SFPrivilegesManager.SessionLengthIndefinite
    ]
  }

  /*
  async delegate.isOffline()
  async delegate.hasLocalPasscode()
  async delegate.saveToStorage(key, value)
  async delegate.getFromStorage(key)
  async delegate.verifyAccountPassword
  async delegate.verifyLocalPasscode
  */
  setDelegate(delegate) {
    this.delegate = delegate;
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }

  async netCredentialsForAction(action) {
    let credentials = (await this.getPrivileges()).getCredentialsForAction(action);
    let netCredentials = [];

    for(var cred of credentials) {
      if(cred == SFPrivilegesManager.CredentialAccountPassword) {
        let isOffline = await this.delegate.isOffline();
        if(!isOffline) {
          netCredentials.push(cred);
        }
      } else if(cred == SFPrivilegesManager.CredentialLocalPasscode) {
        let hasLocalPasscode = await this.delegate.hasLocalPasscode();
        if(hasLocalPasscode) {
          netCredentials.push(cred);
        }
      }
    }

    return netCredentials;
  }

  async loadPrivileges() {
    if(this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      let privsContentType = SFPrivileges.contentType();
      let contentTypePredicate = new SFPredicate("content_type", "=", privsContentType);
      this.singletonManager.registerSingleton([contentTypePredicate], (resolvedSingleton) => {
        this.privileges = resolvedSingleton;
        resolve(resolvedSingleton);
      }, async (valueCallback) => {
        // Safe to create. Create and return object.
        var privs = new SFPrivileges({content_type: privsContentType});
        if(isReactNativeEnvironment() || !protocolManager.crypto.generateUUIDSync) {
          // If syncrounous implementaiton of UUID generation is not available (i.e mobile),
          // we need to manually init uuid asyncronously
          await privs.initUUID();
        }
        this.modelManager.addItem(privs);
        this.modelManager.setItemDirty(privs, true);
        this.syncManager.sync();
        valueCallback(privs);
        resolve(privs);
      });
    });

    return this.loadPromise;
  }

  async getPrivileges() {
    if(this.privileges) {
      return this.privileges;
    } else {
      return this.loadPrivileges();
    }
  }

  displayInfoForCredential(credential) {
    let metadata = {}

    metadata[SFPrivilegesManager.CredentialAccountPassword] = {
      label: "Account Password",
      prompt: "Please enter your account password."
    }

    metadata[SFPrivilegesManager.CredentialLocalPasscode] = {
      label: "Local Passcode",
      prompt: "Please enter your local passcode."
    }

    return metadata[credential];
  }

  displayInfoForAction(action) {
    let metadata = {};

    metadata[SFPrivilegesManager.ActionManageExtensions] = {
      label: "Manage Extensions"
    };

    metadata[SFPrivilegesManager.ActionManageBackups] = {
      label: "Download/Import Backups"
    };

    metadata[SFPrivilegesManager.ActionViewProtectedNotes] = {
      label: "View Protected Notes"
    };

    metadata[SFPrivilegesManager.ActionManagePrivileges] = {
      label: "Manage Privileges"
    };

    metadata[SFPrivilegesManager.ActionManagePasscode] = {
      label: "Manage Passcode"
    }

    metadata[SFPrivilegesManager.ActionDeleteNote] = {
      label: "Delete Notes"
    }

    return metadata[action];
  }

  getSessionLengthOptions() {
    return [
      {
        value: SFPrivilegesManager.SessionLengthNone,
        label: "Don't Remember"
      },
      {
        value: SFPrivilegesManager.SessionLengthFiveMinutes,
        label: "5 Minutes"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneHour,
        label: "1 Hour"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneWeek,
        label: "1 Week"
      }
    ]
  }

  async setSessionLength(length) {
    let addToNow = (seconds) => {
      let date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    }

    let expiresAt = addToNow(length);

    return Promise.all([
      this.delegate.saveToStorage(SFPrivilegesManager.SessionExpiresAtKey, JSON.stringify(expiresAt)),
      this.delegate.saveToStorage(SFPrivilegesManager.SessionLengthKey, JSON.stringify(length))
    ])
  }

  async clearSession() {
    return this.setSessionLength(SFPrivilegesManager.SessionLengthNone);
  }

  async getSelectedSessionLength() {
    let length = await this.delegate.getFromStorage(SFPrivilegesManager.SessionLengthKey);
    if(length) {
      return JSON.parse(length);
    } else {
      return SFPrivilegesManager.SessionLengthNone;
    }
  }

  async getSessionExpirey() {
    let expiresAt = await this.delegate.getFromStorage(SFPrivilegesManager.SessionExpiresAtKey);
    if(expiresAt) {
      return new Date(JSON.parse(expiresAt));
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }

  async actionRequiresPrivilege(action) {
    let expiresAt = await this.getSessionExpirey();
    if(expiresAt > new Date()) {
      return false;
    }
    let netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async savePrivileges() {
    let privs = await this.getPrivileges();
    this.modelManager.setItemDirty(privs, true);
    this.syncManager.sync();
  }

  async authenticateAction(action, credentialAuthMapping) {
    var requiredCredentials = (await this.netCredentialsForAction(action));
    var successfulCredentials = [], failedCredentials = [];

    for(let requiredCredential of requiredCredentials) {
      var passesAuth = await this._verifyAuthenticationParameters(requiredCredential, credentialAuthMapping[requiredCredential]);
      if(passesAuth) {
        successfulCredentials.push(requiredCredential);
      } else {
        failedCredentials.push(requiredCredential);
      }
    }

    return {
      success: failedCredentials.length == 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    }
  }

  async _verifyAuthenticationParameters(credential, value) {

    let verifyAccountPassword = async (password) => {
      return this.delegate.verifyAccountPassword(password);
    }

    let verifyLocalPasscode = async (passcode) => {
      return this.delegate.verifyLocalPasscode(passcode);
    }

    if(credential == SFPrivilegesManager.CredentialAccountPassword) {
      return verifyAccountPassword(value);
    } else if(credential == SFPrivilegesManager.CredentialLocalPasscode) {
      return verifyLocalPasscode(value);
    }
  }
}
