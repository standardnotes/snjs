import { ChallengeReason } from '@Lib/services/Challenge/Types'
import { SNFile } from '@Lib/Models'

export interface ProtectionsClientInterface {
  authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]>
}
