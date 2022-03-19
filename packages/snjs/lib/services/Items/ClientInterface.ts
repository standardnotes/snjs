import { SNNote, SNFile, SNTag } from '@Lib/models'

export interface ItemsClientInterface {
  associateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  disassociateFileWithNote(file: SNFile, note: SNNote): Promise<SNFile>

  getFilesForNote(note: SNNote): SNFile[]

  renameFile(file: SNFile, name: string): Promise<SNFile>

  addTagToNote(note: SNNote, tag: SNTag, addHierarchy: boolean): Promise<SNTag[]>
}
