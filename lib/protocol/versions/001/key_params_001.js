import { SNRootKeyParams } from '@Protocol/versions/key_params';

export class SNRootKeyParams001 extends SNRootKeyParams {

  get kdfIterations() {
    return this.pw_cost;
  }

  get seed() {
    return this.pw_nonce;
  }

  get identifier() {
    return this.email;
  }

  get salt() {
    return this.pw_salt;
  }

}
