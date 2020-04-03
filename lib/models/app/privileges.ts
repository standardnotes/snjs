import { ItemMutator, MutationType } from './../../services/item_transformer';
import { PurePayload } from './../../protocol/payloads/pure_payload';
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

type PrivilegeMap = Partial<Record<ProtectedActions, PrivilegeCredential[]>>

/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 */
export class SNPrivileges extends SNItem {

  private readonly privilegeMap: PrivilegeMap = {}

  constructor(payload: PurePayload) {
    super(payload);
    this.privilegeMap = payload.safeContent.desktopPrivileges || {};
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SNPredicate(
      'content_type', '=',
      this.content_type!
    );
  }

  getCredentialsForAction(action: ProtectedActions) {
    return this.privilegeMap[action] || [];
  }

  isCredentialRequiredForAction(
    action: ProtectedActions,
    credential: PrivilegeCredential
  ) {
    const credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }
}

export class PrivilegeMutator extends ItemMutator {

  private readonly privileges: SNPrivileges
  private readonly privilegeMap: PrivilegeMap = {}

  constructor(item: SNItem, source: MutationType) {
    super(item, source);
    this.privileges = item as SNPrivileges;
    this.privilegeMap = this.payload.safeContent.desktopPrivileges || {};
  }

  getResult() {
    if(this.content) {
      this.content.desktopPrivileges = this.privilegeMap;
    }
    return super.getResult();
  }

  setCredentialsForAction(
    action: ProtectedActions,
    credentials: PrivilegeCredential[]
  ) {
    this.privilegeMap[action] = credentials;
  }

  toggleCredentialForAction(
    action: ProtectedActions,
    credential: PrivilegeCredential
  ) {
    if (this.privileges.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(
    action: ProtectedActions,
    credential: PrivilegeCredential
  ) {
    removeFromArray(this.privilegeMap[action]!, credential);
  }

  addCredentialForAction(
    action: ProtectedActions,
    credential: PrivilegeCredential
  ) {
    const credentials = this.privileges.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }
}