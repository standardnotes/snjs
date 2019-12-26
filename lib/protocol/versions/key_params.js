export class SNRootKeyParams {
  constructor(content)  {
    Object.assign(this, content);
  }

  /**
   * For consumers to determine whether the object they are working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true;
  }
}
