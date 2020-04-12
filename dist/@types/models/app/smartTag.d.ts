import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNTag } from './tag';
import { SNPredicate } from '../core/predicate';
/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export declare class SNSmartTag extends SNTag {
    readonly predicate: SNPredicate;
    constructor(payload: PurePayload);
    static systemSmartTags(): SNSmartTag[];
}
