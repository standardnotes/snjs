import { ChallengeRawValue } from './Types'
import { ChallengePrompt } from './ChallengePrompt'

export class ChallengeValue {
  constructor(public readonly prompt: ChallengePrompt, public readonly value: ChallengeRawValue) {
    Object.freeze(this)
  }
}
