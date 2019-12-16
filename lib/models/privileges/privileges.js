import pull from 'lodash/pull';

import { SFItem } from '../core/item'

export class SFPrivileges extends SFItem {

  static contentType() {
    // It has prefix SN since it was originally imported from SN codebase
    return "SN|Privileges";
  }

  constructor(json_obj) {
    super(json_obj);

    if(!this.content.desktopPrivileges) {
      this.content.desktopPrivileges = {};
    }
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
    var credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action, credential) {
    var credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }

}
