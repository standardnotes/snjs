import { SNNote, FileItem } from '@standardnotes/models'

export interface ItemViewController {
  item: SNNote | FileItem

  deinit: () => void
}
