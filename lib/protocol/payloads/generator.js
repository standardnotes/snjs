import { SNStorageItemPayload } from '@Protocol/payloads/storage_item_payload';
import { SNServerItemPayload } from '@Protocol/payloads/server_item_payload';
import { SNFileItemPayload } from '@Protocol/payloads/file_item_payload';
import { SNMaxItemPayload } from '@Protocol/payloads/max_item_payload';
import { SNSavedServerItemPayload } from '@Protocol/payloads/saved_server_item_payload';
import { SNEncryptionParameters } from '@Protocol/payloads/encryption_parameters';
import * as intents from '@Protocol/intents';
import * as sources from '@Lib/sources';
import {
  isNullOrUndefined,
  pickByCopy,
  deepFreeze,
  deepMergeByCopy,
  Copy
} from '@Lib/utils';

export function CreatePayloadFromAnyObject({object, source, intent, override}) {
  let payloadClass;
  if(!isNullOrUndefined(source)) {
    payloadClass = itemPayloadClassForMappingSource(source)
  } else if(!isNullOrUndefined(intent))  {
    payloadClass = itemPayloadClassForIntent(intent);
  } else {
    payloadClass = SNMaxItemPayload;
  }
  let rawPayload = pickByCopy(object, payloadClass.fields());
  if(override) {
    deepMergeByCopy(rawPayload, override);
  }
  return deepFreeze(new payloadClass(rawPayload, true));
}

export function CreateEncryptionParameters(rawParameters) {
  const copy = Copy(rawParameters);
  return deepFreeze(new SNEncryptionParameters(copy, true));
}

export function CopyEncryptionParameters({encryptionParameters, override}) {
  if(!encryptionParameters.isEncryptionParameters) {
    throw 'Attempting to copy encryption parameters from non-parameters object.';
  }
  let rawParameters = pickByCopy(encryptionParameters, SNEncryptionParameters.fields());
  if(override) {
    deepMergeByCopy(rawParameters, override);
  }
  return deepFreeze(new SNEncryptionParameters(rawParameters, true));
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
    source === sources.MAPPING_SOURCE_REMOTE_RETRIEVED
  )) {
    return SNServerItemPayload;
  }
  if((
    source === sources.MAPPING_SOURCE_REMOTE_SAVED
  )) {
    return SNSavedServerItemPayload;
  } else {
    throw `No item payload class found for source ${source}`;
  }
}
