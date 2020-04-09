import { PayloadSource } from './sources';
import { ContentType } from '../../models/content_types';
import { PurePayload } from './index';
import { EncryptionIntent } from '../intents';
import { PayloadField } from './fields';
export declare type ContentReference = {
    uuid: string;
    content_type: string;
};
export declare type PayloadContent = {
    [key: string]: any;
    references: ContentReference[];
};
export declare type PayloadOverride = {
    [key in PayloadField]?: any;
} | PurePayload;
export declare type RawPayload = {
    uuid: string;
    content_type: ContentType;
    content?: PayloadContent | string;
    deleted?: boolean;
    items_key_id?: string;
    enc_item_key?: string;
    created_at?: Date;
    updated_at?: Date;
    dirtiedDate?: Date;
    dirty?: boolean;
    dummy?: boolean;
    errorDecrypting?: boolean;
    waitingForKey?: boolean;
    errorDecryptingValueChanged?: boolean;
    lastSyncBegan?: Date;
    lastSyncEnd?: Date;
    auth_hash?: string;
    auth_params?: any;
};
export declare type RawEncryptionParameters = {
    uuid?: string;
    content?: PayloadContent | string;
    items_key_id?: string;
    enc_item_key?: string;
    errorDecrypting?: boolean;
    waitingForKey?: boolean;
    errorDecryptingValueChanged?: boolean;
    auth_hash?: string;
    auth_params?: any;
};
export declare function CreateMaxPayloadFromAnyObject(object: RawPayload, source?: PayloadSource, intent?: EncryptionIntent, override?: PayloadOverride): PurePayload;
export declare function CreateIntentPayloadFromObject(object: RawPayload, intent: EncryptionIntent, override?: PayloadOverride): PurePayload;
export declare function CreateSourcedPayloadFromObject(object: RawPayload, source: PayloadSource, override?: PayloadOverride): PurePayload;
export declare function CopyPayload(payload: PurePayload, override?: PayloadOverride): PurePayload;
export declare function CreateEncryptionParameters(raw: RawEncryptionParameters): PurePayload;
export declare function CopyEncryptionParameters(raw: RawEncryptionParameters, override?: PayloadOverride): PurePayload;
export declare function payloadFieldsForSource(source: PayloadSource): PayloadField[];
