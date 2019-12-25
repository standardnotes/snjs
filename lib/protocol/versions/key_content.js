export class SNKeyContent {

  constructor(content)  {
    this.content = content;
  }

  /**
   * Compares two keys for equality
   * @returns Boolean
  */
  compare(otherContents) {
    return
      this.masterKey === otherContents.masterKey &&
      this.itemsKey === otherContents.itemsKey &&
      this.serverAuthenticationValue === otherContents.serverAuthenticationValue;
  }

}
