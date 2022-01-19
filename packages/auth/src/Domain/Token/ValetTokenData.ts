import { Uuid } from '@standardnotes/common'

export type ValetTokenData = {
  userUuid: Uuid,
  permittedOperation: 'read' | 'write',
  permittedResources: Array<string>,
  uploadBytesUsed: number,
  uploadBytesLimit: number,
}
