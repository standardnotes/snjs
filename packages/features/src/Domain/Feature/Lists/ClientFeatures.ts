import { ClientFeatureDescription } from '../FeatureDescription'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'

export function clientFeatures(): ClientFeatureDescription[] {
  return [
    {
      name: 'Tag Nesting',
      identifier: FeatureIdentifier.TagNesting,
      permission_name: PermissionName.TagNesting,
      description: 'Organize your tags into folders.',
    },
    {
      name: 'Smart Filters',
      identifier: FeatureIdentifier.SmartFilters,
      permission_name: PermissionName.SmartFilters,
      description: 'Create smart filters for viewing notes matching specific criteria.',
    },
    {
      name: 'Encrypted files (coming soon)',
      identifier: FeatureIdentifier.Files,
      permission_name: PermissionName.Files,
      description: '',
    },
    {
      name: 'Encrypted files beta',
      identifier: FeatureIdentifier.FilesBeta,
      permission_name: PermissionName.FilesBeta,
      description: '',
    },
    {
      name: 'Focus Mode',
      identifier: FeatureIdentifier.FocusMode,
      permission_name: PermissionName.FocusMode,
      description: '',
    },
    {
      name: 'Listed Custom Domain',
      identifier: FeatureIdentifier.ListedCustomDomain,
      permission_name: PermissionName.ListedCustomDomain,
      description: '',
    },
    {
      name: 'Multiple accounts',
      identifier: FeatureIdentifier.AccountSwitcher,
      permission_name: PermissionName.AccountSwitcher,
      description: '',
    },
  ]
}
