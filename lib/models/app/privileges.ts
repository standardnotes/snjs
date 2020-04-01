import { removeFromArray } from '@Lib/utils';
import { SNItem } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { SNPredicate } from '@Models/core/predicate';

export enum ProtectedActions {
  ManageExtensions = 'ActionManageExtensions',
  ManageBackups = 'ActionManageBackups',
  ViewProtectedNotes = 'ActionViewProtectedNotes',
  ManagePrivileges = 'ActionManagePrivileges',
  ManagePasscode = 'ActionManagePasscode',
  DeleteNote = 'ActionDeleteNote',
};

export enum PrivilegeCredential {
  AccountPassword = 'CredentialAccountPassword',
  LocalPasscode = 'CredentialLocalPasscode'
};

/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 */
export class SNPrivileges extends SNItem {
  
  mapContentToLocalProperties(content: PayloadContent) {
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

  setCredentialsForAction(action: ProtectedActions, credentials: PrivilegeCredential[]) {
    this.content.desktopPrivileges[action] = credentials;
  }

  getCredentialsForAction(action: ProtectedActions): PrivilegeCredential[] {
    return this.content.desktopPrivileges[action] || [];
  }

  toggleCredentialForAction(action: ProtectedActions, credential: PrivilegeCredential) {
    if(this.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action: ProtectedActions, credential: PrivilegeCredential) {
    removeFromArray(this.content.desktopPrivileges[action], credential);
  }

  addCredentialForAction(action: ProtectedActions, credential: PrivilegeCredential) {
    const credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action: ProtectedActions, credential: PrivilegeCredential) {
    const credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }
}
