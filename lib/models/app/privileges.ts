import pull from 'lodash/pull';
import { SNItem, ItemContent } from '@Models/core/item';
import { SNPredicate } from '@Models/core/predicate';

export enum ProtectedActions {
  ManageExtensions = 'ActionManageExtensions',
  ManageBackups = 'ActionManageBackups',
  ViewProtectedNotes = 'ActionViewProtectedNotes',
  ManagePrivileges = 'ActionManagePrivileges',
  ManagePasscode = 'ActionManagePasscode',
  DeleteNote = 'ActionDeleteNote',
};

export enum PrivilegeCredentials {
  AccountPassword = 'CredentialAccountPassword',
  LocalPasscode = 'CredentialLocalPasscode'
};

/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 */
export class SNPrivileges extends SNItem {
  
  mapContentToLocalProperties(content: ItemContent) {
    super.mapContentToLocalProperties(content);
      if(!this.errorDecrypting && !this.content.desktopPrivileges) {
        this.content.desktopPrivileges = {};
      }
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SNPredicate('content_type', '=', this.content_type);
  }

  setCredentialsForAction(action: ProtectedActions, credentials: PrivilegeCredentials) {
    this.content.desktopPrivileges[action] = credentials;
  }

  getCredentialsForAction(action: ProtectedActions) {
    return this.content.desktopPrivileges[action] || [];
  }

  toggleCredentialForAction(action: ProtectedActions, credential: PrivilegeCredentials) {
    if(this.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action: ProtectedActions, credential: PrivilegeCredentials) {
    pull(this.content.desktopPrivileges[action], credential);
  }

  addCredentialForAction(action: ProtectedActions, credential: PrivilegeCredentials) {
    const credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action: ProtectedActions, credential: PrivilegeCredentials) {
    const credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }
}
