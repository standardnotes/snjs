import { RoleName } from '@standardnotes/auth';
export interface UserRolesChangedEventPayload {
    userUuid: string;
    email: string;
    currentRoles: RoleName[];
    timestamp: number;
}
