import { SNTag } from './tag';
import { SNPredicate } from '../core/predicate';
import { PurePayload } from './../../protocol/payloads/pure_payload';
export declare const SMART_TAG_DSL_PREFIX = "![";
declare type SmartTagPredicateOperator = 'and' | 'or' | 'not' | '!=' | '=' | '<' | '>' | '>=' | '<=' | 'startsWith' | 'in' | 'includes' | 'matches';
export interface SmartTagPredicateContent {
    keypath: string;
    operator: SmartTagPredicateOperator;
    value: string | Date | boolean | number | boolean | SmartTagPredicateContent;
}
/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export declare class SNSmartTag extends SNTag {
    readonly predicate: SNPredicate;
    constructor(payload: PurePayload);
}
export {};
