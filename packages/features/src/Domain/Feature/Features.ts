import { ComponentAction } from '../Component/ComponentAction';
import { ContentType } from '@standardnotes/common';
import {
  FeatureDescription,
  ThemeFeatureDescription,
  EditorFeatureDescription,
  ClientFeatureDescription,
  IframeComponentFeatureDescription,
  ServerFeatureDescription,
} from './FeatureDescription';
import { ComponentArea } from '../Component/ComponentArea';
import { PermissionName } from '../Permission/PermissionName';
import { FeatureIdentifier } from './FeatureIdentifier';
import { NoteType } from '../Component/NoteType';

export const Features: FeatureDescription[] = [
  ...themes(),
  ...editors(),
  ...nonEditorComponents(),
  ...serverFeatures(),
  ...clientFeatures(),
];

function themes(): ThemeFeatureDescription[] {
  const midnight: ThemeFeatureDescription = {
    name: 'Midnight',
    identifier: FeatureIdentifier.MidnightTheme,
    permission_name: PermissionName.MidnightTheme,
    content_type: ContentType.Theme,
    version: '1.2.4',
    index_path: 'dist/dist.css',
    description: 'Elegant utilitarianism.',
    url: '#{url_prefix}/themes/midnight',
    download_url:
      'https://github.com/standardnotes/midnight-theme/archive/1.2.4.zip',
    marketing_url: 'https://standardnotes.com/extensions/midnight',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/midnight-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#086DD6',
      foreground_color: '#ffffff',
      border_color: '#086DD6',
    },
  };

  const futura: ThemeFeatureDescription = {
    name: 'Futura',
    identifier: FeatureIdentifier.FuturaTheme,
    permission_name: PermissionName.FuturaTheme,
    index_path: 'dist/dist.css',
    content_type: ContentType.Theme,
    version: '1.2.4',
    description: 'Calm and relaxed. Take some time off.',
    url: '#{url_prefix}/themes/futura',
    download_url:
      'https://github.com/standardnotes/futura-theme/archive/1.2.4.zip',
    marketing_url: 'https://standardnotes.com/extensions/futura',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/futura-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#fca429',
      foreground_color: '#ffffff',
      border_color: '#fca429',
    },
  };

  const solarizedDark: ThemeFeatureDescription = {
    name: 'Solarized Dark',
    identifier: FeatureIdentifier.SolarizedDarkTheme,
    permission_name: PermissionName.SolarizedDarkTheme,
    index_path: 'dist/dist.css',
    content_type: ContentType.Theme,
    version: '1.2.3',
    description: 'The perfect theme for any time.',
    url: '#{url_prefix}/themes/solarized-dark',
    download_url:
      'https://github.com/standardnotes/solarized-dark-theme/archive/1.2.3.zip',
    marketing_url: 'https://standardnotes.com/extensions/solarized-dark',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/solarized-dark.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#2AA198',
      foreground_color: '#ffffff',
      border_color: '#2AA198',
    },
  };

  const autobiography: ThemeFeatureDescription = {
    name: 'Autobiography',
    identifier: FeatureIdentifier.AutobiographyTheme,
    permission_name: PermissionName.AutobiographyTheme,
    index_path: 'dist/dist.css',
    content_type: ContentType.Theme,
    version: '1.0.1',
    description: 'A theme for writers and readers.',
    url: '#{url_prefix}/themes/autobiography',
    download_url:
      'https://github.com/standardnotes/autobiography-theme/archive/1.0.1.zip',
    marketing_url: '',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/autobiography.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#9D7441',
      foreground_color: '#ECE4DB',
      border_color: '#9D7441',
    },
  };

  const focus: ThemeFeatureDescription = {
    name: 'Focus',
    identifier: FeatureIdentifier.FocusedTheme,
    permission_name: PermissionName.FocusedTheme,
    index_path: 'dist/dist.css',
    content_type: ContentType.Theme,
    version: '1.2.5',
    description: 'For when you need to go in.',
    url: '#{url_prefix}/themes/focus',
    download_url:
      'https://github.com/standardnotes/focus-theme/archive/1.2.5.zip',
    marketing_url: 'https://standardnotes.com/extensions/focused',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/focus-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#a464c2',
      foreground_color: '#ffffff',
      border_color: '#a464c2',
    },
  };

  const titanium: ThemeFeatureDescription = {
    identifier: FeatureIdentifier.TitaniumTheme,
    permission_name: PermissionName.TitaniumTheme,
    index_path: 'dist/dist.css',
    name: 'Titanium',
    content_type: ContentType.Theme,
    version: '1.2.4',
    description: 'Light on the eyes, heavy on the spirit.',
    url: '#{url_prefix}/themes/titanium',
    download_url:
      'https://github.com/standardnotes/titanium-theme/archive/1.2.4.zip',
    marketing_url: 'https://standardnotes.com/extensions/titanium',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/titanium-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#6e2b9e',
      foreground_color: '#ffffff',
      border_color: '#6e2b9e',
    },
  };

  const dynamic: ThemeFeatureDescription = {
    identifier: FeatureIdentifier.DynamicTheme,
    name: 'Dynamic',
    permission_name: PermissionName.ThemeDynamic,
    index_path: 'dist/dist.css',
    content_type: ContentType.Theme,
    layerable: true,
    no_mobile: true,
    version: '1.0.0',
    description:
      'A smart theme that minimizes the tags and notes panels when they are not in use.',
    url: '#{url_prefix}/themes/dynamic',
    download_url:
      'https://github.com/standardnotes/dynamic-theme/archive/1.0.0.zip',
    marketing_url: 'https://standardnotes.com/extensions/dynamic',
  };

  return [
    midnight,
    futura,
    solarizedDark,
    autobiography,
    focus,
    titanium,
    dynamic,
  ];
}

function editors(): EditorFeatureDescription[] {
  const code: EditorFeatureDescription = {
    name: 'Code Editor',
    note_type: NoteType.Code,
    file_type: 'txt',
    interchangeable: true,
    identifier: FeatureIdentifier.CodeEditor,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.CodeEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.8',
    description:
      'Syntax highlighting and convenient keyboard shortcuts for over 120 programming languages. Ideal for code snippets and procedures.',
    url: '#{url_prefix}/components/code-editor',
    download_url:
      'https://github.com/standardnotes/code-editor/archive/1.3.8.zip',
    marketing_url: 'https://standardnotes.com/extensions/code-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/code.jpg',
  };

  const bold: EditorFeatureDescription = {
    name: 'Bold Editor',
    note_type: NoteType.RichText,
    file_type: 'html',
    interchangeable: true,
    identifier: FeatureIdentifier.BoldEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
      {
        name: ComponentAction.StreamItems,
        content_types: [
          ContentType.FilesafeCredentials,
          ContentType.FilesafeFileMetadata,
          ContentType.FilesafeIntegration,
        ],
      },
    ],
    permission_name: PermissionName.BoldEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.2.10',
    description:
      'A simple and peaceful rich editor that helps you write and think clearly. Features FileSafe integration, so you can embed your encrypted images, videos, and audio recordings directly inline.',
    url: '#{url_prefix}/components/bold-editor',
    marketing_url: '',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/bold.jpg',
    download_url:
      'https://github.com/standardnotes/bold-editor/archive/1.2.10.zip',
  };

  const plus: EditorFeatureDescription = {
    name: 'Plus Editor',
    note_type: NoteType.RichText,
    file_type: 'html',
    interchangeable: true,
    identifier: FeatureIdentifier.PlusEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.PlusEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.5.0',
    description:
      'From highlighting to custom font sizes and colors, to tables and lists, this editor is perfect for crafting any document.',
    url: '#{url_prefix}/components/plus-editor',
    download_url:
      'https://github.com/standardnotes/plus-editor/archive/1.5.0.zip',
    marketing_url: 'https://standardnotes.com/extensions/plus-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/plus-editor.jpg',
  };

  const markdownBasic: EditorFeatureDescription = {
    name: 'Markdown Basic',
    note_type: NoteType.Markdown,
    file_type: 'md',
    interchangeable: true,
    identifier: FeatureIdentifier.MarkdownBasicEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.MarkdownBasicEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.4.0',
    description: 'A Markdown editor with dynamic split-pane preview.',
    url: '#{url_prefix}/components/simple-markdown-editor',
    download_url:
      'https://github.com/standardnotes/markdown-basic/archive/1.4.0.zip',
    marketing_url:
      'https://standardnotes.com/extensions/simple-markdown-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/simple-markdown.jpg',
  };

  const markdownPro: EditorFeatureDescription = {
    name: 'Markdown Pro',
    note_type: NoteType.Markdown,
    file_type: 'md',
    interchangeable: true,
    identifier: FeatureIdentifier.MarkdownProEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.MarkdownProEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.14',
    description:
      'A fully featured Markdown editor that supports live preview, a styling toolbar, and split pane support.',
    url: '#{url_prefix}/components/advanced-markdown-editor',
    download_url:
      'https://github.com/standardnotes/advanced-markdown-editor/archive/1.3.14.zip',
    marketing_url: 'https://standardnotes.com/extensions/advanced-markdown',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/adv-markdown.jpg',
  };

  const markdownMinimist: EditorFeatureDescription = {
    name: 'Markdown Minimist',
    note_type: NoteType.Markdown,
    file_type: 'md',
    interchangeable: true,
    identifier: FeatureIdentifier.MarkdownMinimistEditor,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.MarkdownMinimistEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.7',
    description:
      'A minimal Markdown editor with live rendering and in-text search via Ctrl/Cmd + F',
    url: '#{url_prefix}/components/minimal-markdown-editor',
    download_url:
      'https://github.com/standardnotes/minimal-markdown-editor/archive/1.3.7.zip',
    marketing_url:
      'https://standardnotes.com/extensions/minimal-markdown-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/min-markdown.jpg',
  };

  const markdownMath: EditorFeatureDescription = {
    name: 'Markdown Math',
    note_type: NoteType.Markdown,
    file_type: 'md',
    interchangeable: true,
    identifier: FeatureIdentifier.MarkdownMathEditor,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.MarkdownMathEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.4',
    description:
      'A beautiful split-pane Markdown editor with synced-scroll, LaTeX support, and colorful syntax.',
    url: '#{url_prefix}/components/fancy-markdown-editor',
    download_url:
      'https://github.com/standardnotes/math-editor/archive/1.3.4.zip',
    marketing_url: 'https://standardnotes.com/extensions/math-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/fancy-markdown.jpg',
  };

  const task: EditorFeatureDescription = {
    name: 'Task Editor',
    note_type: NoteType.Task,
    file_type: 'md',
    interchangeable: false,
    identifier: FeatureIdentifier.TaskEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.TaskEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.3.7',
    description:
      'A great way to manage short-term and long-term to-do"s. You can mark tasks as completed, change their order, and edit the text naturally in place.',
    url: '#{url_prefix}/components/simple-task-editor',
    download_url:
      'https://github.com/standardnotes/simple-task-editor/archive/1.3.7.zip',
    marketing_url: 'https://standardnotes.com/extensions/simple-task-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/task-editor.jpg',
  };

  const tokenvault: EditorFeatureDescription = {
    name: 'TokenVault',
    note_type: NoteType.Authentication,
    file_type: 'json',
    interchangeable: false,
    identifier: FeatureIdentifier.TokenVaultEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.TokenVaultEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '2.0.7',
    description:
      'Encrypt and protect your 2FA secrets for all your internet accounts. TokenVault handles your 2FA secrets so that you never lose them again, or have to start over when you get a new device.',
    url: '#{url_prefix}/components/token-vault',
    marketing_url: '',
    download_url:
      'https://github.com/standardnotes/token-vault/archive/2.0.7.zip',
    thumbnail_url:
      'https://standard-notes.s3.amazonaws.com/screenshots/models/editors/token-vault.png',
  };

  const spreadsheets: EditorFeatureDescription = {
    name: 'Secure Spreadsheets',
    note_type: NoteType.Spreadsheet,
    file_type: 'json',
    interchangeable: false,
    identifier: FeatureIdentifier.SheetsEditor,
    index_path: 'dist/index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ],
    permission_name: PermissionName.SheetsEditor,
    content_type: ContentType.Component,
    area: ComponentArea.Editor,
    version: '1.4.0',
    description:
      'A powerful spreadsheet editor with formatting and formula support. Not recommended for large data sets, as encryption of such data may decrease editor performance.',
    url: '#{url_prefix}/components/standard-sheets',
    marketing_url: '',
    download_url:
      'https://github.com/standardnotes/secure-spreadsheets/archive/1.4.0.zip',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/spreadsheets.png',
  };

  return [
    code,
    bold,
    plus,
    markdownBasic,
    markdownPro,
    markdownMinimist,
    markdownMath,
    task,
    tokenvault,
    spreadsheets,
  ];
}

function nonEditorComponents(): IframeComponentFeatureDescription[] {
  const filesafe: IframeComponentFeatureDescription = {
    identifier: FeatureIdentifier.FileSafe,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
      {
        name: ComponentAction.StreamItems,
        content_types: [
          ContentType.FilesafeCredentials,
          ContentType.FilesafeFileMetadata,
          ContentType.FilesafeIntegration,
        ],
      },
    ],
    name: 'FileSafe',
    permission_name: PermissionName.ComponentFilesafe,
    content_type: ContentType.Component,
    area: ComponentArea.EditorStack,
    version: '2.0.10',
    description:
      'Encrypted attachments for your notes using your Dropbox, Google Drive, or WebDAV server. Limited to 50MB per file.',
    url: '#{url_prefix}/components/filesafe',
    download_url:
      'https://github.com/standardnotes/filesafe-client/archive/2.0.10.zip',
    marketing_url: 'https://standardnotes.com/extensions/filesafe',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/FileSafe-banner.png',
  };

  const folders: IframeComponentFeatureDescription = {
    identifier: FeatureIdentifier.FoldersComponent,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamItems,
        content_types: [ContentType.Tag, ContentType.SmartTag],
      },
    ],
    name: 'Folders',
    content_type: ContentType.Component,
    permission_name: PermissionName.ComponentFolders,
    area: ComponentArea.TagsList,
    version: '1.3.8',
    description: 'Create nested folders with easy drag and drop.',
    url: '#{url_prefix}/components/folders',
    download_url:
      'https://github.com/standardnotes/folders-component/archive/1.3.8.zip',
    marketing_url: 'https://standardnotes.com/extensions/folders',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/components/folders.jpg',
  };

  const cloudlink: IframeComponentFeatureDescription = {
    name: 'CloudLink',
    identifier: FeatureIdentifier.CloudLink,
    index_path: 'index.html',
    component_permissions: [
      {
        name: ComponentAction.StreamItems,
        content_types: [ContentType.ServerExtension],
      },
    ],
    permission_name: PermissionName.CloudLink,
    content_type: ContentType.Component,
    description:
      'Manage and install cloud backups, including Note History, Dropbox, Google Drive, OneDrive, and Daily Email Backups.',
    version: '1.2.3',
    url: '#{url_prefix}/components/cloudlink',
    marketing_url: '',
    download_url: '',
    area: ComponentArea.Modal,
  };

  return [filesafe, folders, cloudlink];
}

function serverFeatures(): ServerFeatureDescription[] {
  return [
    {
      identifier: FeatureIdentifier.TwoFactorAuth,
      permission_name: PermissionName.TwoFactorAuth,
    },
    {
      identifier: FeatureIdentifier.NoteHistoryUnlimited,
      permission_name: PermissionName.NoteHistoryUnlimited,
    },
    {
      identifier: FeatureIdentifier.NoteHistory365Days,
      permission_name: PermissionName.NoteHistory365Days,
    },
    {
      identifier: FeatureIdentifier.NoteHistory30Days,
      permission_name: PermissionName.NoteHistory30Days,
    },
    {
      identifier: FeatureIdentifier.DailyEmailBackup,
      permission_name: PermissionName.DailyEmailBackup,
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
      identifier: FeatureIdentifier.Files25GB,
      permission_name: PermissionName.Files25GB,
    },
    {
      identifier: FeatureIdentifier.Files5GB,
      permission_name: PermissionName.Files5GB,
    },
  ];
}

function clientFeatures(): ClientFeatureDescription[] {
  return [
    {
      name: 'Tag Nesting',
      identifier: FeatureIdentifier.TagNesting,
      permission_name: PermissionName.TagNesting,
      description: 'Create nested tags with easy drag and drop.',
    },
    {
      name: '',
      identifier: FeatureIdentifier.Files,
      permission_name: PermissionName.Files,
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
  ];
}
