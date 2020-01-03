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
    throw 'Must override SNProtocolMigration.runDesktop';
  }

  async runMobile() {
    throw 'Must override SNProtocolMigration.runMobile';
  }

}
