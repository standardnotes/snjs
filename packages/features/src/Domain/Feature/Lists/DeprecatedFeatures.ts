import { ComponentAction } from '../../Component/ComponentAction'
import { ContentType, SubscriptionName } from '@standardnotes/common'
import { FeatureDescription, IframeComponentFeatureDescription } from '../FeatureDescription'
import { ComponentArea } from '../../Component/ComponentArea'
import { PermissionName } from '../../Permission/PermissionName'
import { FeatureIdentifier } from '../FeatureIdentifier'
import { FillEditorComponentDefaults } from './Utilities/FillEditorComponentDefaults'

export function GetDeprecatedFeatures(): FeatureDescription[] {
  const filesafe: IframeComponentFeatureDescription = FillEditorComponentDefaults({
    availableInSubscriptions: [SubscriptionName.PlusPlan, SubscriptionName.ProPlan],
    name: 'FileSafe',
    identifier: FeatureIdentifier.DeprecatedFileSafe,
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
    thumbnail_url: 'https://s3.amazonaws.com/standard-notes/screenshots/models/FileSafe-banner.png',
  })

  return [filesafe]
}
