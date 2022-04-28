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
import { ProtocolVersionForKeyParams } from './ProtocolVersionForKeyParams'
import { ValidKeyParamsKeys } from './ValidKeyParamsKeys'

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
      version: content.version || ProtocolVersionForKeyParams(content),
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
      return this.identifier === other.identifier && this.content004.pw_nonce === other.content003.pw_nonce
    } else if ([ProtocolVersion.V002, ProtocolVersion.V001].includes(this.version)) {
      return this.identifier === other.identifier && this.content002.pw_salt === other.content001.pw_salt
    } else {
      throw Error('Unhandled version in KeyParams.compare')
    }
  }

  /**
   * @access public
   * When saving in a file or communicating with server,
   * use the original values.
   */
  getPortableValue(): AnyKeyParamsContent {
    return pickByCopy(this.content, ValidKeyParamsKeys as (keyof AnyKeyParamsContent)[])
  }
}
