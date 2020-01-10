import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniqWith from 'lodash/uniqWith'

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

export function greaterOfTwoDates(dateA, dateB) {
  if(dateA > dateB)  {
    return dateA;
  } else {
    return dateB;
  }
}

export function uniqCombineObjArrays(arrayA, arrayB, equalityKeys) {
  return uniqWith(arrayA.concat(arrayB), (a, b) => {
    for(const key of equalityKeys) {
      if(a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  });
}

/** Adds all items from otherArray into inArray, in-place.*/
export function extendArray(inArray, otherArray) {
  for(const value of otherArray) {
    inArray.push(value);
  }
}

/** Removes all items appearing in toSubtract from inArray, in-place */
export function subtractFromArray(inArray, toSubtract) {
  for(const value of toSubtract) {
    inArray.splice(inArray.indexOf(value), 1);
  }
}

/** Returns a new array by removing all elements in subtract from array */
export function arrayByDifference(array, subtract) {
  return array
    .filter(x => !subtract.includes(x))
    .concat(subtract.filter(x => !array.includes(x)));
}

/** Removes the value from the array at the given index, in-place. */
export function removeFromIndex(array, index) {
  array.splice(index, 1);
}

/** Removes the value from the array at the given index, in-place. */
export function arrayByRemovingFromIndex(array, index) {
  const copy = array.slice();
  removeFromIndex(copy, index);
  return copy;
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

/** Creates a new object by omitting `fields` from `object` */
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
  function mergeCopyArrays(objValue, srcValue) {
    if(isArray(objValue)) {
      return srcValue;
    }
  }
  mergeWith(a, b, mergeCopyArrays);
  return a;
}

export function Copy(object) {
  return JSON.parse(JSON.stringify(object));
}

export function deepMergeByCopy(a, b) {
  if(!a || !b)  {
    throw 'Attempting to deepMergeByCopy with null values';
  }
  function mergeCopyArrays(objValue, srcValue) {
    if(isArray(objValue)) {
      return srcValue;
    }
  }
  b = Copy(b);
  mergeWith(a, b, mergeCopyArrays);
  return a;
}

/** Picks fields from an object by copying rather than by value (which is how Lodash's pick works.) */
export function pickByCopy(object, keys) {
  const result = {};
  for(const key of keys) {
    result[key] = object[key];
  }
  return Copy(result);
}

export function deepFreeze(object) {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);
  // Freeze properties before freezing self
  for(const name of propNames) {
    const value = object[name];
    object[name] = value && typeof value === "object" ?
      deepFreeze(value) : value;
  }

  return Object.freeze(object);
}

export function hasGetter(object, property) {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(object),
    property
  );
  return descriptor && !isNullOrUndefined(descriptor.get);
}

export async function sleep(milliseconds) {
  console.warn("Sleeping for", milliseconds);
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  })
}
