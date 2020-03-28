import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import uniqWith from 'lodash/uniqWith';
import uniq from 'lodash/uniq';

export function getGlobalScope() {
  return typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
}

/**
 * Whether we are in a web browser
 * @returns {boolean}
 */
export function isWebEnvironment() {
  return getGlobalScope() !== null;
}

/**
 * Searches array of objects for first object where object[key] === value
 * @param {Array.<object>} array 
 * @param {string} key 
 * @param {object} value
 * @returns {object|null} Matching object or null if not found
 */
export function findInArray(array, key, value) {
  return array.find((item) => item[key] === value);
}

/**
 * @returns {boolean} Whether the value is a function or object
 */
export function isObject(value) {
  if (value === null) { return false; }
  return typeof value === 'function' || typeof value === 'object';
}

/**
 * @returns {boolean} Whether the value is a function
 */
export function isFunction(value) {
  if (value === null) { return false; }
  return typeof value === 'function';
}

/**
 * @param value
 * @returns {boolean} True if the object is null or undefined, otherwise false
 */
export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

/**
 * @returns {boolean} Whether the value is a string
 */
export function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * @returns {Date} The greater of the two dates
 */
export function greaterOfTwoDates(dateA, dateB) {
  if (dateA > dateB) {
    return dateA;
  } else {
    return dateB;
  }
}

/**
 * Returns a new array containing only unique values by combining the two input arrays.
 * Elements are unique based on the values of `equalityKeys`.
 * @param {Array.<object>} arrayA 
 * @param {Array.<object>} arrayB
 * @param {Array.<string>} equalityKeys - Keys to determine element equality
 * @returns {Array.<object>} Array containing unique values
 */
export function uniqCombineObjArrays(arrayA, arrayB, equalityKeys) {
  return uniqWith(arrayA.concat(arrayB), (a, b) => {
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
 * @param {Array.<object>} array
 * @returns {Array.<object>} Array containing unique values
 */
export function uniqueArray(array) {
  return uniq(array);
}

/** 
 * Returns the last element in the array.
 * @returns {object} The last element in the array
 */
export function lastElement(array) {
  return array[array.length - 1];
}

/** 
 * Adds all items from otherArray into inArray, in-place.
 * Does not return a value.
 * @returns {void}
 */
export function extendArray(inArray, otherArray) {
  for (const value of otherArray) {
    inArray.push(value);
  }
}

/** 
 * Removes all items appearing in toSubtract from inArray, in-place 
 * @param {Array} inArray
 * @param {Array} toSubtract - The list of items to remove from inArray
 * @returns {void}
 */
export function subtractFromArray(inArray, toSubtract) {
  for (const value of toSubtract) {
    inArray.splice(inArray.indexOf(value), 1);
  }
}

/** 
 * Determines if value exists in array, by reference
 * @param {Array} inArray
 * @param {any} value
 * @returns {boolean}
 */
export function existsInArray(inArray, value) {
  return inArray.indexOf(value) >= 0;
}


/** 
 * Removes an object from the array by value 
 * @returns {void}
 */
export function removeFromArray(array, value) {
  array.splice(array.indexOf(value), 1);
}

/** 
 * Returns a new array by removing all elements in subtract from array 
 * @returns {Array}
 */
export function arrayByDifference(array, subtract) {
  return array
    .filter(x => !subtract.includes(x))
    .concat(subtract.filter(x => !array.includes(x)));
}

/** 
 * Removes the value from the array at the given index, in-place. 
 * @returns {void}
 */
export function removeFromIndex(array, index) {
  array.splice(index, 1);
}

/** 
 * Returns a new array by removeing the value from the array at the given index 
 * @returns {Array}
 */
export function arrayByRemovingFromIndex(array, index) {
  const copy = array.slice();
  removeFromIndex(copy, index);
  return copy;
}

/**
 * Returns an array where each element is the value of a top-level
 * object key.
 * Example: objectToValueArray({a: 1, b: 2}) returns [1, 2]
 * @param {object} object 
 */
export function objectToValueArray(object) {
  const values = [];
  for(const key of Object.keys(object)) {
    values.push(object[key]);
  }
  return values;
}

/**
 * Returns a new object by attempting to JSON.parse any top-level object keys.
 * @param {object} object 
 */
export function jsonParseEmbeddedKeys(object) {
  const result = {};
  for(const key of Object.keys(object)) {
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
 * @param {object} object 
 * @param {Array.<string>} keys 
 * @returns {void}
 */
export function omitInPlace(object, keys) {
  if (!object) {
    return;
  }
  for (const key of keys) {
    delete object[key];
  }
}

/** 
 * Creates a new object by omitting `keys` from `object`
 * @param {object} object
 * @param {Array.<string>} keys
 * @returns {object}
 */
export function omitByCopy(object, keys) {
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
 * @param  {...string} args 
 * @returns {string}
 */
export function joinPaths(...args) {
  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, '');
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
    }
  }).filter(x => x.length).join('/');
}

/**
 * Creates a copy of the input object by JSON stringifying then JSON parsing the string.
 * @returns {object}
 */
export function Copy(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * Merges the second object parameter into the first object, in-place.
 * @returns {object} The now modified first object parameter passed into the function.
 */
export function deepMerge(a, b) {
  /**
   * lodash.merge will not merge a full array with an empty one.
   * deepMerge will replace arrays wholesale
   */
  if (!a || !b) {
    throw 'Attempting to deepMerge with null values';
  }
  const customizer = (aValue, bValue) => {
    if (isArray(aValue)) {
      return bValue;
    }
  };
  mergeWith(a, b, customizer);
  return a;
}

/** 
 * Returns a new object by selecting certain keys from input object.
 * @param {object} object
 * @param {Array.<string>} keys
 * @returns {object}
 */
export function pickByCopy(object, keys) {
  const result = {};
  for (const key of keys) {
    result[key] = object[key];
  }
  return Copy(result);
}

/**
 * Recursively makes an object immutable via Object.freeze
 */
export function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    object[name] = value && typeof value === 'object' ?
      deepFreeze(value) : value;
  }

  return Object.freeze(object);
}

/**
 * Determines if an object has a getter defined for a given property
 * @param {object} object
 * @param {string} property
 */
export function hasGetter(object, property) {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(object),
    property
  );
  return descriptor && !isNullOrUndefined(descriptor.get);
}

/**
  * Truncates a hex string into a desired number of bits
  * @param {string} string
  * @param {number} desiredBits
  * @returns {string} A hexadecimal string truncated to the number of desired bits
  */
export function truncateHexString(string, desiredBits) {
  const BITS_PER_HEX_CHAR = 4;
  const desiredCharLength = desiredBits / BITS_PER_HEX_CHAR;
  return string.substring(0, desiredCharLength);
}

/**
 * When awaited, this function allows code execution to pause for a set time.
 * Should be used primarily for testing.
 * @param {number} milliseconds
 */
export async function sleep(milliseconds) {
  console.warn('Sleeping for', milliseconds);
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
}

