import { ChallengeReason } from '@Lib/services/Challenge/Types'
import { SNFile } from '@Lib/Models'

export interface ProtectionsClientInterface {
  protectFile(file: SNFile): Promise<SNFile>

  unprotectFile(file: SNFile): Promise<SNFile | undefined>

  authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]>
}
