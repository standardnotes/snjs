import { SNRootKeyParams } from '@Protocol/versions/key_params';

export class SNRootKeyParams002 extends SNRootKeyParams {

  get kdfIterations() {
    return this.content.pw_cost;
  }

  get seed() {
    return this.content.pw_nonce;
  }

  get version() {
    return this.content.version;
  }

  get identifier() {
    return this.content.email;
  }

  get salt() {
    return this.content.pw_salt;
  }

}
