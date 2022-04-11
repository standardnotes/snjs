import { ChallengeValidation, ChallengeKeyboardType, ChallengeRawValue } from './Types'
import { PromptTitles } from '../Api/Messages'
import { assertUnreachable } from '@standardnotes/utils'

/**
 * A Challenge can have many prompts. Each prompt represents a unique input,
 * such as a text field, or biometric scanner.
 */
export class ChallengePrompt {
  public readonly id = Math.random()
  public readonly placeholder: string
  public readonly title: string
  public readonly validates: boolean

  constructor(
    public readonly validation: ChallengeValidation,
    title?: string,
    placeholder?: string,
    public readonly secureTextEntry = true,
    public readonly keyboardType?: ChallengeKeyboardType,
    public readonly initialValue?: ChallengeRawValue,
  ) {
    switch (this.validation) {
      case ChallengeValidation.AccountPassword:
        this.title = title ?? PromptTitles.AccountPassword
        this.placeholder = placeholder ?? PromptTitles.AccountPassword
        this.validates = true
        break
      case ChallengeValidation.LocalPasscode:
        this.title = title ?? PromptTitles.LocalPasscode
        this.placeholder = placeholder ?? PromptTitles.LocalPasscode
        this.validates = true
        break
      case ChallengeValidation.Biometric:
        this.title = title ?? PromptTitles.Biometrics
        this.placeholder = placeholder ?? ''
        this.validates = true
        break
      case ChallengeValidation.ProtectionSessionDuration:
        this.title = title ?? PromptTitles.RememberFor
        this.placeholder = placeholder ?? ''
        this.validates = true
        break
      case ChallengeValidation.None:
        this.title = title ?? ''
        this.placeholder = placeholder ?? ''
        this.validates = false
        break
      default:
        assertUnreachable(this.validation)
    }
    Object.freeze(this)
  }
}
