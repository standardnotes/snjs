import { isObject } from '@Lib/utils';

export function CreateKeyParams(keyParams) {
  return new SNRootKeyParams(keyParams);
}

/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */
export class SNRootKeyParams {
  constructor(content) {
    if(!isObject(content) || content.isKeyParamsObject) {
      throw 'Attempting to construct root key params with non-object';
    }
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
    return this.content;
  }
}
