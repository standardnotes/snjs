import {
  SNFileItemPayload,
  SNMaxItemPayload,
  SNSavedServerItemPayload,
  SNServerItemPayload,
  SNStorageItemPayload,
  RetrievedComponentPayload,
  PayloadSources,
  PurePayload,
  SessionHistoryPayload
} from '@Payloads/index';
import { EncryptionIntents } from '@Protocol/intents';
import {
  Copy,
  deepFreeze,
  deepMerge,
  isNullOrUndefined,
  isObject,
  pickByCopy,
} from '@Lib/utils';
import { PayloadOverride } from '@Payloads/override';
import { EncryptionParameters, RawEncryptionParameters } from '@Payloads/encryption_parameters';

export function CreateMaxPayloadFromAnyObject(
  object: object,
  source?: PayloadSources,
  intent?: EncryptionIntents,
  override?: PayloadOverride
) {
  if (!isNullOrUndefined(source as any)) {
    throw 'Use CreateSourcedPayloadFromObject if creating payload with source.';
  }

  if (!isNullOrUndefined(intent as any)) {
    throw 'Use CreateIntentPayloadFromObject if creating payload with intent.';
  }

  const payloadClass = SNMaxItemPayload;
  return CreatePayload(
    object,
    payloadClass,
    override
  );
}

export function CreateIntentPayloadFromObject(
  object: any,
  intent: EncryptionIntents,
  override?: PayloadOverride
) {
  const payloadClass = itemPayloadClassForIntent(intent);
  return CreatePayload(
    object,
    payloadClass,
    override
  );
}

export function CreateSourcedPayloadFromObject(
  object: object,
  source: PayloadSources,
  override?: PayloadOverride
) {
  const payloadClass = payloadClassForSource(source);
  return CreatePayload(
    object,
    payloadClass,
    override
  );
}

function CreatePayload(
  object: object,
  payloadClass: typeof PurePayload,
  override?: PayloadOverride
): PurePayload {
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

export function CopyPayload(
  payload: PurePayload,
  override?: PayloadOverride
): PurePayload {
  const rawPayload = pickByCopy(payload, payload.fields());
  if (override) {
    deepMerge(rawPayload, Copy(override));
  }
  return deepFreeze(new (payload.constructor as any)(rawPayload, true));
}

export function CreateEncryptionParameters(
  rawParameters: RawEncryptionParameters | PurePayload
): EncryptionParameters {
  const copy = Copy(rawParameters);
  return deepFreeze(new EncryptionParameters(copy, true));
}

export function CopyEncryptionParameters(
  encryptionParameters: EncryptionParameters,
  override?: PayloadOverride
): EncryptionParameters {
  const rawParameters = pickByCopy(encryptionParameters, EncryptionParameters.fields());
  if (override) {
    deepMerge(rawParameters, Copy(override));
  }
  return deepFreeze(new EncryptionParameters(rawParameters, true));
}

function itemPayloadClassForIntent(intent: EncryptionIntents) {
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

export function payloadClassForSource(source: PayloadSources) {
  if (source === PayloadSources.FileImport) {
    return SNFileItemPayload;
  }

  if (source === PayloadSources.SessionHistory) {
    return SessionHistoryPayload;
  }

  if (source === PayloadSources.ComponentRetrieved) {
    return RetrievedComponentPayload;
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
