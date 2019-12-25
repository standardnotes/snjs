import { SNKeyContent } from '@Protocol/versions/key_content';

export class SNKeyContent001 extends SNKeyContent {

  constructor(content)  {
    this.content = content;
  }

  get itemsKey() {
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
