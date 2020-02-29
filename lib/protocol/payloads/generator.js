import {
  SNEncryptionParameters,
  SNFileItemPayload,
  SNMaxItemPayload,
  SNSavedServerItemPayload,
  SNServerItemPayload,
  SNStorageItemPayload,
  PayloadSources
} from '@Payloads';
import { EncryptionIntents } from '@Protocol';
import {
  Copy,
  deepFreeze,
  deepMerge,
  isNullOrUndefined,
  isObject,
  pickByCopy,
} from '@Lib/utils';

export function CreateMaxPayloadFromAnyObject({ object, source, intent, override }) {
  if (!isNullOrUndefined(source)) {
    throw 'Use CreateSourcedPayloadFromObject if creating payload with source.';
  }

  if (!isNullOrUndefined(intent)) {
    throw 'Use CreateIntentPayloadFromObject if creating payload with intent.';
  }

  const payloadClass = SNMaxItemPayload;
  return CreatePayload({
    object,
    payloadClass,
    override
  });
}

export function CreateIntentPayloadFromObject({ object, intent, override }) {
  const payloadClass = itemPayloadClassForIntent(intent);
  return CreatePayload({
    object,
    payloadClass,
    override
  });
}

export function CreateSourcedPayloadFromObject({ object, source, override }) {
  const payloadClass = payloadClassForSource(source);
  return CreatePayload({
    object,
    payloadClass,
    override
  });
}

function CreatePayload({ object, payloadClass, override }) {
  const rawPayload = pickByCopy(object, payloadClass.fields());
  if (override) {
    if (!isObject(override)) {
      throw 'Attempting to override payload with non-object';
    }
    deepMerge(rawPayload, Copy(override));
  }
  // eslint-disable-next-line new-cap
  return deepFreeze(new payloadClass(rawPayload, true));
}

export function CopyPayload({ payload, override }) {
  const rawPayload = pickByCopy(payload, payload.fields());
  if (override) {
    deepMerge(rawPayload, Copy(override));
  }
  return deepFreeze(new payload.constructor(rawPayload, true));
}

export function CreateEncryptionParameters(rawParameters) {
  const copy = Copy(rawParameters);
  return deepFreeze(new SNEncryptionParameters(copy, true));
}

export function CopyEncryptionParameters({ encryptionParameters, override }) {
  if (!encryptionParameters.isEncryptionParameters) {
    throw 'Attempting to copy encryption parameters from non-parameters object.';
  }
  const rawParameters = pickByCopy(encryptionParameters, SNEncryptionParameters.fields());
  if (override) {
    deepMerge(rawParameters, Copy(override));
  }
  return deepFreeze(new SNEncryptionParameters(rawParameters, true));
}

function itemPayloadClassForIntent(intent) {
  if ((
    intent === EncryptionIntents.FileEncrypted ||
    intent === EncryptionIntents.FileDecrypted ||
    intent === EncryptionIntents.FilePreferEncrypted
  )) {
    return SNFileItemPayload;
  }

  if ((
    intent === EncryptionIntents.LocalStoragePreferEncrypted ||
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.LocalStorageEncrypted
  )) {
    return SNStorageItemPayload;
  }

  if ((
    intent === EncryptionIntents.Sync ||
    intent === EncryptionIntents.SyncDecrypted
  )) {
    return SNServerItemPayload;
  } else {
    throw `No item payload class found for intent ${intent}`;
  }
}

export function payloadClassForSource(source) {
  if ((
    source === PayloadSources.FileImport
  )) {
    return SNFileItemPayload;
  }

  if ((
    source === PayloadSources.LocalRetrieved ||
    source === PayloadSources.LocalDirtied
  )) {
    return SNStorageItemPayload;
  }

  if ((
    source === PayloadSources.RemoteRetrieved ||
    source === PayloadSources.ConflictData ||
    source === PayloadSources.ConflictUuid
  )) {
    return SNServerItemPayload;
  }
  if ((
    source === PayloadSources.LocalSaved ||
    source === PayloadSources.RemoteSaved
  )) {
    return SNSavedServerItemPayload;
  } else {
    throw `No item payload class found for source ${source}`;
  }
}
