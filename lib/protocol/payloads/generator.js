import { SNStorageItemPayload } from '@Protocol/payloads/storage_item_payload';
import { SNServerItemPayload } from '@Protocol/payloads/server_item_payload';
import { SNFileItemPayload } from '@Protocol/payloads/file_item_payload';
import { SNMaxItemPayload } from '@Protocol/payloads/max_item_payload';
import { isNullOrUndefined } from '@Lib/utils';
import * as intents from '@Protocol/intents';
import * as sources from '@Lib/sources';
import pick from 'lodash/pick';

export function CreatePayloadFromItem({item, encryptionPayload, intent, source}) {
  if(item.constructor.name === 'Object') {
    throw 'Attempting to construct payload from non-item object.';
  }

  const payloadClass = (
    !isNullOrUndefined(intent)
    ? itemPayloadClassForIntent(intent)
    : itemPayloadClassForMappingSource(source)
  );
  const rawPayload = Object.assign(pick(item, payloadClass.fields()), encryptionPayload);
  return Object.freeze(new payloadClass(rawPayload));
}

export function CreatePayloadFromAnyObject({object, source, override}) {
  const payloadClass = (
    !isNullOrUndefined(source) ? itemPayloadClassForMappingSource(source) : SNMaxItemPayload
  );
  const rawPayload = pick(object, payloadClass.fields());
  Object.assign(rawPayload, override);
  return Object.freeze(new payloadClass(rawPayload));
}

export function CreateMaxPayloadFromItem({item, override}) {
  if(!item.isItem) {
    throw 'Attempting to create max payload from non-item object.';
  }
  const rawPayload = pick(item, SNMaxItemPayload.fields());
  Object.assign(rawPayload, override);
  return Object.freeze(new SNMaxItemPayload(rawPayload));
}

function itemPayloadClassForIntent(intent) {
  if((
    intent === intents.EncryptionIntentFileEncrypted ||
    intent === intents.EncryptionIntentFileDecrypted
  )) {
    return SNFileItemPayload;
  }

  if((
    intent === intents.EncryptionIntentLocalStoragePreferEncrypted ||
    intent === intents.EncryptionIntentLocalStorageDecrypted ||
    intent === intents.EncryptionIntentLocalStorageEncrypted
  )) {
    return SNStorageItemPayload;
  }

  if((
    intent === intents.EncryptionIntentSync
  )) {
    return SNServerItemPayload;
  } else  {
    throw `No item payload class found for intent ${intent}`;
  }
}

export function itemPayloadClassForMappingSource(source) {
  if((
    source === sources.MAPPING_SOURCE_FILE_IMPORT
  )) {
    return SNFileItemPayload;
  }

  if((
    source === sources.MAPPING_SOURCE_LOCAL_SAVED ||
    source === sources.MAPPING_SOURCE_LOCAL_RETRIEVED ||
    source === sources.MAPPING_SOURCE_LOCAL_DIRTIED
  )) {
    return SNStorageItemPayload;
  }

  if((
    source === sources.MAPPING_SOURCE_REMOTE_RETRIEVED ||
    source === sources.MAPPING_SOURCE_REMOTE_SAVED
  )) {
    return SNServerItemPayload;
  } else  {
    throw `No item payload class found for source ${source}`;
  }
}
