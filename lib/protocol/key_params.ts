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
  return new SNRootKeyParams(keyParams);
}

export function Create002KeyParams(keyParams: KeyParamsContent002) {
  return new SNRootKeyParams(keyParams);
}

export function Create003KeyParams(keyParams: KeyParamsContent003) {
  return new SNRootKeyParams(keyParams);
}

export function Create004KeyParams(keyParams: KeyParamsContent004) {
  return new SNRootKeyParams(keyParams);
}

export function CreateAnyKeyParams(keyParams: AnyKeyParamsContent) {
  return new SNRootKeyParams(keyParams);
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

  /**
   * @access public
   * When saving in a file or communicating with server,
   * use the original values.
   */
  getPortableValue() {
    return this.content;
  }
}
