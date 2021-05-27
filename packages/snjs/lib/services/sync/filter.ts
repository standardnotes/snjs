import { ContentType } from '@Lib/models';
import { PayloadFormat, PurePayload } from '@Lib/protocol/payloads';

/**
 * Non-encrypted types are items whose values a server must be able to read.
 */
export const NonEncryptedTypes = Object.freeze([
  ContentType.Mfa,
  ContentType.ServerExtension,
]);

export function filterDisallowedRemotePayloads(
  payloads: PurePayload[]
): PurePayload[] {
  return payloads.filter((payload) => {
    const isEncrypted = ![
      PayloadFormat.DecryptedBareObject,
      PayloadFormat.DecryptedBase64String,
    ].includes(payload.format);
    const isAllowedDecrypted = NonEncryptedTypes.includes(payload.content_type);
    return isEncrypted || isAllowedDecrypted;
  });
}
