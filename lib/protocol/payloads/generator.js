import { SNStorageItemPayload } from '@Protocol/payloads/storage_item_payload';
import { SNServerItemPayload } from '@Protocol/payloads/server_item_payload';
import { SNFileItemPayload } from '@Protocol/payloads/file_item_payload';
import { SNMaxItemPayload } from '@Protocol/payloads/max_item_payload';
import { SNEncryptionParameters } from '@Protocol/payloads/encryption_parameters';
import { isNullOrUndefined, omitByCopy } from '@Lib/utils';
import * as intents from '@Protocol/intents';
import * as sources from '@Lib/sources';
import pick from 'lodash/pick';

export function CreatePayloadFromAnyObject({object, source, override, omit}) {
  const payloadClass = (
    !isNullOrUndefined(source) ? itemPayloadClassForMappingSource(source) : SNMaxItemPayload
  );
  let rawPayload = pick(object, payloadClass.fields());
  Object.assign(rawPayload, override);
  if(omit) {
    rawPayload = omitByCopy(rawPayload, omit);
  }
  return Object.freeze(new payloadClass(rawPayload, true));
}

export function CreateEncryptionParameters(rawParameters) {
  return Object.freeze(new SNEncryptionParameters(rawParameters, true));
}

export function CopyEncryptionParameters({encryptionParameters, override, omit}) {
  if(!encryptionParameters.isEncryptionParameters) {
    throw 'Attempting to copy encryption parameters from non-parameters object.';
  }
  let rawParameters = pick(encryptionParameters, SNEncryptionParameters.fields());
  Object.assign(rawParameters, override);
  if(omit) {
    rawParameters = omitByCopy(rawParameters, omit);
  }
  return Object.freeze(new SNEncryptionParameters(rawParameters, true));
}

function itemPayloadClassForIntent(intent) {
  if((
    intent === intents.ENCRYPTION_INTENT_FILE_ENCRYPTED ||
    intent === intents.ENCRYPTION_INTENT_FILE_DECRYPTED
  )) {
    return SNFileItemPayload;
  }

  if((
    intent === intents.ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED ||
    intent === intents.ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED ||
    intent === intents.ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
  )) {
    return SNStorageItemPayload;
  }

  if((
    intent === intents.ENCRYPTION_INTENT_SYNC
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
