import { ContentType } from '../../models';
import { PurePayload } from '../../protocol/payloads';
/**
 * Non-encrypted types are items whose values a server must be able to read.
 */
export declare const NonEncryptedTypes: readonly ContentType[];
export declare function filterDisallowedRemotePayloads(payloads: PurePayload[]): PurePayload[];
