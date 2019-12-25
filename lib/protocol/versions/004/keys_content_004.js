import { SNKeysContent } from '@Protocol/versions/keys_content';

export class SNKeysContent004 extends SNKeysContent {

  constructor(content)  {
    this.content = content;
  }

  get itemsMasterKey() {
    return this.content.itemsMasterKey;
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
