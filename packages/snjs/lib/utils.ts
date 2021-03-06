import remove from 'lodash/remove';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniqWith from 'lodash/uniqWith';
import uniq from 'lodash/uniq';
import { AnyRecord } from './types';

export function getGlobalScope(): Window | unknown | null {
  return typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
      ? global
      : null;
}

export function dictToArray<T>(dict: Record<any, T>) {
  return Object.keys(dict).map((key) => dict[key]!);
}

/**
 * Whether we are in a web browser
 */
export function isWebEnvironment(): boolean {
  return getGlobalScope() !== null;
}

/**
 * Returns true if WebCrypto is available
 * @access public
 */
export function isWebCryptoAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore documentMode does not exit in definitions but might exist on IE
  return (
    (isWebEnvironment() &&
      !isReactNativeEnvironment() &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore documentMode exists for IE and we need to check if IE
      !(document && document.documentMode)) ||
    (/Edge/.test(navigator.userAgent) &&
      window.crypto &&
      !!window.crypto.subtle)
  );
}

/**
 * Whether we are in React Native app
 */
export function isReactNativeEnvironment(): boolean {
  return (
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative'
  );
}

/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export function findInArray<T>(
  array: T[],
  key: keyof T,
  value: any
): T | undefined {
  return array.find((item: any) => item[key] === value) as T;
}

/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export function searchArray<T>(
  array: T[],
  predicate: Partial<T>
): T | undefined {
  return find(array, predicate) as T;
}

/**
 * @returns An array that is all the passed arrays joined togeather
 */
export function concatArrays(...args: any[]) {
  let result: any[] = [];
  for (const array of args) {
    result = result.concat(array);
  }
  return result;
}

/**
 * @returns Whether the value is a function or object
 */
export function isObject<T>(value: T | null): boolean {
  if (value === null) {
    return false;
  }
  return typeof value === 'function' || typeof value === 'object';
}

/**
 * @returns Whether the value is a function
 */
export function isFunction(value: any): boolean {
  if (value === null) {
    return false;
  }
  return typeof value === 'function';
}

/**
 * @returns True if the object is null or undefined, otherwise false
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * @returns Whether the value is a string
 */
export function isString(value: any) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * @returns The greater of the two dates
 */
export function greaterOfTwoDates(dateA: Date, dateB: Date) {
  if (dateA > dateB) {
    return dateA;
  } else {
    return dateB;
  }
}

/**
 * Returns a new array containing only unique values by combining the two input arrays.
 * Elements are unique based on the values of `equalityKeys`.
 * @param equalityKeys - Keys to determine element equality
 * @returns Array containing unique values
 */
export function uniqCombineObjArrays(
  arrayA: any[],
  arrayB: any[],
  equalityKeys: string[]
) {
  return uniqWith(arrayA.concat(arrayB), (a: any, b: any) => {
    for (const key of equalityKeys) {
      if (a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Returns a new array containing only unique values
 * @returns Array containing unique values
 */
export function uniqueArray<T>(array: T[]): T[] {
  return uniq(array);
}

/**
 * Returns the last element in the array.
 * @returns The last element in the array
 */
export function lastElement<T>(array: T[]): T {
  return array[array.length - 1];
}

/**
 * Adds all items from otherArray into inArray, in-place.
 * Does not return a value.
 */
export function extendArray<T>(inArray: T[], otherArray: T[]): void {
  for (const value of otherArray) {
    inArray.push(value);
  }
}

/**
 * Removes all items appearing in toSubtract from inArray, in-place
 * @param toSubtract - The list of items to remove from inArray
 */
export function subtractFromArray<T>(inArray: T[], toSubtract: T[]): void {
  for (const value of toSubtract) {
    removeFromArray(inArray, value);
  }
}

/**
 * Removes the first matching element of an array by strict equality.
 * If no matchin element is found, the array is left unchanged.
 */
export function removeFromArray<T>(array: T[], value: T): void {
  const valueIndex = array.indexOf(value);
  if (valueIndex === -1) {
    return;
  }
  array.splice(valueIndex, 1);
}

/**
 * Adds the element to the array if the array does not already include the value.
 * The array is searched via array.indexOf
 * @returns true if value was added
 */
export function addIfUnique<T>(array: T[], value: T): boolean {
  if (!array.includes(value)) {
    array.push(value);
    return true;
  }
  return false;
}

/**
 * Removes an object from the array in-place by searching for an object where all the
 * key/values in predicate match with the candidate element.
 */
export function filterFromArray<T>(
  array: T[],
  predicate: Partial<Record<keyof T, any>>
): void {
  remove(array, predicate);
}

/**
 * Returns a new array by removing all elements in subtract from array
 */
export function arrayByDifference<T>(array: T[], subtract: T[]): T[] {
  return array
    .filter((x) => !subtract.includes(x))
    .concat(subtract.filter((x) => !array.includes(x)));
}

export function compareValues<T>(left: T, right: T): boolean {
  if ((left && !right) || (!left && right)) {
    return false;
  }
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  } else if (left instanceof String && right instanceof String) {
    return left === right;
  } else {
    return topLevelCompare(left, right);
  }
}

/**
 * Removes the value from the array at the given index, in-place.
 */
export function removeFromIndex<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

/**
 * Adds the value from the array at the given index, in-place.
 */
export function addAtIndex<T>(array: T[], element: T, index: number): void {
  array.splice(index, 0, element);
}

/**
 * Returns a new array by removeing the value from the array at the given index
 */
export function arrayByRemovingFromIndex<T>(array: T[], index: number): T[] {
  const copy = array.slice();
  removeFromIndex(copy, index);
  return copy;
}

/**
 * Returns an array where each element is the value of a top-level
 * object key.
 * Example: objectToValueArray({a: 1, b: 2}) returns [1, 2]
 */
export function objectToValueArray(object: AnyRecord): string[] {
  const values = [];
  for (const key of Object.keys(object)) {
    values.push(object[key]);
  }
  return values;
}

/**
 * Returns a key-sorted copy of the object.
 * For example, sortedCopy({b: '1', a: '2'}) returns {a: '2', b: '1'}
 */
export function sortedCopy(object: AnyRecord): AnyRecord {
  const keys = Object.keys(object).sort();
  const result: AnyRecord = {};
  for (const key of keys) {
    result[key] = object[key];
  }
  return Copy(result);
}

/** Returns a new object by omitting any keys which have an undefined or null value  */
export function omitUndefinedCopy(object: AnyRecord): AnyRecord {
  const result: AnyRecord = {};
  for (const key of Object.keys(object)) {
    if (!isNullOrUndefined(object[key])) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * Returns a new array by sorting an array of elements based on a date property,
 * as indicated by the input key value.
 */
export function dateSorted<T>(elements: T[], key: keyof T, ascending = true): T[] {
  return elements.sort((a, b) => {
    const aTimestamp = ((a[key] as unknown) as Date).getTime();
    const bTimestamp = ((b[key] as unknown) as Date).getTime();
    const vector = ascending ? 1 : -1;
    if (aTimestamp < bTimestamp) {
      return -1 * vector;
    } else if (aTimestamp > bTimestamp) {
      return 1 * vector;
    } else {
      return 0;
    }
  });
}

/** Compares for equality by comparing top-level keys value equality (===) */
export function topLevelCompare<T>(left: T, right: T): boolean {
  if (!left && !right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const key of leftKeys) {
    if ((left as AnyRecord)[key] !== (right as AnyRecord)[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Returns a new object by attempting to JSON.parse any top-level object keys.
 */
export function jsonParseEmbeddedKeys(object: AnyRecord): AnyRecord {
  const result: AnyRecord = {};
  for (const key of Object.keys(object)) {
    let value;
    try {
      value = JSON.parse(object[key]);
    } catch (error) {
      value = object[key];
    }
    result[key] = value;
  }
  return result;
}

/**
 * Deletes keys of the input object.
 */
export function omitInPlace<T>(object: T, keys: Array<keyof T>): T | undefined {
  if (!object) {
    return;
  }
  for (const key of keys) {
    delete object[key];
  }
}

/**
 * Creates a new object by omitting `keys` from `object`
 */
export function omitByCopy<T>(object: T, keys: Array<keyof T>): T | undefined {
  if (isNullOrUndefined(object)) {
    return undefined;
  }
  const newObject = Object.assign({}, object);
  /**
   * Lodash's omit, which was previously used, seems to cause unexpected behavior
   * when payload is an ES6 item class. So we instead manually omit each key.
   */
  for (const key of keys) {
    delete newObject[key];
  }
  return newObject;
}

/**
 * Similiar to Node's path.join, this function combines an array of paths into
 * one resolved path.
 */
export function joinPaths(...args: string[]): string {
  return args
    .map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[/]*$/g, '');
      } else {
        return part.trim().replace(/(^[/]*|[/]*$)/g, '');
      }
    })
    .filter((x) => x.length)
    .join('/');
}

/**
 * Creates a copy of the input object by JSON stringifying the object then JSON parsing
 * the string (if the input is an object). If input is date, a Date copy will be created,
 * and if input is a primitive value, it will be returned as-is.
 */
export function Copy(object: AnyRecord): AnyRecord {
  if (object instanceof Date) {
    return new Date(object);
  } else if (isObject(object)) {
    return JSON.parse(JSON.stringify(object));
  } else {
    return object;
  }
}

/**
 * Merges the second object parameter into the first object, in-place.
 * @returns The now modified first object parameter passed into the function.
 */
export function deepMerge(a: any, b: any) {
  /**
   * lodash.merge will not merge a full array with an empty one.
   * deepMerge will replace arrays wholesale
   */
  if (!a || !b) {
    throw 'Attempting to deepMerge with null values';
  }
  const customizer = (aValue: any, bValue: any) => {
    if (isArray(aValue)) {
      return bValue;
    }
  };
  mergeWith(a, b, customizer);
  return a;
}

/**
 * Returns a new object by selecting certain keys from input object.
 */
export function pickByCopy(object: AnyRecord, keys: Array<keyof AnyRecord>): AnyRecord {
  const result = {} as AnyRecord;
  for (const key of keys) {
    result[key] = object[key];
  }
  return Copy(result);
}

/**
 * Recursively makes an object immutable via Object.freeze
 */
export function deepFreeze(object: AnyRecord): AnyRecord {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      object[name] = deepFreeze(value);
    } else {
      object[name] = value;
    }
  }

  return Object.freeze(object);
}

/**
 * Determines if an object has a getter defined for a given property
 */
export function hasGetter(object: AnyRecord, property: string): boolean {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(object),
    property
  );
  return !!descriptor && !isNullOrUndefined(descriptor.get);
}

/**
 * Truncates a hex string into a desired number of bits
 * @returns A hexadecimal string truncated to the number of desired bits
 */
export function truncateHexString(string: string, desiredBits: number): string {
  const BITS_PER_HEX_CHAR = 4;
  const desiredCharLength = desiredBits / BITS_PER_HEX_CHAR;
  return string.substring(0, desiredCharLength);
}

/**
 * When awaited, this function allows code execution to pause for a set time.
 * Should be used primarily for testing.
 */
export async function sleep(milliseconds: number): Promise<void> {
  console.warn(`Sleeping for ${milliseconds}ms`);
  return new Promise<void>((resolve) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
}

export function assertUnreachable(uncheckedCase: never): never {
  throw Error('Unchecked case ' + uncheckedCase);
}

/**
 * Returns a boolean representing whether two dates are on the same day
 */
export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}
