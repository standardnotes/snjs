import { PayloadContent } from './generator';
import { ImmutablePayloadCollection } from '../collection/payload_collection';
import { PurePayload } from './pure_payload';
/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export declare function PayloadsByDuplicating(payload: PurePayload, baseCollection: ImmutablePayloadCollection, isConflict: boolean, additionalContent?: Partial<PayloadContent>): Promise<PurePayload[]>;
/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */
export declare function PayloadsByAlternatingUuid(payload: PurePayload, baseCollection: ImmutablePayloadCollection): Promise<PurePayload[]>;
/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export declare function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean;
