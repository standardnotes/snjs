import { PayloadFormat, PurePayload } from '@Lib/protocol/payloads';

export function filterDisallowedRemotePayloads(
  payloads: PurePayload[]
): PurePayload[] {
  return payloads.filter(isRemotePayloadAllowed);
}

export function isRemotePayloadAllowed(payload: PurePayload): boolean {
  if (payload.format === PayloadFormat.Deleted) {
    return payload.content == undefined;
  }

  const acceptableFormats = [
    PayloadFormat.EncryptedString,
    PayloadFormat.MetadataOnly,
  ];

  return acceptableFormats.includes(payload.format);
}
