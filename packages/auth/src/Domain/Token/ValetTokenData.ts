import { Uuid } from '@standardnotes/common'

export type ValetTokenData = {
  userUuid: Uuid,
  performerSubscriptionUuid: Uuid
  regularSubscriptionUuid: Uuid
  permittedOperation: 'read' | 'write' | 'delete',
  permittedResources: Array<{
    remoteIdentifier: string,
    unencryptedFileSize?: number,
  }>,
  uploadBytesUsed: number,
  uploadBytesLimit: number,
}
