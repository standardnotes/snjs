import { SNKeyContent } from '@Protocol/versions/key_content';

export class SNKeyContent004 extends SNKeyContent {

  constructor(content)  {
    this.content = content;
  }

  get itemsKey() {
    return this.content.itemsKey;
  }

  get masterKey() {
    return this.content.masterKey;
  }

  get serverAuthenticationValue() {
    return this.content.serverPassword;
  }

  get encryptionAuthenticationKey() {
    throw "Should not attempt to access this value using this protocol version.";
    return null;
  }

  rootValues() {
    return {
      masterKey: this.masterKey
    }
  }

}
