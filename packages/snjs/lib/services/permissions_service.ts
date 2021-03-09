import { Permission, Role } from '@standardnotes/auth';
import { PureService } from './pure_service';

const permissionsChanged = 'permissionsChanged';

export type PermissionsChangeEvent = typeof permissionsChanged;

export class SNPermissionsService extends PureService<
  PermissionsChangeEvent,
  Set<Permission>
> {
  private role = Role.User;
  private permissions = new Set<Permission>();

  hasPermission(permission: Permission): boolean {
    return this.permissions.has(permission);
  }

  update(role: Role, permissions: Permission[]): void {
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
    this.role = Role.User;
    (this.permissions as unknown) = undefined;
  }
}
