import { PayloadField } from './fields';
import { PayloadSource } from './sources';
import { ContentType } from '../../models/content_types';
import { ProtocolVersion } from '../versions';
import { RawPayload, PayloadContent } from './generator';
import { PayloadFormat } from './formats';
/**
 * A payload is a vehicle in which item data is transported or persisted.
 * This class represents an abstract PurePayload which does not have any fields. Instead,
 * subclasses must override the `fields` static method to return which fields this particular
 * class of payload contains. For example, a ServerItemPayload is a transmission vehicle for
 * transporting an item to the server, and does not contain fields like PayloadFields.Dirty.
 * However, a StorageItemPayload is a persistence vehicle for saving payloads to disk, and does contain
 * PayloadsFields.Dirty.
 *
 * Payloads are completely immutable and may not be modified after creation. Payloads should
 * not be created directly using the constructor, but instead created using the generators avaiable
 * in generator.js.
 *
 * Payloads also have a content format. Formats can either be
 * DecryptedBase64String, EncryptedString, or DecryptedBareObject.
 */
export declare class PurePayload {
    /** When constructed, the payload takes in an array of fields that the input raw payload
     * contains. These fields allow consumers to determine whether a given payload has an actual
     * undefined value for payload.content, for example, or whether the payload was constructed
     * to omit that field altogether (as in the case of server saved payloads) */
    readonly fields: PayloadField[];
    readonly source: PayloadSource;
    readonly uuid: string;
    readonly content_type: ContentType;
    readonly content?: PayloadContent | string;
    readonly deleted?: boolean;
    readonly items_key_id?: string;
    readonly enc_item_key?: string;
    readonly created_at?: Date;
    readonly updated_at?: Date;
    readonly dirtiedDate?: Date;
    readonly dirty?: boolean;
    readonly dummy?: boolean;
    readonly errorDecrypting?: boolean;
    readonly waitingForKey?: boolean;
    readonly errorDecryptingValueChanged?: boolean;
    readonly lastSyncBegan?: Date;
    readonly lastSyncEnd?: Date;
    /** @deprecated */
    readonly auth_hash?: string;
    /** @deprecated */
    readonly auth_params?: any;
    readonly format: PayloadFormat;
    readonly version?: ProtocolVersion;
    constructor(rawPayload: RawPayload, fields: PayloadField[], source: PayloadSource);
    get safeContent(): PayloadContent;
    /** Defined to allow singular API with Payloadable type (PurePayload | SNItem) */
    get references(): import("./generator").ContentReference[];
    get safeReferences(): import("./generator").ContentReference[];
    get contentObject(): PayloadContent;
    get contentString(): string;
    /**
     * Whether a payload can be discarded and removed from storage.
     * This value is true if a payload is marked as deleted and not dirty.
     */
    get discardable(): boolean | undefined;
}
