import { Feature } from './Feature'
import { DockIconType } from './DockIconType'
import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { Flag } from './Flag'
import { PermissionName } from '../Permission/PermissionName'


/*

import { Feature } from './Feature'
import { DockIconType } from './DockIconType'
import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { Flag } from './Flag'
import { PermissionName } from '../Permission/PermissionName'

import featuresFromJson from './features.json'
const features: Feature[] = []

type TFeatureItemFromJson = typeof featuresFromJson[0]

const validateFeatureItem = (featureItem: TFeatureItemFromJson) => {
  const { identifier, contentType, area, flags, dockIcon } = featureItem
  const permissionNames = Object.values(PermissionName)
  const contentTypes = Object.values(ContentType)
  const componentArea = Object.values(ComponentArea)
  const flagTypes = Object.values(Flag)
  const dockIconTypes = Object.values(DockIconType)

  if (!permissionNames.includes(identifier as PermissionName)) {
    throw Error('Invalid feature identifier')
  }
  if (!contentTypes.includes(contentType as ContentType)) {
    throw Error('Invalid feature content type')
  }
  if (area && !componentArea.includes(area as ComponentArea)) {
    throw Error('Invalid feature area')
  }
  if (flags && flags.some((flag) => !flagTypes.includes(flag as Flag))) {
    throw Error('Invalid feature flag')
  }
  if (dockIcon && !dockIconTypes.includes(dockIcon.type as DockIconType)) {
    throw Error('Invalid dock icon type')
  }
}

for (const featureItem of featuresFromJson) {
  validateFeatureItem(featureItem)
  features.push(featureItem as Feature)
}

export const Features: Feature[] = features


*/


import { Feature } from './Feature'
import { DockIconType } from './DockIconType'
import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { Flag } from './Flag'
import { PermissionName } from '../Permission/PermissionName'
import { FeatureIdentifier } from './FeatureIdentifier'

export const Features: Feature[] = [{
  name: 'Midnight',
  identifier: FeatureIdentifier.MidnightTheme,
  permissionName: PermissionName.MidnightTheme,
  contentType: ContentType.Theme,
  version: '1.2.2',
  description: 'Elegant utilitarianism.',
  url: '#{url_prefix}/themes/midnight',
  downloadUrl: 'https://github.com/standardnotes/midnight-theme/archive/1.2.2.zip',
  marketingUrl: 'https://standardnotes.org/extensions/midnight',
  thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/midnight-with-mobile.jpg',
  dockIcon: {
    type: DockIconType.Circle,
    backgroundColor: '#086DD6',
    foregroundColor: '#ffffff',
    borderColor: '#086DD6',
  },
},
  {
    name: 'Futura',
    identifier: FeatureIdentifier.FuturaTheme,
    permissionName: PermissionName.FuturaTheme,
    contentType: ContentType.Theme,
    version: '1.2.2',
    description: 'Calm and relaxed. Take some time off.',
    url: '#{url_prefix}/themes/futura',
    downloadUrl: 'https://github.com/standardnotes/futura-theme/archive/1.2.2.zip',
    marketingUrl: 'https://standardnotes.org/extensions/futura',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/futura-with-mobile.jpg',
    dockIcon: {
      type: DockIconType.Circle,
      backgroundColor: '#fca429',
      foregroundColor: '#ffffff',
      borderColor: '#fca429',
    },
  },
  {
    name: 'Solarized Dark',
    identifier: FeatureIdentifier.SolarizedDarkTheme,
    permissionName: PermissionName.SolarizedDarkTheme,
    contentType: ContentType.Theme,
    version: '1.2.1',
    description: 'The perfect theme for any time.',
    url: '#{url_prefix}/themes/solarized-dark',
    downloadUrl: 'https://github.com/standardnotes/solarized-dark-theme/archive/1.2.1.zip',
    marketingUrl: 'https://standardnotes.org/extensions/solarized-dark',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/solarized-dark.jpg',
    dockIcon: {
      type: DockIconType.Circle,
      backgroundColor: '#2AA198',
      foregroundColor: '#ffffff',
      borderColor: '#2AA198',
    },
  },
  {
    name: 'Autobiography',
    identifier: FeatureIdentifier.AutobiographyTheme,
    permissionName: PermissionName.AutobiographyTheme,
    contentType: ContentType.Theme,
    version: '1.0.0',
    description: 'A theme for writers and readers.',
    url: '#{url_prefix}/themes/autobiography',
    downloadUrl: 'https://github.com/standardnotes/autobiography-theme/archive/1.0.0.zip',
    marketingUrl: '',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/autobiography.jpg',
    flags: [Flag.New],
    dockIcon: {
      type: DockIconType.Circle,
      backgroundColor: '#9D7441',
      foregroundColor: '#ECE4DB',
      borderColor: '#9D7441',
    },
  },
  {
    name: 'Focus',
    identifier: FeatureIdentifier.FocusedTheme,
    permissionName: PermissionName.FocusedTheme,
    contentType: ContentType.Theme,
    version: '1.2.3',
    description: 'For when you need to go in.',
    url: '#{url_prefix}/themes/focus',
    downloadUrl: 'https://github.com/standardnotes/focus-theme/archive/1.2.3.zip',
    marketingUrl: 'https://standardnotes.org/extensions/focused',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/focus-with-mobile.jpg',
    dockIcon: {
      type: DockIconType.Circle,
      backgroundColor: '#a464c2',
      foregroundColor: '#ffffff',
      borderColor: '#a464c2',
    },
  },
  {
    identifier: FeatureIdentifier.TitaniumTheme,
    permissionName: PermissionName.TitaniumTheme,
    name: 'Titanium',
    contentType: ContentType.Theme,
    version: '1.2.2',
    description: 'Light on the eyes, heavy on the spirit.',
    url: '#{url_prefix}/themes/titanium',
    downloadUrl: 'https://github.com/standardnotes/titanium-theme/archive/1.2.2.zip',
    marketingUrl: 'https://standardnotes.org/extensions/titanium',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/titanium-with-mobile.jpg',
    dockIcon: {
      type: DockIconType.Circle,
      backgroundColor: '#6e2b9e',
      foregroundColor: '#ffffff',
      borderColor: '#6e2b9e',
    },
  },
  {
    name: 'Bold Editor',
    identifier: FeatureIdentifier.BoldEditor,
    permissionName: PermissionName.BoldEditor,
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.2.1',
    description: 'A simple and peaceful rich editor that helps you write and think clearly. Features FileSafe integration, so you can embed your encrypted images, videos, and audio recordings directly inline.',
    url: '#{url_prefix}/components/bold-editor',
    marketingUrl: '',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/bold.jpg',
    downloadUrl: 'https://github.com/standardnotes/bold-editor/archive/1.2.1.zip',
    flags: [Flag.New],
  },
  {
    identifier: FeatureIdentifier.PlusEditor,
    permissionName: PermissionName.PlusEditor,
    name: 'Plus Editor',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.5.0',
    description: 'From highlighting to custom font sizes and colors, to tables and lists, this editor is perfect for crafting any document.',
    url: '#{url_prefix}/components/plus-editor',
    downloadUrl: 'https://github.com/standardnotes/plus-editor/archive/1.5.0.zip',
    marketingUrl: 'https://standardnotes.org/extensions/plus-editor',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/plus-editor.jpg',
  },
  {
    identifier: FeatureIdentifier.MarkdownBasicEditor,
    permissionName: PermissionName.MarkdownBasicEditor,
    name: 'Markdown Basic',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.4.0',
    description: 'A Markdown editor with dynamic split-pane preview.',
    url: '#{url_prefix}/components/simple-markdown-editor',
    downloadUrl: 'https://github.com/standardnotes/markdown-basic/archive/1.4.0.zip',
    marketingUrl: 'https://standardnotes.org/extensions/simple-markdown-editor',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/simple-markdown.jpg',
  },
  {
    identifier: FeatureIdentifier.MarkdownProEditor,
    permissionName: PermissionName.MarkdownProEditor,
    name: 'Markdown Pro',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.14',
    description: 'A fully featured Markdown editor that supports live preview, a styling toolbar, and split pane support.',
    url: '#{url_prefix}/components/advanced-markdown-editor',
    downloadUrl: 'https://github.com/standardnotes/advanced-markdown-editor/archive/1.3.14.zip',
    marketingUrl: 'https://standardnotes.org/extensions/advanced-markdown',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/adv-markdown.jpg',
  },
  {
    identifier: FeatureIdentifier.MarkdownMinimistEditor,
    permissionName: PermissionName.MarkdownMinimistEditor,
    name: 'Markdown Minimist',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.7',
    description: 'A minimal Markdown editor with live rendering and in-text search via Ctrl/Cmd + F',
    url: '#{url_prefix}/components/minimal-markdown-editor',
    downloadUrl: 'https://github.com/standardnotes/minimal-markdown-editor/archive/1.3.7.zip',
    marketingUrl: 'https://standardnotes.org/extensions/minimal-markdown-editor',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/min-markdown.jpg',
  },
  {
    identifier: FeatureIdentifier.TaskEditor,
    permissionName: PermissionName.TaskEditor,
    name: 'Task Editor',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.7',
    description: 'A great way to manage short-term and long-term to-do\'s. You can mark tasks as completed, change their order, and edit the text naturally in place.',
    url: '#{url_prefix}/components/simple-task-editor',
    downloadUrl: 'https://github.com/standardnotes/simple-task-editor/archive/1.3.7.zip',
    marketingUrl: 'https://standardnotes.org/extensions/simple-task-editor',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/task-editor.jpg',
  },
  {
    identifier: FeatureIdentifier.CodeEditor,
    permissionName: PermissionName.CodeEditor,
    name: 'Code Editor',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.8',
    description: 'Syntax highlighting and convenient keyboard shortcuts for over 120 programming languages. Ideal for code snippets and procedures.',
    url: '#{url_prefix}/components/code-editor',
    downloadUrl: 'https://github.com/standardnotes/code-editor/archive/1.3.8.zip',
    marketingUrl: 'https://standardnotes.org/extensions/code-editor',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/code.jpg',
  },
  {
    identifier: FeatureIdentifier.TokenVaultEditor,
    permissionName: PermissionName.TokenVaultEditor,
    name: 'TokenVault',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '2.0.1',
    description: 'Encrypt and protect your 2FA secrets for all your internet accounts. TokenVault handles your 2FA secrets so that you never lose them again, or have to start over when you get a new device.',
    url: '#{url_prefix}/components/token-vault',
    marketingUrl: '',
    downloadUrl: 'https://github.com/standardnotes/token-vault/archive/2.0.1.zip',
    thumbnailUrl: 'https://standard-notes.s3.amazonaws.com/screenshots/models/editors/token-vault.png',
    flags: [Flag.New],
  },
  {
    identifier: FeatureIdentifier.SheetsEditor,
    permissionName: PermissionName.SheetsEditor,
    name: 'Secure Spreadsheets',
    contentType: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.4.0',
    description: 'A powerful spreadsheet editor with formatting and formula support. Not recommended for large data sets, as encryption of such data may decrease editor performance.',
    url: '#{url_prefix}/components/standard-sheets',
    marketingUrl: '',
    downloadUrl: 'https://github.com/standardnotes/secure-spreadsheets/archive/1.4.0.zip',
    thumbnailUrl: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/spreadsheets.png',
  },
  {
    identifier: FeatureIdentifier.TwoFactorAuthManager,
    permissionName: PermissionName.TwoFactorAuthManager,
    name: '2FA Manager',
    description: 'Configure two-factor authentication to add an extra level of security to your account.',
    version: '1.2.4',
    url: '#{url_prefix}/components/mfa-link',
    marketingUrl: '',
    downloadUrl: 'https://github.com/standardnotes/mfa-link/archive/1.2.4.zip',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
    noExpire: true,
    deletionWarning: 'Deleting 2FA Manager will not disable 2FA from your account. To disable 2FA, first open 2FA Manager, then follow the prompts.',
  },
  {
    identifier: FeatureIdentifier.TwoFactorAuth,
    permissionName: PermissionName.TwoFactorAuth,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.NoteHistoryUnlimited,
    permissionName: PermissionName.NoteHistoryUnlimited,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.NoteHistory365Days,
    permissionName: PermissionName.NoteHistory365Days,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.NoteHistory30Days,
    permissionName: PermissionName.NoteHistory30Days,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.DailyEmailBackup,
    permissionName: PermissionName.DailyEmailBackup,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.DailyDropboxBackup,
    permissionName: PermissionName.DailyDropboxBackup,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.DailyGDriveBackup,
    permissionName: PermissionName.DailyGDriveBackup,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.DailyOneDriveBackup,
    permissionName: PermissionName.DailyOneDriveBackup,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.Files25GB,
    permissionName: PermissionName.Files25GB,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.Files5GB,
    permissionName: PermissionName.Files5GB,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.TagNesting,
    permissionName: PermissionName.TagNesting,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.Files,
    permissionName: PermissionName.Files,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.CloudLink,
    permissionName: PermissionName.CloudLink,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  },
  {
    identifier: FeatureIdentifier.ListedCustomDomain,
    permissionName: PermissionName.ListedCustomDomain,
    name: '',
    description: '',
    version: '',
    url: '',
    marketingUrl: '',
    downloadUrl: '',
    contentType: ContentType.Component,
    area: ComponentArea.Modal,
  }]
