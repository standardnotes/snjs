export class SNKeysContent {

  constructor(content)  {
    this.content = content;
  }

  /**
   * Compares two sets of keys for equality
   * @returns Boolean
  */
  compare(otherContents) {
    return
      this.masterKey === otherContents.masterKey &&
      this.itemsMasterKey === otherContents.itemsMasterKey &&
      this.serverAuthenticationValue === otherContents.serverAuthenticationValue;
  }

}
