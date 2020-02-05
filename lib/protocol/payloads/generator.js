import { SNStorageItemPayload } from '@Payloads/storage_item_payload';
import { SNServerItemPayload } from '@Payloads/server_item_payload';
import { SNFileItemPayload } from '@Payloads/file_item_payload';
import { SNMaxItemPayload } from '@Payloads/max_item_payload';
import { SNSavedServerItemPayload } from '@Payloads/saved_server_item_payload';
import { SNEncryptionParameters } from '@Payloads/encryption_parameters';
import * as intents from '@Protocol/intents';
import * as sources from '@Lib/protocol/payloads/sources';
import {
  isNullOrUndefined,
  pickByCopy,
  deepFreeze,
  deepMergeByCopy,
  isObject,
  Copy
} from '@Lib/utils';

export function CreateMaxPayloadFromAnyObject({object, source, intent, override}) {
  if(!isNullOrUndefined(source)) {
    throw 'Use CreateSourcedPayloadFromObject if creating payload with source.';
  }

  if(!isNullOrUndefined(intent)) {
    throw 'Use CreateIntentPayloadFromObject if creating payload with intent.';
  }

  const payloadClass = SNMaxItemPayload;
  return CreatePayload({
    object,
    payloadClass,
    override
  })
}

export function CreateIntentPayloadFromObject({object, intent, override }) {
  const payloadClass = itemPayloadClassForIntent(intent);
  return CreatePayload({
    object,
    payloadClass,
    override
  })
}

export function CreateSourcedPayloadFromObject({object, source, override }) {
  const payloadClass = payloadClassForSource(source)
  return CreatePayload({
    object,
    payloadClass,
    override
  })
}

function CreatePayload({object, payloadClass, override}) {
  const rawPayload = pickByCopy(object, payloadClass.fields());
  if(override) {
    if(!isObject(override)) {
      throw 'Attempting to override payload with non-object';
    }
    deepMergeByCopy(rawPayload, override);
  }
  return deepFreeze(new payloadClass(rawPayload, true));
}

export function CopyPayload({payload, override}) {
  const rawPayload = pickByCopy(payload, payload.fields());
  if(override) {
    deepMergeByCopy(rawPayload, override);
  }
  return deepFreeze(new payload.constructor(rawPayload, true));
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

export function payloadClassForSource(source) {
  if((
    source === PayloadSoures.FileImport
  )) {
    return SNFileItemPayload;
  }

  if((
    source === PayloadSoures.LocalSaved ||
    source === PayloadSoures.LocalRetrieved ||
    source === PayloadSoures.LocalDirted
  )) {
    return SNStorageItemPayload;
  }

  if((
    source === PayloadSoures.RemoteRetrieved ||
    source === PayloadSoures.ConflictData ||
    source === PayloadSoures.ConflictUuid
  )) {
    return SNServerItemPayload;
  }
  if((
    source === PayloadSoures.RemoteSaved
  )) {
    return SNSavedServerItemPayload;
  } else {
    throw `No item payload class found for source ${source}`;
  }
}
