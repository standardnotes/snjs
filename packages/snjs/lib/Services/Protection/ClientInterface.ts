import { ChallengeReason } from '@Lib/Services/Challenge/Types'
import { SNFile } from '@standardnotes/models'

export interface ProtectionsClientInterface {
  authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]>
}
