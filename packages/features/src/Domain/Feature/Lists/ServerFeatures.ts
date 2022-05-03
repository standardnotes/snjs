import { ServerFeatureDescription } from '../FeatureDescription'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'

export function serverFeatures(): ServerFeatureDescription[] {
  return [
    {
      name: 'Two factor authentication',
      identifier: FeatureIdentifier.TwoFactorAuth,
      permission_name: PermissionName.TwoFactorAuth,
    },
    {
      name: 'Unlimited note history',
      identifier: FeatureIdentifier.NoteHistoryUnlimited,
      permission_name: PermissionName.NoteHistoryUnlimited,
    },
    {
      name: '365 days note history',
      identifier: FeatureIdentifier.NoteHistory365Days,
      permission_name: PermissionName.NoteHistory365Days,
    },
    {
      name: '30 days note history',
      identifier: FeatureIdentifier.NoteHistory30Days,
      permission_name: PermissionName.NoteHistory30Days,
    },
    {
      name: 'Email backups',
      identifier: FeatureIdentifier.DailyEmailBackup,
      permission_name: PermissionName.DailyEmailBackup,
    },
    {
      name: 'Sign-in email alerts',
      identifier: FeatureIdentifier.SignInAlerts,
      permission_name: PermissionName.SignInAlerts,
    },
    {
      identifier: FeatureIdentifier.DailyDropboxBackup,
      permission_name: PermissionName.DailyDropboxBackup,
    },
    {
      identifier: FeatureIdentifier.DailyGDriveBackup,
      permission_name: PermissionName.DailyGDriveBackup,
    },
    {
      identifier: FeatureIdentifier.DailyOneDriveBackup,
      permission_name: PermissionName.DailyOneDriveBackup,
    },
    {
      identifier: FeatureIdentifier.FilesMaximumStorageTier,
      permission_name: PermissionName.FilesMaximumStorageTier,
    },
    {
      identifier: FeatureIdentifier.FilesLowStorageTier,
      permission_name: PermissionName.FilesLowStorageTier,
    },
  ]
}
