import { removeFromArray } from '@standardnotes/utils'
import { Challenge, ChallengeArtifacts, ChallengeResponse, ChallengeValue } from '@Lib/challenges'
import { ValueCallback } from './challenge_service'

/**
 * A challenge operation stores user-submitted values and callbacks.
 * When its values are updated, it will trigger the associated callbacks (valid/invalid/complete)
 */
export class ChallengeOperation {
  private nonvalidatedValues: ChallengeValue[] = []
  private validValues: ChallengeValue[] = []
  private invalidValues: ChallengeValue[] = []
  private artifacts: ChallengeArtifacts = {}

  /**
   * @param resolve the promise resolve function to be called
   * when this challenge completes or cancels
   */
  constructor(
    public challenge: Challenge,
    public onValidValue: ValueCallback,
    public onInvalidValue: ValueCallback,
    public onNonvalidatedSubmit: (response: ChallengeResponse) => void,
    public onComplete: (response: ChallengeResponse) => void,
    public onCancel: () => void,
  ) {}

  /**
   * Mark this challenge as complete, triggering the resolve function,
   * as well as notifying the client
   */
  public complete(response?: ChallengeResponse) {
    if (!response) {
      response = new ChallengeResponse(this.challenge, this.validValues, this.artifacts)
    }
    this.onComplete?.(response)
  }

  public nonvalidatedSubmit() {
    const response = new ChallengeResponse(
      this.challenge,
      this.nonvalidatedValues.slice(),
      this.artifacts,
    )
    this.onNonvalidatedSubmit?.(response)
    /** Reset values */
    this.nonvalidatedValues = []
  }

  public cancel() {
    this.onCancel?.()
  }

  /**
   * @returns Returns true if the challenge has received all valid responses
   */
  public isFinished() {
    return this.validValues.length === this.challenge.prompts.length
  }

  private nonvalidatedPrompts() {
    return this.challenge.prompts.filter((p) => !p.validates)
  }

  public addNonvalidatedValue(value: ChallengeValue) {
    const valuesArray = this.nonvalidatedValues
    const matching = valuesArray.find((v) => v.prompt.id === value.prompt.id)
    if (matching) {
      removeFromArray(valuesArray, matching)
    }
    valuesArray.push(value)
    if (this.nonvalidatedValues.length === this.nonvalidatedPrompts().length) {
      this.nonvalidatedSubmit()
    }
  }

  /**
   * Sets the values validation status, as well as handles subsequent actions,
   * such as completing the operation if all valid values are supplied, as well as
   * notifying the client of this new value's validation status.
   */
  public setValueStatus(value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts) {
    const valuesArray = valid ? this.validValues : this.invalidValues
    const matching = valuesArray.find((v) => v.prompt.validation === value.prompt.validation)
    if (matching) {
      removeFromArray(valuesArray, matching)
    }
    valuesArray.push(value)
    Object.assign(this.artifacts, artifacts)
    if (this.isFinished()) {
      this.complete()
    } else {
      if (valid) {
        this.onValidValue?.(value)
      } else {
        this.onInvalidValue?.(value)
      }
    }
  }
}
