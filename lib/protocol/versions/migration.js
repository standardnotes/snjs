import { isWebEnvironment } from '@Root/utils';

export class SNProtocolMigration {

  async run() {
    if(isWebEnvironment()) {
      return this.runDesktop();
    } else {
      return this.runMobile();
    }
  }

  async runDesktop() {
    throw 'Must override';
  }

  async runMobile() {
    throw 'Must override';
  }

}
