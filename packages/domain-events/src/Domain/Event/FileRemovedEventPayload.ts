import { Uuid } from '@standardnotes/common'

export interface FileRemovedEventPayload {
  userUuid: Uuid
  fileByteSize: number
  filePath: string
  fileName: string
}
