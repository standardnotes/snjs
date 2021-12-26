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

function githubDownloadUrl(
  repoUrl: string,
  version: string,
  identifier: FeatureIdentifier
) {
  return `${repoUrl}/releases/download/${version}/${identifier}.zip`;
}

function FillThemeComponentDefaults(
  theme: Partial<ThemeFeatureDescription>
): ThemeFeatureDescription {
  if (!theme.static_files) {
    theme.static_files = ['dist/**/*', 'package.json'];
  }

  if (theme.git_repo_url && !theme.download_url) {
    theme.download_url = githubDownloadUrl(
      theme.git_repo_url,
      theme.version!,
      theme.identifier!
    );
  }

  if (!theme.index_path) {
    theme.index_path = 'dist/dist.css';
  }

  theme.content_type = ContentType.Theme;
  if (!theme.area) {
    theme.area = ComponentArea.Editor;
  }
  return theme as ThemeFeatureDescription;
}

function themes(): ThemeFeatureDescription[] {
  const midnight: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Midnight',
    identifier: FeatureIdentifier.MidnightTheme,
    permission_name: PermissionName.MidnightTheme,
    version: '1.2.4',
    description: 'Elegant utilitarianism.',
    git_repo_url: 'https://github.com/standardnotes/midnight-theme',
    marketing_url: 'https://standardnotes.com/extensions/midnight',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/midnight-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#086DD6',
      foreground_color: '#ffffff',
      border_color: '#086DD6',
    },
  });

  const futura: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Futura',
    identifier: FeatureIdentifier.FuturaTheme,
    permission_name: PermissionName.FuturaTheme,
    version: '1.2.4',
    description: 'Calm and relaxed. Take some time off.',
    git_repo_url: 'https://github.com/standardnotes/futura-theme',
    marketing_url: 'https://standardnotes.com/extensions/futura',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/futura-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#fca429',
      foreground_color: '#ffffff',
      border_color: '#fca429',
    },
  });

  const solarizedDark: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Solarized Dark',
    identifier: FeatureIdentifier.SolarizedDarkTheme,
    permission_name: PermissionName.SolarizedDarkTheme,
    version: '1.2.3',
    description: 'The perfect theme for any time.',
    git_repo_url: 'https://github.com/standardnotes/solarized-dark-theme',
    marketing_url: 'https://standardnotes.com/extensions/solarized-dark',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/solarized-dark.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#2AA198',
      foreground_color: '#ffffff',
      border_color: '#2AA198',
    },
  });

  const autobiography: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Autobiography',
    identifier: FeatureIdentifier.AutobiographyTheme,
    permission_name: PermissionName.AutobiographyTheme,
    version: '1.0.1',
    description: 'A theme for writers and readers.',
    git_repo_url: 'https://github.com/standardnotes/autobiography-theme',
    marketing_url: '',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/autobiography.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#9D7441',
      foreground_color: '#ECE4DB',
      border_color: '#9D7441',
    },
  });

  const focus: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Focus',
    identifier: FeatureIdentifier.FocusedTheme,
    permission_name: PermissionName.FocusedTheme,
    version: '1.2.5',
    description: 'For when you need to go in.',
    git_repo_url: 'https://github.com/standardnotes/focus-theme',
    marketing_url: 'https://standardnotes.com/extensions/focused',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/focus-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#a464c2',
      foreground_color: '#ffffff',
      border_color: '#a464c2',
    },
  });

  const titanium: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Titanium',
    version: '1.2.4',
    identifier: FeatureIdentifier.TitaniumTheme,
    permission_name: PermissionName.TitaniumTheme,
    description: 'Light on the eyes, heavy on the spirit.',
    git_repo_url: 'https://github.com/standardnotes/titanium-theme',
    marketing_url: 'https://standardnotes.com/extensions/titanium',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/themes/titanium-with-mobile.jpg',
    dock_icon: {
      type: 'circle',
      background_color: '#6e2b9e',
      foreground_color: '#ffffff',
      border_color: '#6e2b9e',
    },
  });

  const dynamic: ThemeFeatureDescription = FillThemeComponentDefaults({
    name: 'Dynamic',
    identifier: FeatureIdentifier.DynamicTheme,
    permission_name: PermissionName.ThemeDynamic,
    layerable: true,
    no_mobile: true,
    version: '1.0.0',
    description:
      'A smart theme that minimizes the tags and notes panels when they are not in use.',
    git_repo_url: 'https://github.com/standardnotes/dynamic-theme',
    marketing_url: 'https://standardnotes.com/extensions/dynamic',
  });

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

function FillEditorComponentDefaults(
  component: Partial<EditorFeatureDescription>
): EditorFeatureDescription {
  if (!component.static_files) {
    component.static_files = ['index.html', 'dist', 'package.json'];
  }

  if (component.git_repo_url && !component.download_url) {
    component.download_url = githubDownloadUrl(
      component.git_repo_url,
      component.version!,
      component.identifier!
    );
  }

  if (!component.index_path) {
    component.index_path = 'dist/index.html';
  }

  if (!component.component_permissions) {
    component.component_permissions = [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ];
  }

  component.content_type = ContentType.Component;
  if (!component.area) {
    component.area = ComponentArea.Editor;
  }

  if (component.interchangeable == undefined) {
    component.interchangeable = true;
  }

  return component as EditorFeatureDescription;
}

function editors(): EditorFeatureDescription[] {
  const code: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Code Editor',
    version: '1.3.9',
    identifier: FeatureIdentifier.CodeEditor,
    permission_name: PermissionName.CodeEditor,
    note_type: NoteType.Code,
    file_type: 'txt',
    interchangeable: true,
    index_path: 'index.html',
    description:
      'Syntax highlighting and convenient keyboard shortcuts for over 120 programming' +
      'languages. Ideal for code snippets and procedures.',
    git_repo_url: 'https://github.com/standardnotes/code-editor',
    marketing_url: 'https://standardnotes.com/extensions/code-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/code.jpg',
  });

  const bold: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Bold Editor',
    identifier: FeatureIdentifier.BoldEditor,
    version: '1.2.10',
    note_type: NoteType.RichText,
    file_type: 'html',
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
    description:
      'A simple and peaceful rich editor that helps you write and think clearly. Features FileSafe integration, so you can embed your encrypted images, videos, and audio recordings directly inline.',
    marketing_url: '',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/bold.jpg',
    git_repo_url: 'https://github.com/standardnotes/bold-editor',
  });

  const plus: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Plus Editor',
    note_type: NoteType.RichText,
    file_type: 'html',
    identifier: FeatureIdentifier.PlusEditor,
    permission_name: PermissionName.PlusEditor,
    version: '1.5.0',
    description:
      'From highlighting to custom font sizes and colors, to tables and lists, this editor is perfect for crafting any document.',
    git_repo_url: 'https://github.com/standardnotes/plus-editor',
    marketing_url: 'https://standardnotes.com/extensions/plus-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/plus-editor.jpg',
  });

  const markdownBasic: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Markdown Basic',
    identifier: FeatureIdentifier.MarkdownBasicEditor,
    note_type: NoteType.Markdown,
    version: '1.4.0',
    file_type: 'md',
    permission_name: PermissionName.MarkdownBasicEditor,
    description: 'A Markdown editor with dynamic split-pane preview.',
    git_repo_url: 'https://github.com/standardnotes/markdown-basic',
    marketing_url:
      'https://standardnotes.com/extensions/simple-markdown-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/simple-markdown.jpg',
  });

  const markdownPro: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Markdown Pro',
    identifier: FeatureIdentifier.MarkdownProEditor,
    version: '1.3.14',
    note_type: NoteType.Markdown,
    file_type: 'md',
    permission_name: PermissionName.MarkdownProEditor,
    description:
      'A fully featured Markdown editor that supports live preview, a styling toolbar, and split pane support.',
    git_repo_url: 'https://github.com/standardnotes/advanced-markdown-editor',
    marketing_url: 'https://standardnotes.com/extensions/advanced-markdown',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/adv-markdown.jpg',
  });

  const markdownMinimist: EditorFeatureDescription = FillEditorComponentDefaults(
    {
      name: 'Markdown Minimist',
      identifier: FeatureIdentifier.MarkdownMinimistEditor,
      note_type: NoteType.Markdown,
      file_type: 'md',
      index_path: 'index.html',
      permission_name: PermissionName.MarkdownMinimistEditor,
      version: '1.3.7',
      description:
        'A minimal Markdown editor with live rendering and in-text search via Ctrl/Cmd + F',
      git_repo_url: 'https://github.com/standardnotes/minimal-markdown-editor',
      marketing_url:
        'https://standardnotes.com/extensions/minimal-markdown-editor',
      thumbnail_url:
        'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/min-markdown.jpg',
    } as EditorFeatureDescription
  );

  const markdownMath: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Markdown Math',
    identifier: FeatureIdentifier.MarkdownMathEditor,
    version: '1.3.4',
    permission_name: PermissionName.MarkdownMathEditor,
    note_type: NoteType.Markdown,
    file_type: 'md',
    index_path: 'index.html',
    description:
      'A beautiful split-pane Markdown editor with synced-scroll, LaTeX support, and colorful syntax.',
    git_repo_url: 'https://github.com/standardnotes/math-editor',
    marketing_url: 'https://standardnotes.com/extensions/math-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/fancy-markdown.jpg',
  });

  const task: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Task Editor',
    identifier: FeatureIdentifier.TaskEditor,
    note_type: NoteType.Task,
    version: '1.3.7',
    file_type: 'md',
    interchangeable: false,
    permission_name: PermissionName.TaskEditor,
    description:
      'A great way to manage short-term and long-term to-do"s. You can mark tasks as completed, change their order, and edit the text naturally in place.',
    git_repo_url: 'https://github.com/standardnotes/simple-task-editor',
    marketing_url: 'https://standardnotes.com/extensions/simple-task-editor',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/task-editor.jpg',
  });

  const tokenvault: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'TokenVault',
    note_type: NoteType.Authentication,
    file_type: 'json',
    interchangeable: false,
    identifier: FeatureIdentifier.TokenVaultEditor,
    permission_name: PermissionName.TokenVaultEditor,
    version: '2.0.7',
    description:
      'Encrypt and protect your 2FA secrets for all your internet accounts. TokenVault handles your 2FA secrets so that you never lose them again, or have to start over when you get a new device.',
    marketing_url: '',
    git_repo_url: 'https://github.com/standardnotes/token-vault',
    thumbnail_url:
      'https://standard-notes.s3.amazonaws.com/screenshots/models/editors/token-vault.png',
  });

  const spreadsheets: EditorFeatureDescription = FillEditorComponentDefaults({
    name: 'Secure Spreadsheets',
    identifier: FeatureIdentifier.SheetsEditor,
    version: '1.4.0',
    note_type: NoteType.Spreadsheet,
    file_type: 'json',
    interchangeable: false,
    permission_name: PermissionName.SheetsEditor,
    description:
      'A powerful spreadsheet editor with formatting and formula support. Not recommended for large data sets, as encryption of such data may decrease editor performance.',
    marketing_url: '',
    git_repo_url: 'https://github.com/standardnotes/secure-spreadsheets',
    thumbnail_url:
      'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/spreadsheets.png',
  });

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
  const filesafe: IframeComponentFeatureDescription = FillEditorComponentDefaults(
    {
      name: 'FileSafe',
      identifier: FeatureIdentifier.FileSafe,
      version: '2.0.10',
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
      permission_name: PermissionName.ComponentFilesafe,
      area: ComponentArea.EditorStack,
      description:
        'Encrypted attachments for your notes using your Dropbox, Google Drive, or WebDAV server. Limited to 50MB per file.',
      git_repo_url: 'https://github.com/standardnotes/filesafe-client',
      marketing_url: 'https://standardnotes.com/extensions/filesafe',
      thumbnail_url:
        'https://s3.amazonaws.com/standard-notes/screenshots/models/FileSafe-banner.png',
    }
  );

  const folders: IframeComponentFeatureDescription = FillEditorComponentDefaults(
    {
      name: 'Folders',
      identifier: FeatureIdentifier.FoldersComponent,
      version: '1.3.8',
      index_path: 'index.html',
      component_permissions: [
        {
          name: ComponentAction.StreamItems,
          content_types: [ContentType.Tag, ContentType.SmartTag],
        },
      ],
      permission_name: PermissionName.ComponentFolders,
      area: ComponentArea.TagsList,
      description: 'Create nested folders with easy drag and drop.',
      git_repo_url: 'https://github.com/standardnotes/folders-component',
      marketing_url: 'https://standardnotes.com/extensions/folders',
      thumbnail_url:
        'https://s3.amazonaws.com/standard-notes/screenshots/models/components/folders.jpg',
    }
  );

  const cloudlink: IframeComponentFeatureDescription = FillEditorComponentDefaults(
    {
      name: 'CloudLink',
      identifier: FeatureIdentifier.CloudLink,
      version: '1.2.3',
      index_path: 'index.html',
      component_permissions: [
        {
          name: ComponentAction.StreamItems,
          content_types: [ContentType.ServerExtension],
        },
      ],
      permission_name: PermissionName.CloudLink,
      description:
        'Manage and install cloud backups, including Note History, Dropbox, Google Drive, OneDrive, and Daily Email Backups.',
      git_repo_url: '',
      area: ComponentArea.Modal,
    }
  );

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
