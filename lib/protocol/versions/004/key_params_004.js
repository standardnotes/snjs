import { SNRootKeyParams } from '@Protocol/versions/key_params';

export class SNRootKeyParams004 extends SNRootKeyParams {

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
