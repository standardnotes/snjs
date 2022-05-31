import { ContentType } from '@standardnotes/common'
import { FileItem, isTag, ItemInterface, SmartView, SNNote, SNTag, isSmartView } from '@standardnotes/models'

export type NavigationControllerConfig = { supportsFileNavigation: boolean }

export type SupportedItem = SNNote | FileItem | SNTag | SmartView

export type Folder = SNTag | SmartView

export const FolderContentTypes = [ContentType.Tag, ContentType.SmartView]

export function isFolder(x: ItemInterface): x is Folder {
  return isTag(x) || isSmartView(x)
}
