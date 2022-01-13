import { PayloadFormat, PurePayload } from '@Lib/protocol/payloads';

export function filterDisallowedRemotePayloads(
  payloads: PurePayload[]
): PurePayload[] {
  return payloads.filter((payload) => {
    const isEncrypted = ![
      PayloadFormat.DecryptedBareObject,
      PayloadFormat.DecryptedBase64String,
    ].includes(payload.format);

    if (!isEncrypted) {
      console.error('Filtering disallowed payload', payload);
    }

    return isEncrypted;
  });
}
