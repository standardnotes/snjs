import { SNKeyContent } from '@Protocol/versions/key_content';

export class SNKeyContent001 extends SNKeyContent {

  get itemsKey() {
    return this.content.mk;
  }

  get masterKey() {
    return this.content.mk;
  }

  get serverPassword() {
    return this.content.pw;
  }

  get dataAuthenticationKey() {
    throw "Should not attempt to access this value using this protocol version.";
    return null;
  }

  rootValues() {
    return {
      masterKey: this.masterKey
    }
  }

}
