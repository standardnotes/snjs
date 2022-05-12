import { ChallengeReason } from '@standardnotes/services'
import { SNFile } from '@standardnotes/models'

export interface ProtectionsClientInterface {
  authorizeProtectedActionForFiles(files: SNFile[], challengeReason: ChallengeReason): Promise<SNFile[]>
}
