import { ChallengeReason } from '@Lib/challenges'
import { SNFile } from '@Lib/models'

export interface ProtectionsClientInterface {
  protectFile(file: SNFile): Promise<SNFile>

  unprotectFile(file: SNFile): Promise<SNFile | undefined>

  authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]>
}
