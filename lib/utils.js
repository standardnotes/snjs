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

/**
 * lodash.merge will not merge a full array with an empty one.
 * deepMerge will replace arrays wholesale
 */
export function deepMerge(a, b) {
  function mergeCopyArrays(objValue, srcValue) {
    if (isArray(objValue)) {
      return srcValue;
    }
  }
  mergeWith(a, b, mergeCopyArrays);
  return a;
}
