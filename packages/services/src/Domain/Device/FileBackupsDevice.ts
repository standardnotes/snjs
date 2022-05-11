import { Uuid } from '@standardnotes/common'

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
}
