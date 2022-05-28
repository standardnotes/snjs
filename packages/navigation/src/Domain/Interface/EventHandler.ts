import { FileItem, SNNote } from '@standardnotes/models'
import { Folder } from './Types'

export interface NavigationEventHandler {
  onNotes(notes: SNNote[]): void
  onFolders(tags: Folder[]): void
  onFiles(files: FileItem[]): void

  onSelectedNotes(selectedNotes: SNNote[]): void
  onSelectedFolders(selectedFolders: Folder[]): void
  onSelectedFiles(selectedFiles: FileItem[]): void
}
