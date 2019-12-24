import { SNAuthParams } from '@Protocol/versions/auth_params';

export class SNAuthParams001 extends SNAuthParams {

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

}
