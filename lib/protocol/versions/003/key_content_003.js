import { SNKeyContent } from '@Protocol/versions/key_content';

export class SNKeyContent003 extends SNKeyContent {

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
    return this.content.ak;
  }

  rootValues() {
    return {
      masterKey: this.masterKey,
      encryptionAuthenticationKey: this.encryptionAuthenticationKey
    }
  }

}
