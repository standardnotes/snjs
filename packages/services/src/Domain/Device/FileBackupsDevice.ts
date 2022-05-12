import { Uuid } from '@standardnotes/common'
import { EncryptedTransferPayload } from '@standardnotes/models'

export const FileBackupMetadataName = () => 'metadata.sn.json'

export interface FileBackupMetadataFile {
  info: Record<string, string>
  file: EncryptedTransferPayload
  itemsKey: EncryptedTransferPayload
}

export interface FileBackupsMapping {
  files: Record<
    Uuid,
    {
      path: string
      backedUpOn: Date
    }
  >
}

export interface FileBackupsDevice {
  getFilesBackupsMappingFile(): Promise<FileBackupsMapping>
  saveFilesBackupsFile(
    uuid: Uuid,
    metaFile: string,
    downloadRequest: {
      chunkSizes: number[]
      valetToken: string
      url: string
    },
  ): Promise<'success' | 'failed'>
  isFilesBackupsEnabled(): Promise<boolean>
  enableFilesBackups(): Promise<void>
  disableFilesBackups(): Promise<void>
  changeFilesBackupsLocation(): Promise<string>
  getFilesBackupsLocation(): Promise<string>
  openFilesBackupsLocation(): Promise<void>
}
