import { isNullOrUndefined } from '@standardnotes/utils'
import { Challenge } from './Challenge'
import { ChallengeValue } from './ChallengeValue'
import { ChallengeArtifacts, ChallengeValidation } from './Types'

export class ChallengeResponse {
  constructor(
    public readonly challenge: Challenge,
    public readonly values: ChallengeValue[],
    public readonly artifacts?: ChallengeArtifacts,
  ) {
    Object.freeze(this)
  }

  getValueForType(type: ChallengeValidation): ChallengeValue {
    const value = this.values.find((value) => value.prompt.validation === type)
    if (isNullOrUndefined(value)) {
      throw Error('Could not find value for validation type ' + type)
    }
    return value
  }

  getDefaultValue(): ChallengeValue {
    if (this.values.length > 1) {
      throw Error('Attempting to retrieve default response value when more than one value exists')
    }
    return this.values[0]
  }
}
