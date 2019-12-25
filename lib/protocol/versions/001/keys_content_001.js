import { SNKeysContent } from '@Protocol/versions/keys_content';

export class SNKeysContent001 extends SNKeysContent {

  constructor(content)  {
    this.content = content;
  }

  get itemsMasterKey() {
    return this.content.mk;
  }

  get masterKey() {
    return this.content.mk;
  }

  get serverAuthenticationValue() {
    return this.content.pw;
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
