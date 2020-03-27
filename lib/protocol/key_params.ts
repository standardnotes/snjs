import { omitByCopy } from '@Lib/utils';
import { ProtocolVersions, compareVersions } from '@Protocol/versions';

export type KeyParamsContent = {
  pw_cost: number
  pw_nonce: string
  identifier?: string
  email?: string
  pw_salt?: string
  version: ProtocolVersions
}

export function CreateKeyParams(keyParams: KeyParamsContent) {
  return new SNRootKeyParams(keyParams);
}

/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */
export class SNRootKeyParams {

  public readonly content: KeyParamsContent

  constructor(content: KeyParamsContent) {
    this.content = content;
  }

  /**
   * For consumers to determine whether the object they are
   * working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true;
  }

  get kdfIterations() {
    return this.content.pw_cost;
  }

  get seed() {
    return this.content.pw_nonce;
  }

  get identifier() {
    return this.content.identifier || this.content.email;
  }

  get salt() {
    return this.content.pw_salt;
  }

  get version() {
    return this.content.version;
  }

  /** 
   * @access public 
   * When saving in a file or communicating with server, 
   * use the original values.
   */
  getPortableValue() {
    /**
     * For version >= 003, do not send kdfIterations, as this value is always deduced
     * locally depending on the version.
     * Versions <= 002 had dynamic kdfIterations, so these values must be transfered.
     */
    if(compareVersions(this.version, ProtocolVersions.V003) >= 0) {
      return omitByCopy(this.content, ['pw_cost']);
    } else {
      return this.content;
    }
  }
}
