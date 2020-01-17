import { isObject } from '@Lib/utils';

export class SNRootKeyParams {
  constructor(content) {
    if(!isObject(content)) {
      throw 'Attempting to construct root key params with non-object';
    }
    Object.assign(this, content);
  }

  /**
   * For consumers to determine whether the object they are
   * working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true;
  }
}
