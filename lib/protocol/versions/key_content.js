export class SNKeyContent {

  constructor(content)  {
    this.content = content;
  }

  get version() {
    return this.content.version;
  }

  /**
   * Compares two keys for equality
   * @returns Boolean
  */
  compare(otherContents) {
    return (
      this.masterKey === otherContents.masterKey &&
      this.itemsKey === otherContents.itemsKey &&
      this.serverPassword === otherContents.serverPassword
    );
  }

  getRootValues() {
    return {
      version: this.version
    };
  }
}
