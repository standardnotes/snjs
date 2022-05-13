import { ChallengeReason } from '@standardnotes/services'
import { FileItem } from '@standardnotes/models'

export interface ProtectionsClientInterface {
  authorizeProtectedActionForFiles(files: FileItem[], challengeReason: ChallengeReason): Promise<FileItem[]>
}
