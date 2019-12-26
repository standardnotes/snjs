import { SNRootKeyParams } from '@Protocol/versions/key_params';

export class SNRootKeyParams003 extends SNRootKeyParams {

  get kdfIterations() {
    return this.pw_cost;
  }

  get seed() {
    return this.pw_nonce;
  }

}
