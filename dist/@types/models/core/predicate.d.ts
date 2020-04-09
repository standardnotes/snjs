import { SNItem } from './item';
declare type PredicateType = string[] | SNPredicate;
declare type PredicateArray = Array<string[]> | SNPredicate[];
declare type PredicateValue = string | Date | boolean | PredicateArray;
/**
 * A local-only construct that defines a built query that can be used to
 * dynamically search items.
 */
export declare class SNPredicate {
    private keypath;
    private operator;
    private value;
    constructor(keypath: string, operator: string, value: PredicateValue);
    static FromJson(values: any): SNPredicate;
    static FromArray(array: string[]): SNPredicate;
    isRecursive(): boolean;
    arrayRepresentation(): PredicateValue[];
    valueAsArray(): PredicateArray;
    static CompoundPredicate(predicates: PredicateArray): SNPredicate;
    static ObjectSatisfiesPredicate(object: any, predicate: PredicateType): any;
    /**
     * @param itemValueArray Because we are resolving the `includes` operator, the given
     * value should be an array.
     * @param containsValue  The value we are checking to see if exists in itemValueArray
     */
    static resolveIncludesPredicate(itemValueArray: Array<any>, containsValue: any): boolean;
    static ItemSatisfiesPredicate(item: SNItem, predicate: SNPredicate): any;
    static ItemSatisfiesPredicates(item: SNItem, predicates: SNPredicate[]): boolean;
    /**
     * Predicate date strings are of form "x.days.ago" or "x.hours.ago"
     */
    static DateFromString(string: string): Date;
}
export {};
