import { ComponentAction } from '../../Component/ComponentAction'
import { ContentType, SubscriptionName } from '@standardnotes/common'
import { EditorFeatureDescription } from '../FeatureDescription'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'
import { NoteType } from '../../Component/NoteType'
import { FillEditorComponentDefaults } from './Utilities/FillEditorComponentDefaults'

export function editors(): EditorFeatureDescription[] {
  const code: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Code',
    version: '1.3.12',
    spellcheckControl: true,
    identifier: FeatureIdentifier.CodeEditor,
    permission_name: PermissionName.CodeEditor,
    note_type: NoteType.Code,
    file_type: 'txt',
    interchangeable: true,
    index_path: 'index.html',
    static_files: ['vendor'],
    description:
      'Syntax highlighting and convenient keyboard shortcuts for over 120 programming' +
      ' languages. Ideal for code snippets and procedures.',
    git_repo_url: 'https://github.com/standardnotes/code-editor',
    marketing_url: 'https://standardnotes.com/extensions/code-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/code.jpg',
  })

  const bold: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Alternative Rich Text',
    identifier: FeatureIdentifier.BoldEditor,
    version: '1.3.5',
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
    spellcheckControl: true,
    permission_name: PermissionName.BoldEditor,
    description:
      'A simple and peaceful rich editor that helps you write and think clearly. Features FileSafe integration, so you can embed your encrypted images, videos, and audio recordings directly inline.',
    marketing_url: '',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/bold.jpg',
    git_repo_url: 'https://github.com/standardnotes/bold-editor',
  })

  const plus: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Classic Rich Text',
    note_type: NoteType.RichText,
    file_type: 'html',
    identifier: FeatureIdentifier.PlusEditor,
    permission_name: PermissionName.PlusEditor,
    version: '1.6.1',
    spellcheckControl: true,
    description:
      'From highlighting to custom font sizes and colors, to tables and lists, this editor is perfect for crafting any document.',
    git_repo_url: 'https://github.com/standardnotes/plus-editor',
    marketing_url: 'https://standardnotes.com/extensions/plus-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/plus-editor.jpg',
  })

  const markdownBasic: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Basic Markdown',
    identifier: FeatureIdentifier.MarkdownBasicEditor,
    note_type: NoteType.Markdown,
    version: '1.4.2',
    spellcheckControl: true,
    file_type: 'md',
    permission_name: PermissionName.MarkdownBasicEditor,
    description: 'A Markdown editor with dynamic split-pane preview.',
    git_repo_url: 'https://github.com/standardnotes/markdown-basic',
    marketing_url: 'https://standardnotes.com/extensions/simple-markdown-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/simple-markdown.jpg',
  })

  const markdownPro: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Hybrid Markdown',
    identifier: FeatureIdentifier.MarkdownProEditor,
    version: '1.5.0',
    note_type: NoteType.Markdown,
    file_type: 'md',
    permission_name: PermissionName.MarkdownProEditor,
    spellcheckControl: true,
    description:
      'A fully featured Markdown editor that supports live preview, a styling toolbar, and split pane support.',
    git_repo_url: 'https://github.com/standardnotes/advanced-markdown-editor',
    marketing_url: 'https://standardnotes.com/extensions/advanced-markdown',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/adv-markdown.jpg',
  })

  const markdownMinimist: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Minimal Markdown',
    identifier: FeatureIdentifier.MarkdownMinimistEditor,
    note_type: NoteType.Markdown,
    file_type: 'md',
    index_path: 'index.html',
    permission_name: PermissionName.MarkdownMinimistEditor,
    version: '1.3.9',
    spellcheckControl: true,
    description: 'A minimal Markdown editor with live rendering and in-text search via Ctrl/Cmd + F',
    git_repo_url: 'https://github.com/standardnotes/minimal-markdown-editor',
    marketing_url: 'https://standardnotes.com/extensions/minimal-markdown-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/min-markdown.jpg',
  })

  const markdownMath: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Markdown with Math',
    identifier: FeatureIdentifier.MarkdownMathEditor,
    version: '1.3.6',
    spellcheckControl: true,
    permission_name: PermissionName.MarkdownMathEditor,
    note_type: NoteType.Markdown,
    file_type: 'md',
    index_path: 'index.html',
    description: 'A beautiful split-pane Markdown editor with synced-scroll, LaTeX support, and colorful syntax.',
    git_repo_url: 'https://github.com/standardnotes/math-editor',
    marketing_url: 'https://standardnotes.com/extensions/math-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/fancy-markdown.jpg',
  })

  const markdownVisual: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Dynamic Markdown',
    identifier: FeatureIdentifier.MarkdownVisualEditor,
    version: '1.0.6',
    note_type: NoteType.Markdown,
    file_type: 'md',
    permission_name: PermissionName.MarkdownVisualEditor,
    spellcheckControl: true,
    description:
      'A WYSIWYG-style Markdown editor that renders Markdown in preview-mode while you type without displaying any syntax.',
    git_repo_url: 'https://github.com/standardnotes/markdown-visual',
    marketing_url: 'https://github.com/standardnotes/markdown-visual',
    static_files: ['build'],
    index_path: 'build/index.html',
  })

  const task: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Basic Checklist',
    identifier: FeatureIdentifier.TaskEditor,
    note_type: NoteType.Task,
    version: '1.3.9',
    spellcheckControl: true,
    file_type: 'md',
    interchangeable: false,
    permission_name: PermissionName.TaskEditor,
    description:
      'A great way to manage short-term and long-term to-do"s. You can mark tasks as completed, change their order, and edit the text naturally in place.',
    git_repo_url: 'https://github.com/standardnotes/simple-task-editor',
    marketing_url: 'https://standardnotes.com/extensions/simple-task-editor',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/task-editor.jpg',
  })

  const tokenvault: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Passwords and Tokens',
    note_type: NoteType.Authentication,
    file_type: 'json',
    interchangeable: false,
    identifier: FeatureIdentifier.TokenVaultEditor,
    permission_name: PermissionName.TokenVaultEditor,
    version: '2.0.10',
    description:
      'Encrypt and protect your 2FA secrets for all your internet accounts. TokenVault handles your 2FA secrets so that you never lose them again, or have to start over when you get a new device.',
    marketing_url: '',
    git_repo_url: 'https://github.com/standardnotes/token-vault',
    thumbnail_url: 'https://standard-notes.s3.amazonaws.com/screenshots/models/editors/token-vault.png',
  })

  const spreadsheets: EditorFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'Spreadsheet',
    identifier: FeatureIdentifier.SheetsEditor,
    version: '1.4.4',
    note_type: NoteType.Spreadsheet,
    file_type: 'json',
    interchangeable: false,
    permission_name: PermissionName.SheetsEditor,
    description:
      'A powerful spreadsheet editor with formatting and formula support. Not recommended for large data sets, as encryption of such data may decrease editor performance.',
    marketing_url: '',
    git_repo_url: 'https://github.com/standardnotes/secure-spreadsheets',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/editors/spreadsheets.png',
  })

  return [
    code,
    bold,
    plus,
    markdownBasic,
    markdownPro,
    markdownMinimist,
    markdownMath,
    markdownVisual,
    task,
    tokenvault,
    spreadsheets,
  ]
}
