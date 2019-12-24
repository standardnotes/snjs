import { SNKeysContent } from '@Protocol/versions/keys_content';

export class SNKeysContent003 extends SNKeysContent {

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
    return this.content.ak;
  }

}
