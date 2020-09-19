import { KeyParamsResponse } from './../services/api/responses';
import { ProtocolVersion, compareVersions } from '@Protocol/versions';

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

export enum KeyParamsOrigination {
  Registration = 'registration',
  EmailChange = 'email-change',
  PasswordChange = 'password-change',
  ProtocolUpgrade = 'protocol-upgrade',
  Passcode = 'passcode',
  PasscodeChange = 'passcode-change'
}

type BaseKeyParams = {
  /** Seconds since creation date */
  created?: string
  /** The event that lead to the creation of these params */
  origination?: KeyParamsOrigination
  version: ProtocolVersion
}

export type KeyParamsContent001 = BaseKeyParams & {
  email: string
  pw_cost: number
  pw_salt: string
}

export type KeyParamsContent002 = BaseKeyParams & {
  email: string
  pw_cost: number
  pw_salt: string
}

export type KeyParamsContent003 = BaseKeyParams & {
  identifier: string
  pw_nonce: string
}

export type KeyParamsContent004 = Required<BaseKeyParams> & {
  identifier: string
  pw_nonce: string
}

export type AnyKeyParamsContent =
  KeyParamsContent001 |
  KeyParamsContent002 |
  KeyParamsContent003 |
  KeyParamsContent004;

export function Create001KeyParams(keyParams: KeyParamsContent001) {
  return CreateAnyKeyParams(keyParams);
}

export function Create002KeyParams(keyParams: KeyParamsContent002) {
  return CreateAnyKeyParams(keyParams);
}

export function Create003KeyParams(keyParams: KeyParamsContent003) {
  return CreateAnyKeyParams(keyParams);
}

export function Create004KeyParams(keyParams: KeyParamsContent004) {
  return CreateAnyKeyParams(keyParams);
}

export function CreateAnyKeyParams(keyParams: AnyKeyParamsContent) {
  if ((keyParams as any).content) {
    throw Error('Raw key params shouldnt have content; perhaps you passed in a SNRootKeyParams object.');
  }
  return new SNRootKeyParams(keyParams);
}

export function KeyParamsFromApiResponse(response: KeyParamsResponse) {
  const rawKeyParams: AnyKeyParamsContent = {
    identifier: response.identifier!,
    pw_cost: response.pw_cost!,
    pw_nonce: response.pw_nonce!,
    pw_salt: response.pw_salt!,
    /* 002 doesn't have version automatically, newer versions do. */
    version: response.version! || ProtocolVersion.V002,
    origination: response.origination,
    created: response.created,
  }
  return CreateAnyKeyParams(rawKeyParams);
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
      origination: content.origination || KeyParamsOrigination.Registration
    };
  }

  /**
   * For consumers to determine whether the object they are
   * working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true;
  }

  get identifier() {
    return this.content004.identifier || this.content002.email;
  }

  get version() {
    return this.content.version;
  }

  get content001() {
    return this.content as KeyParamsContent001;
  }

  get content002() {
    return this.content as KeyParamsContent002;
  }

  get content003() {
    return this.content as KeyParamsContent003;
  }

  get content004() {
    return this.content as KeyParamsContent004;
  }

  get createdDate() {
    if (!this.content004.created) {
      return undefined;
    }
    return new Date(this.content004.created);
  }

  compare(other: SNRootKeyParams) {
    if (this.version !== other.version) {
      return false;
    }

    if ([ProtocolVersion.V004, ProtocolVersion.V003].includes(this.version)) {
      return (
        this.identifier === other.identifier &&
        this.content004.pw_nonce === other.content003.pw_nonce
      );
    } else if ([ProtocolVersion.V002, ProtocolVersion.V001].includes(this.version)) {
      return (
        this.identifier === other.identifier &&
        this.content002.pw_salt === other.content001.pw_salt
      );
    } else {
      throw Error('Unhandled version in KeyParams.compare');
    }
  }

  /**
   * @access public
   * When saving in a file or communicating with server,
   * use the original values.
   */
  getPortableValue() {
    return this.content;
  }
}
