import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import { SN_PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import pick from 'lodash/pick';

export class SNPureItemPayload extends SNPurePayload {

  static fields() {
    throw 'Must override SNPureItemPayload.fields';
  }

  get version() {
    return this.content.substring(0, SN_PROTOCOL_VERSION_LENGTH);
  }
}
