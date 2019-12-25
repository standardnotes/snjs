export class SNRootKeyParams {
  constructor(content)  {
    this.content = content;
  }

  /**
   * For consumers to determine whether the object they are working with is a proper RootKeyParams object.
   */
  get isKeyParamsObject() {
    return true;
  }
}
