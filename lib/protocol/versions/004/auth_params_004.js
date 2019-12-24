import { SNAuthParams } from '@Protocol/versions/auth_params';

export class SNAuthParams004 extends SNAuthParams {

  get kdfIterations() {
    return this.content.iterations;
  }

  get seed() {
    return this.content.seed;
  }

  get version() {
    return this.content.version;
  }

  get identifier() {
    return this.content.identifier;
  }

}
