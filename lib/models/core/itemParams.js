import omit from 'lodash/omit';
import merge from 'lodash/merge';
import pick from 'lodash/pick';

import { SNJS } from '@Lib/standard_notes';

export class SFItemParams {

  constructor(item, keys, auth_params) {
    this.item = item;
    this.keys = keys;
    this.auth_params = auth_params;

    if(this.keys && !this.auth_params) {
      throw "SFItemParams.auth_params must be supplied if supplying keys.";
    }

    if(this.auth_params && !this.auth_params.version) {
      throw "SFItemParams.auth_params is missing version";
    }
  }

  async paramsForExportFile(includeDeleted) {
    this.forExportFile = true;
    if(includeDeleted) {
      return this.__params();
    } else {
      var result = await this.__params();
      return omit(result, ["deleted"]);
    }
  }

  async paramsForExtension() {
    return this.paramsForExportFile();
  }

  async paramsForLocalStorage() {
    this.additionalFields = ["dirty", "dirtiedDate", "errorDecrypting"];
    this.forExportFile = true;
    return this.__params();
  }

  async paramsForSync() {
    return this.__params();
  }

  async __params() {

    var params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at, updated_at: this.item.updated_at};
    if(!this.item.errorDecrypting) {
      // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
      var doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;
      if(this.keys && !doNotEncrypt) {
        var encryptedParams = await SNJS.itemTransformer.encryptItem(this.item, this.keys, this.auth_params);
        merge(params, encryptedParams);

        if(this.auth_params.version !== "001") {
          params.auth_hash = null;
        }
      }
      else {
        params.content = this.forExportFile ? this.item.createContentJSONFromProperties() : "000" + await SNJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));
        if(!this.forExportFile) {
          params.enc_item_key = null;
          params.auth_hash = null;
        }
      }
    } else {
      // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
      params.content = this.item.content;
      params.enc_item_key = this.item.enc_item_key;
      params.auth_hash = this.item.auth_hash;
    }

    if(this.additionalFields) {
      merge(params, pick(this.item, this.additionalFields));
    }

    return params;
  }


}
