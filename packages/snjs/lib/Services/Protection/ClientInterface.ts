import { ChallengeReason } from '@Lib/Services/Challenge/Types'
import { SNFile } from '@Lib/Models'

export interface ProtectionsClientInterface {
  authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]>
}
