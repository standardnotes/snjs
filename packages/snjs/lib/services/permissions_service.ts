import { Permissions, ROLES } from '@standardnotes/auth';
import { PureService } from './pure_service';

const permissionsChanged = 'permissionsChanged';

export type PermissionsChangeEvent = typeof permissionsChanged;

export class SNPermissionsService extends PureService<
  PermissionsChangeEvent,
  Set<Permissions>
> {
  private role = ROLES.USER;
  private permissions = new Set<Permissions>();

  constructor() {
    super();
  }

  hasPermission(permission: Permissions): boolean {
    return this.permissions.has(permission);
  }

  update(role: ROLES, permissions: Permissions[]): void {
    this.role = role;
    if (
      this.permissions.size !== permissions.length ||
      permissions.some((permission) => !this.permissions.has(permission))
    ) {
      this.permissions = new Set(permissions);
      void this.notifyEvent(permissionsChanged, this.permissions);
    }
  }

  deinit(): void {
    this.role = ROLES.USER;
    (this.permissions as unknown) = undefined;
  }
}
