import {
  ComponentArea,
  ComponentAction,
  ComponentPermission,
  FeatureIdentifier,
  LegacyFileSafeIdentifier,
} from '@standardnotes/features'
import { SNComponent } from '@standardnotes/models'
import { UuidString } from '@Lib/Types/UuidString'
import { ContentType } from '@standardnotes/common'
import { RawPayload } from '@standardnotes/payloads'

export interface DesktopManagerInterface {
  syncComponentsInstallation(components: SNComponent[]): void
  registerUpdateObserver(callback: (component: SNComponent) => void): void
  getExtServerHost(): string
}

export type ComponentRawPayload = RawPayload & {
  clientData: any
}

/**
 * Extensions allowed to batch stream AllowedBatchContentTypes
 */
export const AllowedBatchStreaming = Object.freeze([
  LegacyFileSafeIdentifier,
  FeatureIdentifier.DeprecatedFileSafe,
  FeatureIdentifier.BoldEditor,
])

/**
 * Content types which are allowed to be managed/streamed in bulk by a component.
 */
export const AllowedBatchContentTypes = Object.freeze([
  ContentType.FilesafeCredentials,
  ContentType.FilesafeFileMetadata,
  ContentType.FilesafeIntegration,
])

/* This domain will be used to save context item client data */
export const ComponentDataDomain = 'org.standardnotes.sn.components'

export type StreamObserver = {
  identifier: string
  componentUuid: UuidString
  area: ComponentArea
  originalMessage: any
  /** contentTypes is optional in the case of a context stream observer */
  contentTypes?: ContentType[]
}

export type PermissionDialog = {
  component: SNComponent
  permissions: ComponentPermission[]
  permissionsString: string
  actionBlock: (approved: boolean) => void
  callback: (approved: boolean) => void
}

export enum KeyboardModifier {
  Shift = 'Shift',
  Ctrl = 'Control',
  Meta = 'Meta',
}

export type MessageData = Partial<{
  /** Related to the stream-item-context action */
  item?: ItemMessagePayload
  /** Related to the stream-items action */
  content_types?: ContentType[]
  items?: ItemMessagePayload[]
  /** Related to the request-permission action */
  permissions?: ComponentPermission[]
  /** Related to the component-registered action */
  componentData?: any
  uuid?: UuidString
  environment?: string
  platform?: string
  activeThemeUrls?: string[]
  /** Related to set-size action */
  width?: string | number
  height?: string | number
  type?: string
  /** Related to themes action */
  themes?: string[]
  /** Related to clear-selection action */
  content_type?: ContentType
  /** Related to key-pressed action */
  keyboardModifier?: KeyboardModifier
}>

export type StreamItemsMessageData = MessageData & {
  content_types: ContentType[]
}

export type DeleteItemsMessageData = MessageData & {
  items: ItemMessagePayload[]
}

export type ComponentMessage = {
  action: ComponentAction
  sessionKey?: string
  componentData?: any
  data: MessageData
}

export type MessageReplyData = {
  approved?: boolean
  deleted?: boolean
  error?: string
  item?: any
  items?: any[]
  themes?: string[]
}

export type MessageReply = {
  action: ComponentAction
  original: ComponentMessage
  data: MessageReplyData
}

export type ItemMessagePayload = {
  uuid: string
  content_type: ContentType
  created_at: Date
  updated_at: Date
  deleted: boolean
  content: any
  clientData: any
  /** isMetadataUpdate implies that the extension should make reference of updated
   * metadata, but not update content values as they may be stale relative to what the
   * extension currently has. Changes are always metadata updates if the mapping source
   * is PayloadSource.RemoteSaved || PayloadSource.LocalSaved || PayloadSource.PreSyncSave */
  isMetadataUpdate: any
}
