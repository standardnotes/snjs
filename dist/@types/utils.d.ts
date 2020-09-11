/// <reference types="node" />
import { AnyRecord } from './types';
export declare function getGlobalScope(): (Window & typeof globalThis) | (NodeJS.Global & typeof globalThis) | null;
export declare function dictToArray<T>(dict: Record<any, T>): NonNullable<T>[];
/**
 * Whether we are in a web browser
 */
export declare function isWebEnvironment(): boolean;
/**
 * Returns true if WebCrypto is available
 * @access public
 */
export declare function isWebCryptoAvailable(): boolean;
/**
 * Whether we are in React Native app
 */
export declare function isReactNativeEnvironment(): boolean;
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export declare function findInArray<T>(array: T[], key: keyof T, value: any): T | undefined;
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export declare function searchArray<T>(array: T[], predicate: Partial<T>): T | undefined;
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export declare function concatArrays(...args: any[]): any[];
/**
 * @returns Whether the value is a function or object
 */
export declare function isObject(value: any): boolean;
/**
 * @returns Whether the value is a function
 */
export declare function isFunction(value: any): boolean;
/**
 * @returns True if the object is null or undefined, otherwise false
 */
export declare function isNullOrUndefined(value: any): value is null | undefined;
/**
 * @returns Whether the value is a string
 */
export declare function isString(value: any): boolean;
/**
 * @returns The greater of the two dates
 */
export declare function greaterOfTwoDates(dateA: Date, dateB: Date): Date;
/**
 * Returns a new array containing only unique values by combining the two input arrays.
 * Elements are unique based on the values of `equalityKeys`.
 * @param equalityKeys - Keys to determine element equality
 * @returns Array containing unique values
 */
export declare function uniqCombineObjArrays(arrayA: any[], arrayB: any[], equalityKeys: string[]): any[];
/**
 * Returns a new array containing only unique values
 * @returns Array containing unique values
 */
export declare function uniqueArray(array: any[]): any[];
/**
 * Returns the last element in the array.
 * @returns The last element in the array
 */
export declare function lastElement(array: any[]): any;
/**
 * Adds all items from otherArray into inArray, in-place.
 * Does not return a value.
 */
export declare function extendArray<T>(inArray: T[], otherArray: T[]): void;
/**
 * Removes all items appearing in toSubtract from inArray, in-place
 * @param toSubtract - The list of items to remove from inArray
 */
export declare function subtractFromArray<T>(inArray: T[], toSubtract: T[]): void;
/**
 * Removes the first matching element of an array by strict equality.
 * If no matchin element is found, the array is left unchanged.
 */
export declare function removeFromArray<T>(array: T[], value: T): void;
/**
 * Adds the element to the array if the array does not already include the value.
 * The array is searched via array.indexOf
 * @returns true if value was added
 */
export declare function addIfUnique<T>(array: T[], value: T): boolean;
/**
 * Removes an object from the array in-place by searching for an object where all the
 * key/values in predicate match with the candidate element.
 */
export declare function filterFromArray<T>(array: T[], predicate: Partial<Record<keyof T, any>>): void;
/**
 * Returns a new array by removing all elements in subtract from array
 */
export declare function arrayByDifference<T>(array: T[], subtract: T[]): T[];
export declare function compareValues<T>(left: T, right: T): boolean;
/**
 * Removes the value from the array at the given index, in-place.
 */
export declare function removeFromIndex(array: any[], index: number): void;
/**
 * Adds the value from the array at the given index, in-place.
 */
export declare function addAtIndex<T>(array: T[], element: T, index: number): void;
/**
 * Returns a new array by removeing the value from the array at the given index
 */
export declare function arrayByRemovingFromIndex<T>(array: T[], index: number): T[];
/**
 * Returns an array where each element is the value of a top-level
 * object key.
 * Example: objectToValueArray({a: 1, b: 2}) returns [1, 2]
 */
export declare function objectToValueArray(object: AnyRecord): any[];
/**
 * Returns a key-sorted copy of the object.
 * For example, sortedCopy({b: '1', a: '2'}) returns {a: '2', b: '1'}
 */
export declare function sortedCopy(object: any): any;
/** Compares for equality by comparing top-level keys value equality (===) */
export declare function topLevelCompare<T>(left: T, right: T): boolean;
/**
 * Returns a new object by attempting to JSON.parse any top-level object keys.
 */
export declare function jsonParseEmbeddedKeys(object: AnyRecord): Partial<Record<string, any>>;
/**
 * Deletes keys of the input object.
 */
export declare function omitInPlace<T>(object: T, keys: Array<keyof T>): void;
/**
 * Creates a new object by omitting `keys` from `object`
 */
export declare function omitByCopy<T>(object: T, keys: Array<keyof T>): {} & T;
/**
 * Similiar to Node's path.join, this function combines an array of paths into
 * one resolved path.
 */
export declare function joinPaths(...args: string[]): string;
/**
 * Creates a copy of the input object by JSON stringifying the object then JSON parsing
 * the string (if the input is an object). If input is date, a Date copy will be created,
 * and if input is a primitive value, it will be returned as-is.
 */
export declare function Copy(object: any): any;
/**
 * Merges the second object parameter into the first object, in-place.
 * @returns The now modified first object parameter passed into the function.
 */
export declare function deepMerge(a: AnyRecord, b: AnyRecord): Partial<Record<string, any>>;
/**
 * Returns a new object by selecting certain keys from input object.
 */
export declare function pickByCopy<T>(object: T, keys: Array<keyof T>): any;
/**
 * Recursively makes an object immutable via Object.freeze
 */
export declare function deepFreeze(object: any): any;
/**
 * Determines if an object has a getter defined for a given property
 */
export declare function hasGetter(object: any, property: string): boolean | undefined;
/**
  * Truncates a hex string into a desired number of bits
  * @returns A hexadecimal string truncated to the number of desired bits
  */
export declare function truncateHexString(string: string, desiredBits: number): string;
/**
 * When awaited, this function allows code execution to pause for a set time.
 * Should be used primarily for testing.
 */
export declare function sleep(milliseconds: number): Promise<unknown>;
