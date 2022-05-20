import { ThemeFeatureDescription } from '../FeatureDescription'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'
import { FillThemeComponentDefaults } from './Utilities/FillThemeComponentDefaults'
import { SubscriptionName } from '@standardnotes/common'

export function themes(): ThemeFeatureDescription[] {
  const midnight: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Midnight',
    identifier: FeatureIdentifier.MidnightTheme,
    permission_name: PermissionName.MidnightTheme,
    version: '1.2.7',
    description: 'Elegant utilitarianism.',
    git_repo_url: 'https://github.com/standardnotes/midnight-theme',
    marketing_url: 'https://standardnotes.com/extensions/midnight',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/midnight-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#086DD6',
      foreground_color: '#ffffff',
      border_color: '#086DD6',
    },
  })

  const futura: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Futura',
    identifier: FeatureIdentifier.FuturaTheme,
    permission_name: PermissionName.FuturaTheme,
    version: '1.2.8',
    description: 'Calm and relaxed. Take some time off.',
    git_repo_url: 'https://github.com/standardnotes/futura-theme',
    marketing_url: 'https://standardnotes.com/extensions/futura',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/futura-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#fca429',
      foreground_color: '#ffffff',
      border_color: '#fca429',
    },
  })

  const solarizedDark: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Solarized Dark',
    identifier: FeatureIdentifier.SolarizedDarkTheme,
    permission_name: PermissionName.SolarizedDarkTheme,
    version: '1.2.6',
    description: 'The perfect theme for any time.',
    git_repo_url: 'https://github.com/standardnotes/solarized-dark-theme',
    marketing_url: 'https://standardnotes.com/extensions/solarized-dark',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/solarized-dark.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#2AA198',
      foreground_color: '#ffffff',
      border_color: '#2AA198',
    },
  })

  const autobiography: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Autobiography',
    identifier: FeatureIdentifier.AutobiographyTheme,
    permission_name: PermissionName.AutobiographyTheme,
    version: '1.0.3',
    description: 'A theme for writers and readers.',
    git_repo_url: 'https://github.com/standardnotes/autobiography-theme',
    marketing_url: '',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/autobiography.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#9D7441',
      foreground_color: '#ECE4DB',
      border_color: '#9D7441',
    },
  })

  const focus: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Focus',
    identifier: FeatureIdentifier.FocusedTheme,
    permission_name: PermissionName.FocusedTheme,
    version: '1.2.8',
    description: 'For when you need to go in.',
    git_repo_url: 'https://github.com/standardnotes/focus-theme',
    marketing_url: 'https://standardnotes.com/extensions/focused',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/focus-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#a464c2',
      foreground_color: '#ffffff',
      border_color: '#a464c2',
    },
  })

  const titanium: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Titanium',
    version: '1.2.6',
    identifier: FeatureIdentifier.TitaniumTheme,
    permission_name: PermissionName.TitaniumTheme,
    description: 'Light on the eyes, heavy on the spirit.',
    git_repo_url: 'https://github.com/standardnotes/titanium-theme',
    marketing_url: 'https://standardnotes.com/extensions/titanium',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/titanium-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#6e2b9e',
      foreground_color: '#ffffff',
      border_color: '#6e2b9e',
    },
  })

  const dynamic: ThemeFeatureDescription = FillThemeComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Dynamic Panels',
    identifier: FeatureIdentifier.DynamicTheme,
    permission_name: PermissionName.ThemeDynamic,
    layerable: true,
    no_mobile: true,
    version: '1.0.4',
    description: 'A smart theme that minimizes the tags and notes panels when they are not in use.',
    git_repo_url: 'https://github.com/standardnotes/dynamic-theme',
    marketing_url: 'https://standardnotes.com/extensions/dynamic',
  })

  return [midnight, futura, solarizedDark, autobiography, focus, titanium, dynamic]
}
