import { V002Algorithm } from './operator/algorithms'
import { V001Algorithm } from '@Lib/Protocol/operator/algorithms'
import { KeyParamsData, KeyParamsResponse } from '@standardnotes/responses'
import {
  KeyParamsContent001,
  KeyParamsContent002,
  KeyParamsContent003,
  KeyParamsContent004,
  AnyKeyParamsContent,
  ProtocolVersion,
  KeyParamsOrigination,
} from '@standardnotes/common'
import { pickByCopy } from '@standardnotes/utils'

/**
 *  001, 002:
 *  - Nonce is not uploaded to server, instead used to compute salt locally and send to server
 *  - Salt is returned from server
 *  - Cost/iteration count is returned from the server
 *  - Account identifier is returned as 'email'
 *  003, 004:
 *  - Salt is computed locally via the seed (pw_nonce) returned from the server
 *  - Cost/iteration count is determined locally by the protocol version
 *  - Account identifier is returned as 'identifier'
 */

const ValidKeyParamsKeys = [
  'identifier',
  'pw_cost',
  'pw_nonce',
  'pw_salt',
  'version',
  'origination',
  'created',
]

export function Create001KeyParams(keyParams: KeyParamsContent001) {
  return CreateAnyKeyParams(keyParams)
}

export function Create002KeyParams(keyParams: KeyParamsContent002) {
  return CreateAnyKeyParams(keyParams)
}

export function Create003KeyParams(keyParams: KeyParamsContent003) {
  return CreateAnyKeyParams(keyParams)
}

export function Create004KeyParams(keyParams: KeyParamsContent004) {
  return CreateAnyKeyParams(keyParams)
}

export function CreateAnyKeyParams(keyParams: AnyKeyParamsContent) {
  if ((keyParams as any).content) {
    throw Error(
      'Raw key params shouldnt have content; perhaps you passed in a SNRootKeyParams object.',
    )
  }
  return new SNRootKeyParams(keyParams)
}

function protocolVersionForKeyParams(
  response: KeyParamsData | AnyKeyParamsContent,
): ProtocolVersion {
  if (response.version) {
    return response.version
  }
  /**
   * 001 and 002 key params (as stored locally) may not report a version number.
   * In some cases it may be impossible to differentiate between 001 and 002 params,
   * but there are a few rules we can use to find a best fit.
   */
  /**
   * First try to determine by cost. If the cost appears in V002 costs but not V001 costs,
   * we know it's 002.
   */
  const cost = response.pw_cost!
  const appearsInV001 = V001Algorithm.PbkdfCostsUsed.includes(cost)
  const appearsInV002 = V002Algorithm.PbkdfCostsUsed.includes(cost)

  if (appearsInV001 && !appearsInV002) {
    return ProtocolVersion.V001
  } else if (appearsInV002 && !appearsInV001) {
    return ProtocolVersion.V002
  } else if (appearsInV002 && appearsInV001) {
    /**
     * If the cost appears in both versions, we can be certain it's 002 if it's missing
     * the pw_nonce property. (However late versions of 002 also used a pw_nonce, so its
     * presence doesn't automatically indicate 001.)
     */
    if (!response.pw_nonce) {
      return ProtocolVersion.V002
    } else {
      /**
       * We're now at the point that the cost has appeared in both versions, and a pw_nonce
       * is present. We'll have to go with what is more statistically likely.
       */
      if (V002Algorithm.ImprobablePbkdfCostsUsed.includes(cost)) {
        return ProtocolVersion.V001
      } else {
        return ProtocolVersion.V002
      }
    }
  } else {
    /** Doesn't appear in either V001 or V002; unlikely possibility. */
    return ProtocolVersion.V002
  }
}

export function KeyParamsFromApiResponse(response: KeyParamsResponse, identifier?: string) {
  const rawKeyParams: AnyKeyParamsContent = {
    identifier: identifier || response.data.identifier!,
    pw_cost: response.data.pw_cost!,
    pw_nonce: response.data.pw_nonce!,
    pw_salt: response.data.pw_salt!,
    version: protocolVersionForKeyParams(response.data),
    origination: response.data.origination,
    created: response.data.created,
  }
  return CreateAnyKeyParams(rawKeyParams)
}

/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */
export class SNRootKeyParams {
  public readonly content: AnyKeyParamsContent

  constructor(content: AnyKeyParamsContent) {
    this.content = {
      ...content,
      origination: content.origination || KeyParamsOrigination.Registration,
      version: content.version || protocolVersionForKeyParams(content),
    }
  }

  /**
   * For consumers to determine whether the object they are
   * working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true
  }

  get identifier() {
    return this.content004.identifier || this.content002.email
  }

  get version() {
    return this.content.version
  }

  get origination() {
    return this.content.origination
  }

  get content001() {
    return this.content as KeyParamsContent001
  }

  get content002() {
    return this.content as KeyParamsContent002
  }

  get content003() {
    return this.content as KeyParamsContent003
  }

  get content004() {
    return this.content as KeyParamsContent004
  }

  get createdDate() {
    if (!this.content004.created) {
      return undefined
    }
    return new Date(Number(this.content004.created))
  }

  compare(other: SNRootKeyParams) {
    if (this.version !== other.version) {
      return false
    }

    if ([ProtocolVersion.V004, ProtocolVersion.V003].includes(this.version)) {
      return (
        this.identifier === other.identifier &&
        this.content004.pw_nonce === other.content003.pw_nonce
      )
    } else if ([ProtocolVersion.V002, ProtocolVersion.V001].includes(this.version)) {
      return (
        this.identifier === other.identifier && this.content002.pw_salt === other.content001.pw_salt
      )
    } else {
      throw Error('Unhandled version in KeyParams.compare')
    }
  }

  /**
   * @access public
   * When saving in a file or communicating with server,
   * use the original values.
   */
  getPortableValue() {
    return pickByCopy(this.content, ValidKeyParamsKeys as any)
  }
}
