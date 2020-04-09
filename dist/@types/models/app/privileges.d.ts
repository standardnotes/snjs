import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNItem, ItemMutator, MutationType } from '../core/item';
import { SNPredicate } from '../core/predicate';
export declare enum ProtectedAction {
    ManageExtensions = "ActionManageExtensions",
    ManageBackups = "ActionManageBackups",
    ViewProtectedNotes = "ActionViewProtectedNotes",
    ManagePrivileges = "ActionManagePrivileges",
    ManagePasscode = "ActionManagePasscode",
    DeleteNote = "ActionDeleteNote"
}
export declare enum PrivilegeCredential {
    AccountPassword = "CredentialAccountPassword",
    LocalPasscode = "CredentialLocalPasscode"
}
/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 */
export declare class SNPrivileges extends SNItem {
    private readonly privilegeMap;
    constructor(payload: PurePayload);
    get isSingleton(): boolean;
    get singletonPredicate(): SNPredicate;
    getCredentialsForAction(action: ProtectedAction): PrivilegeCredential[];
    isCredentialRequiredForAction(action: ProtectedAction, credential: PrivilegeCredential): boolean;
}
export declare class PrivilegeMutator extends ItemMutator {
    private readonly privileges;
    private readonly privilegeMap;
    constructor(item: SNItem, source: MutationType);
    getResult(): PurePayload;
    setCredentialsForAction(action: ProtectedAction, credentials: PrivilegeCredential[]): void;
    toggleCredentialForAction(action: ProtectedAction, credential: PrivilegeCredential): void;
    removeCredentialForAction(action: ProtectedAction, credential: PrivilegeCredential): void;
    addCredentialForAction(action: ProtectedAction, credential: PrivilegeCredential): void;
}
