import { SNKeyContent } from '@Protocol/versions/key_content';

export class SNKeyContent002 extends SNKeyContent {

  get itemsKey() {
    return this.content.mk;
  }

  get masterKey() {
    return this.content.mk;
  }

  get serverAuthenticationValue() {
    return this.content.pw;
  }

  get dataAuthenticationKey() {
    return this.content.ak;
  }

  rootValues() {
    return {
      masterKey: this.masterKey,
      dataAuthenticationKey: this.dataAuthenticationKey
    }
  }

}
