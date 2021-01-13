import { PurePayload } from './../../protocol/payloads/pure_payload';
import { Copy, removeFromArray } from '@Lib/utils';
import { ItemMutator, MutationType, SNItem } from '@Models/core/item';
import { SNPredicate } from '@Models/core/predicate';

export enum ProtectedAction {
  ManageExtensions = 'ActionManageExtensions',
  ManageBackups = 'ActionManageBackups',
  ViewProtectedNotes = 'ActionViewProtectedNotes',
  ManagePrivileges = 'ActionManagePrivileges',
  ManagePasscode = 'ActionManagePasscode',
  DeleteNote = 'ActionDeleteNote',
}

export enum PrivilegeCredential {
  AccountPassword = 'CredentialAccountPassword',
  LocalPasscode = 'CredentialLocalPasscode'
}

type PrivilegeMap = Partial<Record<ProtectedAction, PrivilegeCredential[]>>

/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 *
 * @deprecated Privileges are now inferred based on the user's active
 * protections, like passcode or biometrics
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

  getCredentialsForAction(action: ProtectedAction) {
    return this.privilegeMap[action] || [];
  }

  isCredentialRequiredForAction(
    action: ProtectedAction,
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
    this.privilegeMap = Copy(this.payload.safeContent.desktopPrivileges || {});
  }

  getResult() {
    if(this.content) {
      this.content.desktopPrivileges = this.privilegeMap;
    }
    return super.getResult();
  }

  setCredentialsForAction(
    action: ProtectedAction,
    credentials: PrivilegeCredential[]
  ) {
    this.privilegeMap[action] = credentials;
  }

  toggleCredentialForAction(
    action: ProtectedAction,
    credential: PrivilegeCredential
  ) {
    if (this.privileges.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(
    action: ProtectedAction,
    credential: PrivilegeCredential
  ) {
    removeFromArray(this.privilegeMap[action]!, credential);
  }

  addCredentialForAction(
    action: ProtectedAction,
    credential: PrivilegeCredential
  ) {
    const credentials = this.privileges.getCredentialsForAction(action).slice();
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }
}
