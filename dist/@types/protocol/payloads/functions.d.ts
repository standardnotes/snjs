import { ImmutablePayloadCollection } from './collection';
import { PurePayload } from './pure_payload';
export declare function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean;
/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export declare function PayloadsByDuplicating(payload: PurePayload, baseCollection: ImmutablePayloadCollection, isConflict: boolean): Promise<PurePayload[]>;
/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */
export declare function PayloadsByAlternatingUuid(payload: PurePayload, baseCollection: ImmutablePayloadCollection): Promise<PurePayload[]>;
