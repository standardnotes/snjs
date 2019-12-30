import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';

export function getGlobalScope() {
  return typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
}

export function isWebEnvironment()  {
  return getGlobalScope() !== null;
}

export function findInArray(array, key, value) {
  return array.find((item) => item[key] === value);
}

export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export function isString(value) {
   return typeof value === 'string' || value instanceof String;
}

export function omitInPlace(object, keys) {
  if(!object) {
    return object;
  }
  for(let key of keys) {
    delete object[key];
  }
  return object;
}

export function omitByCopy(object, fields) {
  const newObject = Object.assign({}, object);
  /**
   * Lodash's omit, which was previously used, seems to cause unexpected behavior
   * when payload is an ES6 item class. So we instead manually omit each key.
   */
  for(let key of fields) {
    delete newObject[key];
  }

  return newObject;
}

export function isObject(value) {
  return value.constructor.name.toLowerCase() === 'object';
}

/**
 * lodash.merge will not merge a full array with an empty one.
 * deepMerge will replace arrays wholesale
 */
export function deepMerge(a, b) {
  if(!a || !b)  {
    throw 'Attempting to deepMerge with null values';
  }
  if(!isObject(a) || !isObject(b)) {
    throw 'Attempting to deepMerge with non-object values';
  }
  function mergeCopyArrays(objValue, srcValue) {
    if(isArray(objValue)) {
      return srcValue;
    }
  }
  mergeWith(a, b, mergeCopyArrays);
  return a;
}
