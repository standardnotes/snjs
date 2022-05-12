import { ChallengePromptInterface } from '../Prompt/ChallengePromptInterface'
import { ChallengeRawValue } from './ChallengeRawValue'

export interface ChallengeValue {
  readonly prompt: ChallengePromptInterface
  readonly value: ChallengeRawValue
}

export function CreateChallengeValue(prompt: ChallengePromptInterface, value: ChallengeRawValue): ChallengeValue {
  return { prompt, value }
}