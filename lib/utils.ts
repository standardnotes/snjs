import remove from 'lodash/remove';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniqWith from 'lodash/uniqWith';
import uniq from 'lodash/uniq';
import { AnyRecord } from './types';

export function getGlobalScope() {
  return typeof window !== 'undefined'
    ? window
    : (typeof global !== 'undefined' ? global : null);
}

/**
 * Whether we are in a web browser
 */
export function isWebEnvironment() {
  return getGlobalScope() !== null;
}

/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */
export function findInArray(array: any[], key: string, value: any) {
  return array.find((item) => item[key] === value);
}

/**
 * @returns Whether the value is a function or object
 */
export function isObject(value: any) {
  if (value === null) { return false; }
  return typeof value === 'function' || typeof value === 'object';
}

/**
 * @returns Whether the value is a function
 */
export function isFunction(value: any) {
  if (value === null) { return false; }
  return typeof value === 'function';
}

/**
 * @returns True if the object is null or undefined, otherwise false
 */
export function isNullOrUndefined(value: any) {
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
export function uniqCombineObjArrays(arrayA: any[], arrayB: any[], equalityKeys: string[]) {
  return uniqWith(
    arrayA.concat(arrayB),
    (a: any, b: any) => {
      for (const key of equalityKeys) {
        if (a[key] !== b[key]) {
          return false;
        }
      }
      return true;
    }
  );
}

/**
 * Returns a new array containing only unique values
 * @returns Array containing unique values
 */
export function uniqueArray(array: any[]): any[] {
  return uniq(array);
}

/** 
 * Returns the last element in the array.
 * @returns The last element in the array
 */
export function lastElement(array: any[]) {
  return array[array.length - 1];
}

/** 
 * Adds all items from otherArray into inArray, in-place.
 * Does not return a value.
 */
export function extendArray<T>(inArray: T[], otherArray: T[]) {
  for (const value of otherArray) {
    inArray.push(value);
  }
}

/** 
 * Removes all items appearing in toSubtract from inArray, in-place 
 * @param toSubtract - The list of items to remove from inArray
 */
export function subtractFromArray<T>(inArray: T[], toSubtract: T[]) {
  for (const value of toSubtract) {
    inArray.splice(inArray.indexOf(value), 1);
  }
}

/** 
 * Determines if value exists in array, by reference
 */
export function existsInArray<T>(inArray: T[], value: T) {
  return inArray.indexOf(value) >= 0;
}


/** 
 * Removes an object from the array by value 
 */
export function removeFromArray<T>(array: T[], value: T) {
  array.splice(array.indexOf(value), 1);
}

/** 
 * Removes an object from the array by searching for an object where all the
 * key/values in predicate match with the candidate element.
 */
export function filterFromArray(array: any, predicate: Record<string, any>) {
  return remove(array, predicate);
}

/** 
 * Returns a new array by removing all elements in subtract from array 
 */
export function arrayByDifference<T>(array: T[], subtract: T[]) {
  return array
    .filter(x => !subtract.includes(x))
    .concat(subtract.filter(x => !array.includes(x)));
}

/** 
 * Removes the value from the array at the given index, in-place. 
 */
export function removeFromIndex(array: any[], index: number) {
  array.splice(index, 1);
}

/** 
 * Returns a new array by removeing the value from the array at the given index 
 * @returns {Array}
 */
export function arrayByRemovingFromIndex(array: any[], index: number) {
  const copy = array.slice();
  removeFromIndex(copy, index);
  return copy;
}

/**
 * Returns an array where each element is the value of a top-level
 * object key.
 * Example: objectToValueArray({a: 1, b: 2}) returns [1, 2]
 */
export function objectToValueArray(object: AnyRecord) {
  const values = [];
  for (const key of Object.keys(object)) {
    values.push(object[key]);
  }
  return values;
}

/**
 * Returns a new object by attempting to JSON.parse any top-level object keys.
 */
export function jsonParseEmbeddedKeys(object: AnyRecord) {
  const result: AnyRecord = {};
  for (const key of Object.keys(object)) {
    let value;
    try {
      value = JSON.parse(object[key]);;
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
export function omitInPlace(object: any, keys: string[]) {
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
export function omitByCopy(object: any, keys: string[]) {
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
export function joinPaths(...args: string[]) {
  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, '');
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
    }
  }).filter(x => x.length).join('/');
}

/**
 * Creates a copy of the input object by JSON stringifying the object
 * then JSON parsing the string.
 */
export function Copy(object: any) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Merges the second object parameter into the first object, in-place.
 * @returns The now modified first object parameter passed into the function.
 */
export function deepMerge(a: AnyRecord, b: AnyRecord) {
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
export function pickByCopy(object: AnyRecord, keys: string[]) {
  const result: AnyRecord = {};
  for (const key of keys) {
    result[key] = object[key];
  }
  return Copy(result);
}

/**
 * Recursively makes an object immutable via Object.freeze
 */
export function deepFreeze(object: any) {
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
export function hasGetter(object: any, property: string) {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(object),
    property
  );
  return descriptor && !isNullOrUndefined(descriptor.get);
}

/**
  * Truncates a hex string into a desired number of bits
  * @returns A hexadecimal string truncated to the number of desired bits
  */
export function truncateHexString(string: string, desiredBits: number) {
  const BITS_PER_HEX_CHAR = 4;
  const desiredCharLength = desiredBits / BITS_PER_HEX_CHAR;
  return string.substring(0, desiredCharLength);
}

/**
 * When awaited, this function allows code execution to pause for a set time.
 * Should be used primarily for testing.
 */
export async function sleep(milliseconds: number) {
  console.warn('Sleeping for', milliseconds);
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
}

