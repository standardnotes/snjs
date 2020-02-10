import pull from 'lodash/pull';
import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { SFPredicate } from '@Models/core/predicate';

export class SFPrivileges extends SFItem {

  static contentType() {
    return ContentTypes.Privileges;
  }

  constructor(payload) {
    super(payload);

    if(!this.errorDecrypting && !this.content.desktopPrivileges) {
      this.content.desktopPrivileges = {};
    }
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SFPredicate('content_type', '=', this.content_type);
  }

  setCredentialsForAction(action, credentials) {
    this.content.desktopPrivileges[action] = credentials;
  }

  getCredentialsForAction(action) {
    return this.content.desktopPrivileges[action] || [];
  }

  toggleCredentialForAction(action, credential) {
    if(this.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action, credential) {
    pull(this.content.desktopPrivileges[action], credential);
  }

  addCredentialForAction(action, credential) {
    const credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action, credential) {
    const credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }

}
