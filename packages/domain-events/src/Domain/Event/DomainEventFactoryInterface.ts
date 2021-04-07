import { DropboxBackupFailedEvent } from './DropboxBackupFailedEvent'
import { GoogleDriveBackupFailedEvent } from './GoogleDriveBackupFailedEvent'
import { ItemsSyncedEvent } from './ItemsSyncedEvent'
import { MailBackupAttachmentTooBigEvent } from './MailBackupAttachmentTooBigEvent'
import { OneDriveBackupFailedEvent } from './OneDriveBackupFailedEvent'
import { UserRegisteredEvent } from './UserRegisteredEvent'

export interface DomainEventFactoryInterface {
  createUserRegisteredEvent(userUuid: string, email: string): UserRegisteredEvent
  createDropboxBackupFailedEvent(extensionSettingUuid: string, email: string): DropboxBackupFailedEvent
  createGoogleDriveBackupFailedEvent(extensionSettingUuid: string, email: string): GoogleDriveBackupFailedEvent
  createOneDriveBackupFailedEvent(extensionSettingUuid: string, email: string): OneDriveBackupFailedEvent
  createMailBackupAttachmentTooBigEvent(allowedSize: string, attachmentSize: string, extensionSettingUuid: string, email: string): MailBackupAttachmentTooBigEvent
  createItemsSyncedEvent(userUuid: string, extensionUrl: string, extensionId: string, itemUuids: Array<string>, forceMute: boolean): ItemsSyncedEvent
}
