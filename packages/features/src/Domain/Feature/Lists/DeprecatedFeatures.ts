import { ComponentAction } from '../../Component/ComponentAction'
import { ContentType } from '@standardnotes/common'
import { FeatureDescription, IframeComponentFeatureDescription } from '../FeatureDescription'
import { ComponentArea } from '../../Component/ComponentArea'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'
import { FillEditorComponentDefaults } from './Utilities/FillEditorComponentDefaults'

export function GetDeprecatedFeatures(): FeatureDescription[] {
  const filesafe: IframeComponentFeatureDescription = FillEditorComponentDefaults({
    name: 'FileSafe',
    identifier: FeatureIdentifier.DeprecatedFileSafe,
    version: '2.0.10',
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
    deprecated: true,
    description:
      'Encrypted attachments for your notes using your Dropbox, Google Drive, or WebDAV server. Limited to 50MB per file.',
    git_repo_url: 'https://github.com/standardnotes/filesafe-client',
    marketing_url: 'https://standardnotes.com/extensions/filesafe',
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/FileSafe-banner.png',
  })

  return [filesafe]
}
