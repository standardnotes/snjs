(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SNLibrary", [], factory);
	else if(typeof exports === 'object')
		exports["SNLibrary"] = factory();
	else
		root["SNLibrary"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 193);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "m", function() { return getGlobalScope; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return dictToArray; });
/* unused harmony export isWebEnvironment */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "t", function() { return isWebCryptoAvailable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "r", function() { return isReactNativeEnvironment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "l", function() { return findInArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "D", function() { return searchArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return concatArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "q", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "o", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "p", function() { return isNullOrUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "s", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "n", function() { return greaterOfTwoDates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "J", function() { return uniqCombineObjArrays; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "K", function() { return uniqueArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "w", function() { return lastElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return extendArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "G", function() { return subtractFromArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "B", function() { return removeFromArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return addIfUnique; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "k", function() { return filterFromArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return arrayByDifference; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return compareValues; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "C", function() { return removeFromIndex; });
/* unused harmony export addAtIndex */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return arrayByRemovingFromIndex; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "x", function() { return objectToValueArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "F", function() { return sortedCopy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "H", function() { return topLevelCompare; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "v", function() { return jsonParseEmbeddedKeys; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "z", function() { return omitInPlace; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "y", function() { return omitByCopy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "u", function() { return joinPaths; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Copy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return deepMerge; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "A", function() { return pickByCopy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return deepFreeze; });
/* unused harmony export hasGetter */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "I", function() { return truncateHexString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "E", function() { return sleep; });
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(19);
/* harmony import */ var lodash_remove__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_remove__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var lodash_find__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_find__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_isArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15);
/* harmony import */ var lodash_isArray__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_isArray__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(78);
/* harmony import */ var lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var lodash_uniqWith__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(79);
/* harmony import */ var lodash_uniqWith__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash_uniqWith__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(22);
/* harmony import */ var lodash_uniq__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash_uniq__WEBPACK_IMPORTED_MODULE_5__);






function getGlobalScope() {
  return typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;
}
function dictToArray(dict) {
  return Object.keys(dict).map(key => dict[key]);
}
/**
 * Whether we are in a web browser
 */

function isWebEnvironment() {
  return getGlobalScope() !== null;
}
/**
 * Returns true if WebCrypto is available
 * @access public
 */

function isWebCryptoAvailable() {
  // @ts-ignore documentMode does not exit in definitions but might exist on IE
  return isWebEnvironment() && !isReactNativeEnvironment() && !(document && document.documentMode) || /Edge/.test(navigator.userAgent) && window.crypto && !!window.crypto.subtle;
}
/**
 * Whether we are in React Native app
 */

function isReactNativeEnvironment() {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
}
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */

function findInArray(array, key, value) {
  return array.find(item => item[key] === value);
}
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */

function searchArray(array, predicate) {
  return lodash_find__WEBPACK_IMPORTED_MODULE_1___default()(array, predicate);
}
/**
 * Searches array of objects for first object where object[key] === value
 * @returns Matching object or null if not found
 */

function concatArrays() {
  let result = [];

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  for (const array of args) {
    result = result.concat(array);
  }

  return result;
}
/**
 * @returns Whether the value is a function or object
 */

function isObject(value) {
  if (value === null) {
    return false;
  }

  return typeof value === 'function' || typeof value === 'object';
}
/**
 * @returns Whether the value is a function
 */

function isFunction(value) {
  if (value === null) {
    return false;
  }

  return typeof value === 'function';
}
/**
 * @returns True if the object is null or undefined, otherwise false
 */

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}
/**
 * @returns Whether the value is a string
 */

function isString(value) {
  return typeof value === 'string' || value instanceof String;
}
/**
 * @returns The greater of the two dates
 */

function greaterOfTwoDates(dateA, dateB) {
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

function uniqCombineObjArrays(arrayA, arrayB, equalityKeys) {
  return lodash_uniqWith__WEBPACK_IMPORTED_MODULE_4___default()(arrayA.concat(arrayB), (a, b) => {
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

function uniqueArray(array) {
  return lodash_uniq__WEBPACK_IMPORTED_MODULE_5___default()(array);
}
/**
 * Returns the last element in the array.
 * @returns The last element in the array
 */

function lastElement(array) {
  return array[array.length - 1];
}
/**
 * Adds all items from otherArray into inArray, in-place.
 * Does not return a value.
 */

function extendArray(inArray, otherArray) {
  for (const value of otherArray) {
    inArray.push(value);
  }
}
/**
 * Removes all items appearing in toSubtract from inArray, in-place
 * @param toSubtract - The list of items to remove from inArray
 */

function subtractFromArray(inArray, toSubtract) {
  for (const value of toSubtract) {
    removeFromArray(inArray, value);
  }
}
/**
 * Removes the first matching element of an array by strict equality.
 * If no matchin element is found, the array is left unchanged.
 */

function removeFromArray(array, value) {
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

function addIfUnique(array, value) {
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

function filterFromArray(array, predicate) {
  lodash_remove__WEBPACK_IMPORTED_MODULE_0___default()(array, predicate);
}
/**
 * Returns a new array by removing all elements in subtract from array
 */

function arrayByDifference(array, subtract) {
  return array.filter(x => !subtract.includes(x)).concat(subtract.filter(x => !array.includes(x)));
}
function compareValues(left, right) {
  if (left && !right || !left && right) {
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

function removeFromIndex(array, index) {
  array.splice(index, 1);
}
/**
 * Adds the value from the array at the given index, in-place.
 */

function addAtIndex(array, element, index) {
  array.splice(index, 0, element);
}
/**
 * Returns a new array by removeing the value from the array at the given index
 */

function arrayByRemovingFromIndex(array, index) {
  const copy = array.slice();
  removeFromIndex(copy, index);
  return copy;
}
/**
 * Returns an array where each element is the value of a top-level
 * object key.
 * Example: objectToValueArray({a: 1, b: 2}) returns [1, 2]
 */

function objectToValueArray(object) {
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

function sortedCopy(object) {
  const keys = Object.keys(object).sort();
  const result = {};

  for (const key of keys) {
    result[key] = object[key];
  }

  return Copy(result);
}
/** Compares for equality by comparing top-level keys value equality (===) */

function topLevelCompare(left, right) {
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
    if (left[key] !== right[key]) {
      return false;
    }
  }

  return true;
}
/**
 * Returns a new object by attempting to JSON.parse any top-level object keys.
 */

function jsonParseEmbeddedKeys(object) {
  const result = {};

  for (const key of Object.keys(object)) {
    let value;

    try {
      value = JSON.parse(object[key]);
      ;
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

function omitInPlace(object, keys) {
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

function omitByCopy(object, keys) {
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

function joinPaths() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, '');
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, '');
    }
  }).filter(x => x.length).join('/');
}
/**
 * Creates a copy of the input object by JSON stringifying the object then JSON parsing
 * the string (if the input is an object). If input is date, a Date copy will be created,
 * and if input is a primitive value, it will be returned as-is.
 */

function Copy(object) {
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

function deepMerge(a, b) {
  /**
   * lodash.merge will not merge a full array with an empty one.
   * deepMerge will replace arrays wholesale
   */
  if (!a || !b) {
    throw 'Attempting to deepMerge with null values';
  }

  const customizer = (aValue, bValue) => {
    if (lodash_isArray__WEBPACK_IMPORTED_MODULE_2___default()(aValue)) {
      return bValue;
    }
  };

  lodash_mergeWith__WEBPACK_IMPORTED_MODULE_3___default()(a, b, customizer);
  return a;
}
/**
 * Returns a new object by selecting certain keys from input object.
 */

function pickByCopy(object, keys) {
  const result = {};

  for (const key of keys) {
    result[key] = object[key];
  }

  return Copy(result);
}
/**
 * Recursively makes an object immutable via Object.freeze
 */

function deepFreeze(object) {
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

function hasGetter(object, property) {
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(object), property);
  return descriptor && !isNullOrUndefined(descriptor.get);
}
/**
  * Truncates a hex string into a desired number of bits
  * @returns A hexadecimal string truncated to the number of desired bits
  */

function truncateHexString(string, desiredBits) {
  const BITS_PER_HEX_CHAR = 4;
  const desiredCharLength = desiredBits / BITS_PER_HEX_CHAR;
  return string.substring(0, desiredCharLength);
}
/**
 * When awaited, this function allows code execution to pause for a set time.
 * Should be used primarily for testing.
 */

async function sleep(milliseconds) {
  console.warn("Sleeping for ".concat(milliseconds, "ms"));
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve();
    }, milliseconds);
  });
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(28)))

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return CreateMaxPayloadFromAnyObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return PayloadByMerging; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return CreateIntentPayloadFromObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return CreateSourcedPayloadFromObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return CopyPayload; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return CreateEncryptionParameters; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return CopyEncryptionParameters; });
/* unused harmony export payloadFieldsForSource */
/* harmony import */ var _Payloads_pure_payload__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27);
/* harmony import */ var _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(0);
/* harmony import */ var _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4);





/** The MaxItemPayload represents a payload with all possible fields */

const MaxPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ItemsKeyId, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].EncItemKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Deleted, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthHash, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthParams, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Dirty, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DirtiedDate, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ErrorDecrypting, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ErrorDecryptingChanged, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].WaitingForKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].LastSyncBegan, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].LastSyncEnd, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DuplicateOf];
const EncryptionParametersFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ItemsKeyId, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].EncItemKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthHash, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ErrorDecrypting, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ErrorDecryptingChanged, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].WaitingForKey];
const FilePayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ItemsKeyId, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].EncItemKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthHash, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DuplicateOf];
const StoragePayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ItemsKeyId, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].EncItemKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Deleted, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthHash, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthParams, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Dirty, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DirtiedDate, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ErrorDecrypting, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].WaitingForKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DuplicateOf];
const ServerPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ItemsKeyId, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].EncItemKey, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Deleted, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Legacy003AuthHash, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].DuplicateOf];
const SessionHistoryPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt];
/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */

const ComponentRetrievedPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt];
/** Represents a payload with permissible fields for when a
 * component wants to create a new item */

const ComponentCreatedPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Content, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].CreatedAt];
/**
 * The saved server item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */

const ServerSavedPayloadFields = [_Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Uuid, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].ContentType, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].UpdatedAt, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Deleted, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].Dirty, _Payloads_fields__WEBPACK_IMPORTED_MODULE_4__[/* PayloadField */ "a"].LastSyncEnd];
const RemoteHistoryPayloadFields = ServerPayloadFields.slice();
function CreateMaxPayloadFromAnyObject(object, override, source) {
  return CreatePayload(object, MaxPayloadFields.slice(), source, override);
}
/**
 * Makes a new payload by starting with input payload, then overriding values of all
 * keys of mergeWith.fields. If wanting to merge only specific fields, pass an array of
 * fields. If override value is passed, values in here take final precedence, including
 * above both payload and mergeWith values.
 */

function PayloadByMerging(payload, mergeWith, fields, override) {
  const resultOverride = {};
  const useFields = fields || mergeWith.fields;

  for (const field of useFields) {
    resultOverride[field] = mergeWith[field];
  }

  if (override) {
    const keys = Object.keys(override);

    for (const key of keys) {
      resultOverride[key] = override[key];
    }
  }

  return CopyPayload(payload, resultOverride);
}
function CreateIntentPayloadFromObject(object, intent, override) {
  const payloadFields = payloadFieldsForIntent(intent);
  return CreatePayload(object, payloadFields, _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].Constructor, override);
}
function CreateSourcedPayloadFromObject(object, source, override) {
  const payloadFields = payloadFieldsForSource(source);
  return CreatePayload(object, payloadFields, source, override);
}
function CopyPayload(payload, override) {
  return CreatePayload(payload, payload.fields, payload.source, override);
}

function CreatePayload(object, fields, source, override) {
  const rawPayload = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* pickByCopy */ "A"])(object, fields);
  const overrideFields = override instanceof _Payloads_pure_payload__WEBPACK_IMPORTED_MODULE_0__[/* PurePayload */ "a"] ? override.fields.slice() : Object.keys(override || []);

  for (const field of overrideFields) {
    const value = override[field];
    rawPayload[field] = value ? Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* Copy */ "a"])(value) : value;
  }

  const newFields = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* uniqueArray */ "K"])(fields.concat(overrideFields));
  return new _Payloads_pure_payload__WEBPACK_IMPORTED_MODULE_0__[/* PurePayload */ "a"](rawPayload, newFields, source || _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].Constructor);
}

function CreateEncryptionParameters(raw, source) {
  const fields = Object.keys(raw);
  return CreatePayload(raw, fields, source);
}
function CopyEncryptionParameters(raw, override) {
  return CreatePayload(raw, EncryptionParametersFields.slice(), undefined, override);
}

function payloadFieldsForIntent(intent) {
  if (intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].FileEncrypted || intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].FileDecrypted || intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].FilePreferEncrypted) {
    return FilePayloadFields.slice();
  }

  if (intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].LocalStoragePreferEncrypted || intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].LocalStorageDecrypted || intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].LocalStorageEncrypted) {
    return StoragePayloadFields.slice();
  }

  if (intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].Sync || intent === _Protocol_intents__WEBPACK_IMPORTED_MODULE_2__[/* EncryptionIntent */ "a"].SyncDecrypted) {
    return ServerPayloadFields.slice();
  } else {
    throw "No payload fields found for intent ".concat(intent);
  }
}

function payloadFieldsForSource(source) {
  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].FileImport) {
    return FilePayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].SessionHistory) {
    return SessionHistoryPayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].RemoteHistory) {
    return RemoteHistoryPayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].ComponentRetrieved) {
    return ComponentRetrievedPayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].ComponentCreated) {
    return ComponentCreatedPayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].LocalRetrieved || source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].LocalChanged) {
    return StoragePayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].RemoteRetrieved || source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].ConflictData || source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].ConflictUuid) {
    return ServerPayloadFields.slice();
  }

  if (source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].LocalSaved || source === _Payloads_sources__WEBPACK_IMPORTED_MODULE_1__[/* PayloadSource */ "a"].RemoteSaved) {
    return ServerSavedPayloadFields.slice();
  } else {
    throw "No payload fields found for source ".concat(source);
  }
}

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PayloadSource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return isPayloadSourceRetrieved; });
var PayloadSource;

(function (PayloadSource) {
  PayloadSource[PayloadSource["RemoteRetrieved"] = 1] = "RemoteRetrieved";
  PayloadSource[PayloadSource["RemoteSaved"] = 2] = "RemoteSaved";
  /* The payload returned by offline sync operation */

  PayloadSource[PayloadSource["LocalSaved"] = 3] = "LocalSaved";
  PayloadSource[PayloadSource["LocalRetrieved"] = 4] = "LocalRetrieved";
  /* Payload when a client modifies item property then maps it to update UI.
  This also indicates that the item was dirtied*/

  PayloadSource[PayloadSource["LocalChanged"] = 5] = "LocalChanged";
  /** Payloads retrieved from an external
   extension/component */

  PayloadSource[PayloadSource["ComponentRetrieved"] = 6] = "ComponentRetrieved";
  /** When a component is installed by the desktop
   and some of its values change */

  PayloadSource[PayloadSource["DesktopInstalled"] = 7] = "DesktopInstalled";
  /** aciton-based Extensions like note history */

  PayloadSource[PayloadSource["RemoteActionRetrieved"] = 8] = "RemoteActionRetrieved";
  PayloadSource[PayloadSource["FileImport"] = 9] = "FileImport";
  PayloadSource[PayloadSource["RemoteConflict"] = 10] = "RemoteConflict";
  PayloadSource[PayloadSource["ImportConflict"] = 11] = "ImportConflict";
  /** Payloads that are saved or saving in the
   current sync request */

  PayloadSource[PayloadSource["SavedOrSaving"] = 12] = "SavedOrSaving";
  /** Payloads that have been decrypted for the convenience
   of consumers who can only work with decrypted formats. The
   decrypted payloads exist in transient, ephemeral space, and
   are not used in anyway. */

  PayloadSource[PayloadSource["DecryptedTransient"] = 13] = "DecryptedTransient";
  PayloadSource[PayloadSource["ConflictUuid"] = 14] = "ConflictUuid";
  PayloadSource[PayloadSource["ConflictData"] = 15] = "ConflictData";
  PayloadSource[PayloadSource["SessionHistory"] = 16] = "SessionHistory";
  /** Payloads with a source of Constructor means that the payload was created
   * in isolated space by the caller, and does not yet have any app-related affiliation. */

  PayloadSource[PayloadSource["Constructor"] = 17] = "Constructor";
  /** Payloads received from an external component with the intention of creating a new item */

  PayloadSource[PayloadSource["ComponentCreated"] = 18] = "ComponentCreated";
  /** When the payloads are about to sync, they are emitted by the sync service with updated
   * values of lastSyncBegan. Payloads emitted from this source indicate that these payloads
   * have been saved to disk, and are about to be synced */

  PayloadSource[PayloadSource["PreSyncSave"] = 19] = "PreSyncSave";
  PayloadSource[PayloadSource["RemoteHistory"] = 20] = "RemoteHistory";
})(PayloadSource || (PayloadSource = {}));

;
function isPayloadSourceRetrieved(source) {
  return [PayloadSource.RemoteRetrieved, PayloadSource.ComponentRetrieved, PayloadSource.RemoteActionRetrieved].includes(source);
}

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return DefaultAppDomain; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ContentType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return displayStringForContentType; });
const DefaultAppDomain = 'org.standardnotes.sn';
var ContentType;

(function (ContentType) {
  ContentType["Any"] = "*";
  ContentType["Item"] = "SF|Item";
  ContentType["RootKey"] = "SN|RootKey|NoSync";
  ContentType["ItemsKey"] = "SN|ItemsKey";
  ContentType["EncryptedStorage"] = "SN|EncryptedStorage";
  ContentType["Note"] = "Note";
  ContentType["Tag"] = "Tag";
  ContentType["SmartTag"] = "SN|SmartTag";
  ContentType["Component"] = "SN|Component";
  ContentType["Editor"] = "SN|Editor";
  ContentType["ActionsExtension"] = "Extension";
  ContentType["UserPrefs"] = "SN|UserPreferences";
  ContentType["Privileges"] = "SN|Privileges";
  ContentType["HistorySession"] = "SN|HistorySession";
  ContentType["Theme"] = "SN|Theme";
  ContentType["Mfa"] = "SF|MFA";
  ContentType["ServerExtension"] = "SF|Extension";
  ContentType["FilesafeCredentials"] = "SN|FileSafe|Credentials";
  ContentType["FilesafeFileMetadata"] = "SN|FileSafe|FileMetadata";
  ContentType["FilesafeIntegration"] = "SN|FileSafe|Integration";
  ContentType["ExtensionRepo"] = "SN|ExtensionRepo";
})(ContentType || (ContentType = {}));

;
function displayStringForContentType(contentType) {
  const map = {
    [ContentType.Note]: 'note',
    [ContentType.Tag]: 'tag',
    [ContentType.SmartTag]: 'smart tag',
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.Theme]: 'theme',
    [ContentType.ServerExtension]: 'server extension',
    [ContentType.Mfa]: 'two-factor authentication setting',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration'
  };
  return map[contentType];
}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PayloadField; });
var PayloadField;

(function (PayloadField) {
  PayloadField["Uuid"] = "uuid";
  PayloadField["ContentType"] = "content_type";
  PayloadField["ItemsKeyId"] = "items_key_id";
  PayloadField["EncItemKey"] = "enc_item_key";
  PayloadField["Content"] = "content";
  PayloadField["CreatedAt"] = "created_at";
  PayloadField["UpdatedAt"] = "updated_at";
  PayloadField["Deleted"] = "deleted";
  PayloadField["Legacy003AuthHash"] = "auth_hash";
  PayloadField["Legacy003AuthParams"] = "auth_params";
  PayloadField["Dirty"] = "dirty";
  PayloadField["DirtiedDate"] = "dirtiedDate";
  PayloadField["WaitingForKey"] = "waitingForKey";
  PayloadField["ErrorDecrypting"] = "errorDecrypting";
  PayloadField["ErrorDecryptingChanged"] = "errorDecryptingValueChanged";
  PayloadField["LastSyncBegan"] = "lastSyncBegan";
  PayloadField["LastSyncEnd"] = "lastSyncEnd";
  PayloadField["DuplicateOf"] = "duplicate_of";
})(PayloadField || (PayloadField = {}));

;

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(setImmediate) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return MutationType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppDataField; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return SingletonStrategy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return SNItem; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ItemMutator; });
/* harmony import */ var _protocol_payloads_formats__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(9);
/* harmony import */ var _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);
/* harmony import */ var _Payloads_generator__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1);
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(0);
/* harmony import */ var _Models_core_predicate__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(14);
/* harmony import */ var _content_types__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3);
/* harmony import */ var _Lib_protocol_payloads_sources__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(2);








var MutationType;

(function (MutationType) {
  /**
   * The item was changed as part of a user interaction. This means that the item's
   * user modified date will be updated
   */
  MutationType[MutationType["UserInteraction"] = 1] = "UserInteraction";
  /**
   * The item was changed as part of an internal operation, such as a migration.
   * This change will not updated the item's user modified date
   */

  MutationType[MutationType["Internal"] = 2] = "Internal";
  /**
   * The item was changed as part of an internal function that wishes to modify
   * internal item properties, such as lastSyncBegan, without modifying the item's dirty
   * state. By default all other mutation types will result in a dirtied result.
   */

  MutationType[MutationType["NonDirtying"] = 3] = "NonDirtying";
})(MutationType || (MutationType = {}));

var AppDataField;

(function (AppDataField) {
  AppDataField["Pinned"] = "pinned";
  AppDataField["Archived"] = "archived";
  AppDataField["Locked"] = "locked";
  AppDataField["UserModifiedDate"] = "client_updated_at";
  AppDataField["DefaultEditor"] = "defaultEditor";
  AppDataField["MobileRules"] = "mobileRules";
  AppDataField["NotAvailableOnMobile"] = "notAvailableOnMobile";
  AppDataField["MobileActive"] = "mobileActive";
  AppDataField["LastSize"] = "lastSize";
  AppDataField["PrefersPlainEditor"] = "prefersPlainEditor";
  AppDataField["ComponentInstallError"] = "installError";
})(AppDataField || (AppDataField = {}));

var SingletonStrategy;

(function (SingletonStrategy) {
  SingletonStrategy[SingletonStrategy["KeepEarliest"] = 1] = "KeepEarliest";
})(SingletonStrategy || (SingletonStrategy = {}));

;
/**
 * The most abstract item that any syncable item needs to extend from.
 */

class SNItem {
  constructor(payload) {
    this.protected = false;
    this.trashed = false;
    this.pinned = false;
    this.archived = false;
    this.locked = false;

    if (!payload.uuid || !payload.content_type) {
      throw Error('Cannot create item without both uuid and content_type');
    }

    if (payload.format === _protocol_payloads_formats__WEBPACK_IMPORTED_MODULE_0__[/* PayloadFormat */ "a"].DecryptedBareObject && (payload.enc_item_key || payload.items_key_id || payload.auth_hash)) {
      throw Error('Creating an item from a decrypted payload should not contain enc params');
    }

    this.payload = payload;
    this.conflictOf = payload.safeContent.conflict_of;
    this.duplicateOf = payload.duplicate_of;
    this.createdAtString = this.created_at && this.dateToLocalizedString(this.created_at);

    if (payload.format === _protocol_payloads_formats__WEBPACK_IMPORTED_MODULE_0__[/* PayloadFormat */ "a"].DecryptedBareObject) {
      this.userModifiedDate = new Date(this.getAppDomainValue(AppDataField.UserModifiedDate) || this.updated_at);
      this.updatedAtString = this.dateToLocalizedString(this.userModifiedDate);
      this.protected = this.payload.safeContent.protected;
      this.trashed = this.payload.safeContent.trashed;
      this.pinned = this.getAppDomainValue(AppDataField.Pinned);
      this.archived = this.getAppDomainValue(AppDataField.Archived);
      this.locked = this.getAppDomainValue(AppDataField.Locked);
    } else {
      this.userModifiedDate = this.updated_at;
    }
    /** Allow the subclass constructor to complete initialization before deep freezing */


    setImmediate(() => {
      Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* deepFreeze */ "g"])(this);
    });
  }

  static DefaultAppDomain() {
    return _content_types__WEBPACK_IMPORTED_MODULE_5__[/* DefaultAppDomain */ "b"];
  }

  get uuid() {
    return this.payload.uuid;
  }

  get content() {
    return this.payload.content;
  }

  get safeContent() {
    return this.payload.safeContent;
  }

  get references() {
    return this.payload.safeContent.references || [];
  }

  get deleted() {
    return this.payload.deleted;
  }

  get content_type() {
    return this.payload.content_type;
  }

  get created_at() {
    return this.payload.created_at;
  }

  get updated_at() {
    return this.payload.updated_at;
  }

  get dirtiedDate() {
    return this.payload.dirtiedDate;
  }

  get dirty() {
    return this.payload.dirty;
  }

  get errorDecrypting() {
    return this.payload.errorDecrypting;
  }

  get waitingForKey() {
    return this.payload.waitingForKey;
  }

  get errorDecryptingValueChanged() {
    return this.payload.errorDecryptingValueChanged;
  }

  get lastSyncBegan() {
    return this.payload.lastSyncBegan;
  }

  get lastSyncEnd() {
    return this.payload.lastSyncEnd;
  }
  /** @deprecated */


  get auth_hash() {
    return this.payload.auth_hash;
  }
  /** @deprecated */


  get auth_params() {
    return this.payload.auth_params;
  }

  get duplicate_of() {
    return this.payload.duplicate_of;
  }

  payloadRepresentation(override) {
    return Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, override);
  }

  hasRelationshipWithItem(item) {
    var _this$payload$safeCon;

    const target = (_this$payload$safeCon = this.payload.safeContent.references) === null || _this$payload$safeCon === void 0 ? void 0 : _this$payload$safeCon.find(r => {
      return r.uuid === item.uuid;
    });
    return !!target;
  }
  /**
   * Inside of content is a record called `appData` (which should have been called `domainData`).
   * It was named `appData` as a way to indicate that it can house data for multiple apps.
   * Each key of appData is a domain string, which was originally designed
   * to allow for multiple 3rd party apps who share access to the same data to store data
   * in an isolated location. This design premise is antiquited and no longer pursued,
   * however we continue to use it as not to uncesesarily create a large data migration
   * that would require users to sync all their data.
   *
   * domainData[DomainKey] will give you another Record<string, any>.
   *
   * Currently appData['org.standardnotes.sn'] returns an object of type AppData.
   * And appData['org.standardnotes.sn.components] returns an object of type ComponentData
   */


  getDomainData(domain) {
    const domainData = this.payload.safeContent.appData;

    if (!domainData) {
      return undefined;
    }

    const data = domainData[domain];
    return data;
  }

  getAppDomainValue(key) {
    const appData = this.getDomainData(SNItem.DefaultAppDomain());
    return appData[key];
  }
  /**
   * During sync conflicts, when determing whether to create a duplicate for an item,
   * we can omit keys that have no meaningful weight and can be ignored. For example,
   * if one component has active = true and another component has active = false,
   * it would be needless to duplicate them, so instead we ignore that value.
   */


  contentKeysToIgnoreWhenCheckingEquality() {
    return ['conflict_of'];
  }
  /** Same as `contentKeysToIgnoreWhenCheckingEquality`, but keys inside appData[Item.AppDomain] */


  appDataContentKeysToIgnoreWhenCheckingEquality() {
    return [AppDataField.UserModifiedDate];
  }

  getContentCopy() {
    return JSON.parse(JSON.stringify(this.content));
  }
  /** Whether the item has never been synced to a server */


  get neverSynced() {
    return !this.updated_at || this.updated_at.getTime() === 0;
  }
  /**
   * Subclasses can override this getter to return true if they want only
   * one of this item to exist, depending on custom criteria.
   */


  get isSingleton() {
    return false;
  }
  /** The predicate by which singleton items should be unique */


  get singletonPredicate() {
    throw 'Must override SNItem.singletonPredicate';
  }

  get singletonStrategy() {
    return SingletonStrategy.KeepEarliest;
  }
  /**
   * Subclasses can override this method and provide their own opinion on whether
   * they want to be duplicated. For example, if this.content.x = 12 and
   * item.content.x = 13, this function can be overriden to always return
   * ConflictStrategy.KeepLeft to say 'don't create a duplicate at all, the
   * change is not important.'
   *
   * In the default implementation, we create a duplicate if content differs.
   * However, if they only differ by references, we KEEP_LEFT_MERGE_REFS.
   */


  strategyWhenConflictingWithItem(item) {
    if (this.errorDecrypting) {
      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepLeftDuplicateRight;
    }

    if (this.isSingleton) {
      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepLeft;
    }

    if (this.deleted) {
      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepRight;
    }

    if (item.deleted) {
      if (this.payload.source === _Lib_protocol_payloads_sources__WEBPACK_IMPORTED_MODULE_6__[/* PayloadSource */ "a"].FileImport) {
        /** Imported items take precedence */
        return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepLeft;
      }

      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepRight;
    }

    const contentDiffers = ItemContentsDiffer(this, item);

    if (!contentDiffers) {
      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepRight;
    }

    const itemsAreDifferentExcludingRefs = ItemContentsDiffer(this, item, ['references']);

    if (itemsAreDifferentExcludingRefs) {
      const twentySeconds = 20000;

      if (
      /**
       * If the incoming item comes from an import, treat it as
       * less important than the existing one.
       */
      item.payload.source === _Lib_protocol_payloads_sources__WEBPACK_IMPORTED_MODULE_6__[/* PayloadSource */ "a"].FileImport ||
      /**
       * If the user is actively editing our item, duplicate the incoming item
       * to avoid creating surprises in the client's UI.
       */
      Date.now() - this.userModifiedDate.getTime() < twentySeconds) {
        return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepLeftDuplicateRight;
      } else {
        return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].DuplicateLeftKeepRight;
      }
    } else {
      /** Only the references have changed; merge them. */
      return _Protocol_payloads_deltas_strategies__WEBPACK_IMPORTED_MODULE_1__[/* ConflictStrategy */ "a"].KeepLeftMergeRefs;
    }
  }

  isItemContentEqualWith(otherItem) {
    return ItemContentsEqual(this.payload.contentObject, otherItem.payload.contentObject, this.contentKeysToIgnoreWhenCheckingEquality(), this.appDataContentKeysToIgnoreWhenCheckingEquality());
  }

  satisfiesPredicate(predicate) {
    return _Models_core_predicate__WEBPACK_IMPORTED_MODULE_4__[/* SNPredicate */ "a"].ItemSatisfiesPredicate(this, predicate);
  }

  updatedAtTimestamp() {
    var _this$updated_at;

    return (_this$updated_at = this.updated_at) === null || _this$updated_at === void 0 ? void 0 : _this$updated_at.getTime();
  }

  dateToLocalizedString(date) {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      if (!SNItem.sharedDateFormatter) {
        const locale = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language;
        SNItem.sharedDateFormatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return SNItem.sharedDateFormatter.format(date);
    } else {
      // IE < 11, Safari <= 9.0.
      // In English, this generates the string most similar to
      // the toLocaleDateString() result above.
      return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
  }

}
/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */

class ItemMutator {
  constructor(item, type) {
    this.item = item;
    this.type = type;
    this.payload = item.payload;

    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* Copy */ "a"])(this.payload.content);
    }
  }

  getUuid() {
    return this.payload.uuid;
  }

  getItem() {
    return this.item;
  }

  getResult() {
    if (this.type === MutationType.NonDirtying) {
      return Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
        content: this.content
      });
    }

    if (!this.payload.deleted) {
      if (this.type === MutationType.UserInteraction) {
        // Set the user modified date to now if marking the item as dirty
        this.userModifiedDate = new Date();
      } else {
        const currentValue = this.item.userModifiedDate;

        if (!currentValue) {
          // if we don't have an explcit raw value, we initialize client_updated_at.
          this.userModifiedDate = new Date(this.item.updated_at);
        }
      }
    }

    const result = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
      content: this.content,
      dirty: true,
      dirtiedDate: new Date()
    });
    return result;
  }
  /** Merges the input payload with the base payload */


  mergePayload(payload) {
    this.payload = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* PayloadByMerging */ "g"])(this.payload, payload);

    if (this.payload.content) {
      /** this.content needs to be mutable, so we make a copy */
      this.content = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* Copy */ "a"])(this.payload.safeContent);
    } else {
      this.content = undefined;
    }
  }

  setContent(content) {
    this.content = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* Copy */ "a"])(content);
  }

  setDeleted() {
    this.content = undefined;
    this.payload = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
      content: this.content,
      deleted: true
    });
  }

  set lastSyncBegan(began) {
    this.payload = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
      content: this.content,
      lastSyncBegan: began
    });
  }

  set errorDecrypting(errorDecrypting) {
    this.payload = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
      content: this.content,
      errorDecrypting: errorDecrypting
    });
  }

  set updated_at(updated_at) {
    this.payload = Object(_Payloads_generator__WEBPACK_IMPORTED_MODULE_2__[/* CopyPayload */ "b"])(this.payload, {
      updated_at: updated_at
    });
  }

  set userModifiedDate(date) {
    this.setAppDataItem(AppDataField.UserModifiedDate, date);
  }

  set conflictOf(conflictOf) {
    this.content.conflict_of = conflictOf;
  }

  set protected(isProtected) {
    this.content.protected = isProtected;
  }

  set trashed(trashed) {
    this.content.trashed = trashed;
  }

  set pinned(pinned) {
    this.setAppDataItem(AppDataField.Pinned, pinned);
  }

  set archived(archived) {
    this.setAppDataItem(AppDataField.Archived, archived);
  }

  set locked(locked) {
    this.setAppDataItem(AppDataField.Locked, locked);
  }
  /**
   * Overwrites the entirety of this domain's data with the data arg.
   */


  setDomainData(data, domain) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }

    if (!this.content.appData) {
      this.content.appData = {};
    }

    this.content.appData[domain] = data;
  }
  /**
   * First gets the domain data for the input domain.
   * Then sets data[key] = value
   */


  setDomainDataKey(key, value, domain) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }

    if (!this.content.appData) {
      this.content.appData = {};
    }

    const globalData = this.content.appData;

    if (!globalData[domain]) {
      globalData[domain] = {};
    }

    const domainData = globalData[domain];
    domainData[key] = value;
  }

  setAppDataItem(key, value) {
    this.setDomainDataKey(key, value, SNItem.DefaultAppDomain());
  }

  addItemAsRelationship(item) {
    const references = this.content.references || [];

    if (!references.find(r => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type
      });
    }

    this.content.references = references;
  }

  removeItemAsRelationship(item) {
    let references = this.content.references || [];
    references = references.filter(r => r.uuid !== item.uuid);
    this.content.references = references;
  }

}

function ItemContentsDiffer(item1, item2, excludeContentKeys) {
  if (!excludeContentKeys) {
    excludeContentKeys = [];
  }

  return !ItemContentsEqual(item1.content, item2.content, item1.contentKeysToIgnoreWhenCheckingEquality().concat(excludeContentKeys), item1.appDataContentKeysToIgnoreWhenCheckingEquality());
}

function ItemContentsEqual(leftContent, rightContent, keysToIgnore, appDataKeysToIgnore) {
  /* Create copies of objects before running omit as not to modify source values directly. */
  leftContent = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* sortedCopy */ "F"])(leftContent);

  if (leftContent.appData) {
    const domainData = leftContent.appData[_content_types__WEBPACK_IMPORTED_MODULE_5__[/* DefaultAppDomain */ "b"]];
    Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* omitInPlace */ "z"])(domainData, appDataKeysToIgnore);
    /**
     * We don't want to disqualify comparison if one object contains an empty domain object
     * and the other doesn't contain a domain object. This can happen if you create an item
     * without setting dirty, which means it won't be initialized with a client_updated_at
     */

    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete leftContent.appData;
      }
    } else {
      delete leftContent.appData;
    }
  }

  Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* omitInPlace */ "z"])(leftContent, keysToIgnore);
  rightContent = Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* sortedCopy */ "F"])(rightContent);

  if (rightContent.appData) {
    const domainData = rightContent.appData[_content_types__WEBPACK_IMPORTED_MODULE_5__[/* DefaultAppDomain */ "b"]];
    Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* omitInPlace */ "z"])(domainData, appDataKeysToIgnore);

    if (domainData) {
      if (Object.keys(domainData).length === 0) {
        delete rightContent.appData;
      }
    } else {
      delete rightContent.appData;
    }
  }

  Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_3__[/* omitInPlace */ "z"])(rightContent, keysToIgnore);
  return JSON.stringify(leftContent) === JSON.stringify(rightContent);
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(76).setImmediate))

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ProtocolVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return compareVersions; });
var ProtocolVersion;

(function (ProtocolVersion) {
  ProtocolVersion["V000Base64Decrypted"] = "000";
  ProtocolVersion["V001"] = "001";
  ProtocolVersion["V002"] = "002";
  ProtocolVersion["V003"] = "003";
  ProtocolVersion["V004"] = "004";
  ProtocolVersion[ProtocolVersion["VersionLength"] = 3] = "VersionLength";
})(ProtocolVersion || (ProtocolVersion = {}));

;
/**
 *  -1 if a < b
 *  0 if a == b
 *  1 if a > b
 */

function compareVersions(a, b) {
  const aNum = Number(a);
  const bNum = Number(b);
  return aNum - bNum;
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SyncEvent; });
var SyncEvent;

(function (SyncEvent) {
  /** A full sync can consist of many round-trips to the server */
  SyncEvent["FullSyncCompleted"] = "sync =full-completed";
  /** A single sync is just one round-trip to the server completion */

  SyncEvent["SingleSyncCompleted"] = "sync =single-completed";
  SyncEvent["SyncWillBegin"] = "sync =will-begin";
  SyncEvent["DownloadFirstSyncCompleted"] = "sync =download-first-completed";
  SyncEvent["SyncTakingTooLong"] = "sync =taking-too-long";
  SyncEvent["SyncError"] = "sync =error";
  SyncEvent["InvalidSession"] = "sync =invalid-session";
  SyncEvent["MajorDataChange"] = "major-data-change";
  SyncEvent["LocalDataIncrementalLoad"] = "local-data-incremental-load";
  SyncEvent["LocalDataLoaded"] = "local-data-loaded";
  SyncEvent["EnterOutOfSync"] = "enter-out-of-sync";
  SyncEvent["ExitOutOfSync"] = "exit-out-of-sync";
  SyncEvent["StatusChanged"] = "status-changed";
  SyncEvent["DatabaseWriteError"] = "database-write-error";
  SyncEvent["DatabaseReadError"] = "database-read-error";
})(SyncEvent || (SyncEvent = {}));

;

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return EncryptionIntent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return isLocalStorageIntent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return isFileIntent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return isDecryptedIntent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return intentRequiresEncryption; });
var EncryptionIntent;

(function (EncryptionIntent) {
  EncryptionIntent[EncryptionIntent["Sync"] = 0] = "Sync";
  /** Permissible only for server extensions */

  EncryptionIntent[EncryptionIntent["SyncDecrypted"] = 1] = "SyncDecrypted";
  EncryptionIntent[EncryptionIntent["LocalStorageEncrypted"] = 2] = "LocalStorageEncrypted";
  EncryptionIntent[EncryptionIntent["LocalStorageDecrypted"] = 3] = "LocalStorageDecrypted";
  /** Store encrypted if possible, but decrypted if not */

  EncryptionIntent[EncryptionIntent["LocalStoragePreferEncrypted"] = 4] = "LocalStoragePreferEncrypted";
  EncryptionIntent[EncryptionIntent["FileEncrypted"] = 5] = "FileEncrypted";
  EncryptionIntent[EncryptionIntent["FileDecrypted"] = 6] = "FileDecrypted";
  EncryptionIntent[EncryptionIntent["FilePreferEncrypted"] = 7] = "FilePreferEncrypted";
})(EncryptionIntent || (EncryptionIntent = {}));

;
function isLocalStorageIntent(intent) {
  return intent === EncryptionIntent.LocalStorageEncrypted || intent === EncryptionIntent.LocalStorageDecrypted || intent === EncryptionIntent.LocalStoragePreferEncrypted;
}
function isFileIntent(intent) {
  return intent === EncryptionIntent.FileEncrypted || intent === EncryptionIntent.FileDecrypted || intent === EncryptionIntent.FilePreferEncrypted;
}
function isDecryptedIntent(intent) {
  return intent === EncryptionIntent.SyncDecrypted || intent === EncryptionIntent.LocalStorageDecrypted || intent === EncryptionIntent.FileDecrypted;
}
/**
 * @returns {boolean}  True if the intent requires encryption.
 */

function intentRequiresEncryption(intent) {
  return intent === EncryptionIntent.Sync || intent === EncryptionIntent.LocalStorageEncrypted || intent === EncryptionIntent.FileEncrypted;
}

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PayloadFormat; });
var PayloadFormat;

(function (PayloadFormat) {
  PayloadFormat[PayloadFormat["EncryptedString"] = 0] = "EncryptedString";
  PayloadFormat[PayloadFormat["DecryptedBareObject"] = 1] = "DecryptedBareObject";
  PayloadFormat[PayloadFormat["DecryptedBase64String"] = 2] = "DecryptedBase64String";
  PayloadFormat[PayloadFormat["Deleted"] = 3] = "Deleted";
})(PayloadFormat || (PayloadFormat = {}));

;

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Uuids; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FillItemContent; });
/* harmony import */ var _content_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

/**
 * Returns an array of uuids for the given items or payloads
 */

function Uuids(items) {
  return items.map(item => {
    return item.uuid;
  });
}
/**
 * Modifies the input object to fill in any missing required values from the
 * content body.
 */

function FillItemContent(content) {
  if (!content.references) {
    content.references = [];
  }

  if (!content.appData) {
    content.appData = {};
  }

  if (!content.appData[_content_types__WEBPACK_IMPORTED_MODULE_0__[/* DefaultAppDomain */ "b"]]) {
    content.appData[_content_types__WEBPACK_IMPORTED_MODULE_0__[/* DefaultAppDomain */ "b"]] = {};
  }

  return content;
}

/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PureService; });
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);

class PureService {
  constructor() {
    this.eventObservers = [];
    this.loggingEnabled = false;
    this.criticalPromises = [];
  }

  addEventObserver(observer) {
    this.eventObservers.push(observer);
    return () => {
      Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_0__[/* removeFromArray */ "B"])(this.eventObservers, observer);
    };
  }

  async notifyEvent(eventName, data) {
    for (const observer of this.eventObservers) {
      await observer(eventName, data || {});
    }
  }
  /**
   * Called by application to allow services to momentarily block deinit until
   * sensitive operations complete.
   */


  async blockDeinit() {
    await Promise.all(this.criticalPromises);
  }
  /**
   * Called by application before restart.
   * Subclasses should deregister any observers/timers
   */


  deinit() {
    this.eventObservers.length = 0;
    this.deviceInterface = undefined;
  }
  /**
   * A critical function is one that should block signing out or destroying application
   * session until the crticial function has completed. For example, persisting keys to
   * disk is a critical operation, and should be wrapped in this function call. The
   * parent application instance will await all criticial functions via the `blockDeinit`
   * function before signing out and deiniting.
   */


  async executeCriticalFunction(func) {
    const promise = func();
    this.criticalPromises.push(promise);
    return promise;
  }
  /**
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */


  async handleApplicationStage(stage) {}

  log(message) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (this.loggingEnabled) {
      const date = new Date();
      const timeString = date.toLocaleTimeString().replace(' PM', '').replace(' AM', '');
      const string = "".concat(timeString, ".").concat(date.getMilliseconds());

      if (args) {
        args = args.map(arg => {
          if (Array.isArray(arg)) {
            return arg.slice();
          } else {
            return arg;
          }
        });
        console.log(string, message, ...args);
      } else {
        console.log(string, message);
      }
    }
  }

}

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApplicationEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return applicationEventForSyncEvent; });
/* harmony import */ var _Services_sync_events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "b", function() { return _Services_sync_events__WEBPACK_IMPORTED_MODULE_0__["a"]; });



var ApplicationEvent;

(function (ApplicationEvent) {
  ApplicationEvent[ApplicationEvent["SignedIn"] = 2] = "SignedIn";
  ApplicationEvent[ApplicationEvent["SignedOut"] = 3] = "SignedOut";
  /** When a full, potentially multi-page sync completes */

  ApplicationEvent[ApplicationEvent["CompletedFullSync"] = 5] = "CompletedFullSync";
  ApplicationEvent[ApplicationEvent["FailedSync"] = 6] = "FailedSync";
  ApplicationEvent[ApplicationEvent["HighLatencySync"] = 7] = "HighLatencySync";
  ApplicationEvent[ApplicationEvent["EnteredOutOfSync"] = 8] = "EnteredOutOfSync";
  ApplicationEvent[ApplicationEvent["ExitedOutOfSync"] = 9] = "ExitedOutOfSync";
  /**
   * The application has finished it `prepareForLaunch` state and is now ready for unlock
   * Called when the application has initialized and is ready for launch, but before
   * the application has been unlocked, if applicable. Use this to do pre-launch
   * configuration, but do not attempt to access user data like notes or tags.
   */

  ApplicationEvent[ApplicationEvent["Started"] = 10] = "Started";
  /**
   * The application has started `prepareForLaunch` and completed base migration.
   */

  ApplicationEvent[ApplicationEvent["PreparingForLaunch"] = 23] = "PreparingForLaunch";
  /**
   * The applicaiton is fully unlocked and ready for i/o
   * Called when the application has been fully decrypted and unlocked. Use this to
   * to begin streaming data like notes and tags.
   */

  ApplicationEvent[ApplicationEvent["Launched"] = 11] = "Launched";
  ApplicationEvent[ApplicationEvent["LocalDataLoaded"] = 12] = "LocalDataLoaded";
  /**
   * When the root key or root key wrapper changes. Includes events like account state
   * changes (registering, signing in, changing pw, logging out) and passcode state
   * changes (adding, removing, changing).
   */

  ApplicationEvent[ApplicationEvent["KeyStatusChanged"] = 13] = "KeyStatusChanged";
  ApplicationEvent[ApplicationEvent["MajorDataChange"] = 14] = "MajorDataChange";
  ApplicationEvent[ApplicationEvent["CompletedRestart"] = 15] = "CompletedRestart";
  ApplicationEvent[ApplicationEvent["LocalDataIncrementalLoad"] = 16] = "LocalDataIncrementalLoad";
  ApplicationEvent[ApplicationEvent["SyncStatusChanged"] = 17] = "SyncStatusChanged";
  ApplicationEvent[ApplicationEvent["WillSync"] = 18] = "WillSync";
  ApplicationEvent[ApplicationEvent["InvalidSyncSession"] = 19] = "InvalidSyncSession";
  ApplicationEvent[ApplicationEvent["LocalDatabaseReadError"] = 20] = "LocalDatabaseReadError";
  ApplicationEvent[ApplicationEvent["LocalDatabaseWriteError"] = 21] = "LocalDatabaseWriteError";
  /** When a single roundtrip completes with sync, in a potentially multi-page sync request.
   * If just a single roundtrip, this event will be triggered, along with CompletedFullSync */

  ApplicationEvent[ApplicationEvent["CompletedIncrementalSync"] = 22] = "CompletedIncrementalSync";
})(ApplicationEvent || (ApplicationEvent = {}));

;
function applicationEventForSyncEvent(syncEvent) {
  return {
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].FullSyncCompleted]: ApplicationEvent.CompletedFullSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].SingleSyncCompleted]: ApplicationEvent.CompletedIncrementalSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].SyncError]: ApplicationEvent.FailedSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].SyncTakingTooLong]: ApplicationEvent.HighLatencySync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].EnterOutOfSync]: ApplicationEvent.EnteredOutOfSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].ExitOutOfSync]: ApplicationEvent.ExitedOutOfSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].LocalDataLoaded]: ApplicationEvent.LocalDataLoaded,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].MajorDataChange]: ApplicationEvent.MajorDataChange,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].LocalDataIncrementalLoad]: ApplicationEvent.LocalDataIncrementalLoad,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].StatusChanged]: ApplicationEvent.SyncStatusChanged,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].SyncWillBegin]: ApplicationEvent.WillSync,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].InvalidSession]: ApplicationEvent.InvalidSyncSession,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].DatabaseReadError]: ApplicationEvent.LocalDatabaseReadError,
    [_Services_sync_events__WEBPACK_IMPORTED_MODULE_0__[/* SyncEvent */ "a"].DatabaseWriteError]: ApplicationEvent.LocalDatabaseWriteError
  }[syncEvent];
}

/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ConflictStrategy; });
var ConflictStrategy;

(function (ConflictStrategy) {
  ConflictStrategy[ConflictStrategy["KeepLeft"] = 1] = "KeepLeft";
  ConflictStrategy[ConflictStrategy["KeepRight"] = 2] = "KeepRight";
  ConflictStrategy[ConflictStrategy["KeepLeftDuplicateRight"] = 3] = "KeepLeftDuplicateRight";
  ConflictStrategy[ConflictStrategy["DuplicateLeftKeepRight"] = 4] = "DuplicateLeftKeepRight";
  ConflictStrategy[ConflictStrategy["KeepLeftMergeRefs"] = 5] = "KeepLeftMergeRefs";
})(ConflictStrategy || (ConflictStrategy = {}));

;

/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SNPredicate; });
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(0);


function toPredicate(object) {
  if (object instanceof SNPredicate) {
    return object;
  }

  if (Array.isArray(object)) {
    return SNPredicate.FromArray(object);
  }

  return SNPredicate.FromJson(object);
}
/**
 * A local-only construct that defines a built query that can be used to
 * dynamically search items.
 */


class SNPredicate {
  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    if (this.isRecursive()) {
      const array = this.value;
      this.value = array.map(element => toPredicate(element));
    } else if (this.value === 'true' || this.value === 'false') {
      /* If value is boolean string, convert to boolean */
      this.value = JSON.parse(this.value);
    }
  }

  static FromJson(values) {
    return new SNPredicate(values.keypath, values.operator, values.value);
  }

  static FromArray(array) {
    return new SNPredicate(array[0], array[1], array[2]);
  }

  isRecursive() {
    return ['and', 'or'].includes(this.operator);
  }

  arrayRepresentation() {
    return [this.keypath, this.operator, this.value];
  }

  valueAsArray() {
    return this.value;
  }

  keypathIncludesVerb(verb) {
    if (this.isRecursive()) {
      for (const value of this.value) {
        if (value.keypathIncludesVerb(verb)) {
          return true;
        }
      }

      return false;
    } else {
      return this.keypath.includes(verb);
    }
  }

  static CompoundPredicate(predicates) {
    return new SNPredicate('ignored', 'and', predicates);
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    /* Predicates may not always be created using the official constructor
       so if it's still an array here, convert to object */
    predicate = toPredicate(predicate);

    if (predicate.isRecursive()) {
      if (predicate.operator === 'and') {
        for (const subPredicate of predicate.valueAsArray()) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }

        return true;
      }

      if (predicate.operator === 'or') {
        for (const subPredicate of predicate.valueAsArray()) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }

        return false;
      }
    }

    let targetValue = predicate.value;

    if (typeof targetValue === 'string' && targetValue.includes('.ago')) {
      targetValue = this.DateFromString(targetValue);
    }
    /* Process not before handling the keypath, because not does not use it. */


    if (predicate.operator === 'not') {
      return !this.ObjectSatisfiesPredicate(object, targetValue);
    }

    const valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current];
    }, object);
    const falseyValues = [false, '', null, undefined, NaN];
    /* If the value at keyPath is undefined, either because the
      property is nonexistent or the value is null. */

    if (valueAtKeyPath === undefined) {
      if (predicate.operator === '!=') {
        return !falseyValues.includes(predicate.value);
      } else {
        return falseyValues.includes(predicate.value);
      }
    }

    if (predicate.operator === '=') {
      /* Use array comparison */
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) === JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath === targetValue;
      }
    } else if (predicate.operator === '!=') {
      // Use array comparison
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) !== JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath !== targetValue;
      }
    } else if (predicate.operator === '<') {
      return valueAtKeyPath < targetValue;
    } else if (predicate.operator === '>') {
      return valueAtKeyPath > targetValue;
    } else if (predicate.operator === '<=') {
      return valueAtKeyPath <= targetValue;
    } else if (predicate.operator === '>=') {
      return valueAtKeyPath >= targetValue;
    } else if (predicate.operator === 'startsWith') {
      return valueAtKeyPath.startsWith(targetValue);
    } else if (predicate.operator === 'in') {
      return targetValue.indexOf(valueAtKeyPath) !== -1;
    } else if (predicate.operator === 'includes') {
      return this.resolveIncludesPredicate(valueAtKeyPath, targetValue);
    } else if (predicate.operator === 'matches') {
      const regex = new RegExp(targetValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }
  /**
   * @param itemValueArray Because we are resolving the `includes` operator, the given
   * value should be an array.
   * @param containsValue  The value we are checking to see if exists in itemValueArray
   */


  static resolveIncludesPredicate(itemValueArray, containsValue) {
    // includes can be a string or a predicate (in array form)
    if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_0__[/* isString */ "s"])(containsValue)) {
      // if string, simply check if the itemValueArray includes the predicate value
      return itemValueArray.includes(containsValue);
    } else {
      // is a predicate array or predicate object
      let innerPredicate;

      if (Array.isArray(containsValue)) {
        innerPredicate = SNPredicate.FromArray(containsValue);
      } else {
        innerPredicate = containsValue;
      }

      for (const obj of itemValueArray) {
        if (this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }

      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item, predicates) {
    for (const predicate of predicates) {
      if (!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }

    return true;
  }
  /**
   * Predicate date strings are of form "x.days.ago" or "x.hours.ago"
   */


  static DateFromString(string) {
    const comps = string.split('.');
    const unit = comps[1];
    const date = new Date();
    const offset = parseInt(comps[0]);

    if (unit === 'days') {
      date.setDate(date.getDate() - offset);
    } else if (unit === 'hours') {
      date.setHours(date.getHours() - offset);
    }

    return date;
  }

}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */

var isArray = Array.isArray;
module.exports = isArray;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var freeGlobal = __webpack_require__(55);
/** Detect free variable `self`. */


var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = freeGlobal || freeSelf || Function('return this')();
module.exports = root;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createFind = __webpack_require__(155),
    findIndex = __webpack_require__(156);
/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */


var find = createFind(findIndex);
module.exports = find;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIteratee = __webpack_require__(37),
    basePullAt = __webpack_require__(150);
/**
 * Removes all elements from `array` that `predicate` returns truthy for
 * and returns an array of the removed elements. The predicate is invoked
 * with three arguments: (value, index, array).
 *
 * **Note:** Unlike `_.filter`, this method mutates `array`. Use `_.pull`
 * to pull elements from an array by value.
 *
 * @static
 * @memberOf _
 * @since 2.0.0
 * @category Array
 * @param {Array} array The array to modify.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new array of removed elements.
 * @example
 *
 * var array = [1, 2, 3, 4];
 * var evens = _.remove(array, function(n) {
 *   return n % 2 == 0;
 * });
 *
 * console.log(array);
 * // => [1, 3]
 *
 * console.log(evens);
 * // => [2, 4]
 */


function remove(array, predicate) {
  var result = [];

  if (!(array && array.length)) {
    return result;
  }

  var index = -1,
      indexes = [],
      length = array.length;
  predicate = baseIteratee(predicate, 3);

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result.push(value);
      indexes.push(index);
    }
  }

  basePullAt(array, indexes);
  return result;
}

module.exports = remove;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsNative = __webpack_require__(92),
    getValue = __webpack_require__(97);
/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */


function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */

function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseUniq = __webpack_require__(75);
/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */


function uniq(array) {
  return array && array.length ? baseUniq(array) : [];
}

module.exports = uniq;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Symbol = __webpack_require__(31),
    getRawTag = __webpack_require__(93),
    objectToString = __webpack_require__(94);
/** `Object#toString` result references. */


var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';
/** Built-in value references. */

var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}

module.exports = baseGetTag;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */

function eq(value, other) {
  return value === other || value !== value && other !== other;
}

module.exports = eq;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isFunction = __webpack_require__(40),
    isLength = __webpack_require__(48);
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */


function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isSymbol = __webpack_require__(35);
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */

function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

module.exports = toKey;

/***/ }),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PurePayload; });
/* harmony import */ var _Models_functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _fields__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _Payloads_sources__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(2);
/* harmony import */ var _Protocol_versions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _Lib_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(0);
/* harmony import */ var _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(9);






/**
 * A payload is a vehicle in which item data is transported or persisted.
 * This class represents an abstract PurePayload which does not have any fields. Instead,
 * subclasses must override the `fields` static method to return which fields this particular
 * class of payload contains. For example, a ServerItemPayload is a transmission vehicle for
 * transporting an item to the server, and does not contain fields like PayloadFields.Dirty.
 * However, a StorageItemPayload is a persistence vehicle for saving payloads to disk, and does contain
 * PayloadsFields.Dirty.
 *
 * Payloads are completely immutable and may not be modified after creation. Payloads should
 * not be created directly using the constructor, but instead created using the generators avaiable
 * in generator.js.
 *
 * Payloads also have a content format. Formats can either be
 * DecryptedBase64String, EncryptedString, or DecryptedBareObject.
 */

class PurePayload {
  constructor(rawPayload, fields, source) {
    if (fields) {
      this.fields = fields;
    } else {
      this.fields = Object.keys(rawPayload);
    }

    if (source) {
      this.source = source;
    } else {
      this.source = _Payloads_sources__WEBPACK_IMPORTED_MODULE_2__[/* PayloadSource */ "a"].Constructor;
    }

    this.uuid = rawPayload.uuid;

    if (!this.uuid && this.fields.includes(_fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].Uuid)) {
      throw Error('uuid is null, yet this payloads fields indicate it shouldnt be.');
    }

    this.content_type = rawPayload.content_type;

    if (rawPayload.content) {
      if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* isObject */ "q"])(rawPayload.content)) {
        this.content = Object(_Models_functions__WEBPACK_IMPORTED_MODULE_0__[/* FillItemContent */ "a"])(rawPayload.content);
      } else {
        this.content = rawPayload.content;
      }
    }

    this.deleted = rawPayload.deleted;
    this.items_key_id = rawPayload.items_key_id;
    this.enc_item_key = rawPayload.enc_item_key;
    /** Fallback to initializing with now date */

    this.created_at = new Date(rawPayload.created_at || new Date());
    /** Fallback to initializing with 0 epoch date */

    this.updated_at = new Date(rawPayload.updated_at || new Date(0));
    this.dirtiedDate = new Date(rawPayload.dirtiedDate);
    this.dirty = rawPayload.dirty;
    this.errorDecrypting = rawPayload.errorDecrypting;
    this.waitingForKey = rawPayload.waitingForKey;
    this.errorDecryptingValueChanged = rawPayload.errorDecryptingValueChanged;
    this.lastSyncBegan = rawPayload.lastSyncBegan ? new Date(rawPayload.lastSyncBegan) : undefined;
    this.lastSyncEnd = rawPayload.lastSyncEnd ? new Date(rawPayload.lastSyncEnd) : undefined;
    this.auth_hash = rawPayload.auth_hash;
    this.auth_params = rawPayload.auth_params;
    this.duplicate_of = rawPayload.duplicate_of;

    if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* isString */ "s"])(this.content)) {
      if (this.content.startsWith(_Protocol_versions__WEBPACK_IMPORTED_MODULE_3__[/* ProtocolVersion */ "a"].V000Base64Decrypted)) {
        this.format = _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].DecryptedBase64String;
      } else {
        this.format = _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].EncryptedString;
      }
    } else if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* isObject */ "q"])(this.content)) {
      this.format = _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].DecryptedBareObject;
    } else {
      this.format = _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].Deleted;
    }

    if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* isString */ "s"])(this.content)) {
      this.version = this.content.substring(0, _Protocol_versions__WEBPACK_IMPORTED_MODULE_3__[/* ProtocolVersion */ "a"].VersionLength);
    } else if (this.content) {
      this.version = this.content.version;
    }

    Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* deepFreeze */ "g"])(this);
  }
  /**
   * Returns a generic object with all payload fields except any that are meta-data
   * related (such as `fields`, `dirtiedDate`, etc). "Ejected" means a payload for
   * generic, non-contextual consumption, such as saving to a backup file or syncing
   * with a server.
   */


  ejected() {
    const optionalFields = [_fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].Legacy003AuthHash, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].Deleted];
    const nonRequiredFields = [_fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].DirtiedDate, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].ErrorDecrypting, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].ErrorDecryptingChanged, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].WaitingForKey, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].LastSyncBegan, _fields__WEBPACK_IMPORTED_MODULE_1__[/* PayloadField */ "a"].LastSyncEnd];
    const result = {};

    for (const field of this.fields) {
      if (nonRequiredFields.includes(field)) {
        continue;
      }

      const value = this[field];

      if (Object(_Lib_utils__WEBPACK_IMPORTED_MODULE_4__[/* isNullOrUndefined */ "p"])(value) && optionalFields.includes(field)) {
        continue;
      }

      result[field] = value;
    }

    return result;
  }

  get safeContent() {
    if (this.format === _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].DecryptedBareObject) {
      return this.content;
    } else {
      return {};
    }
  }
  /** Defined to allow singular API with Payloadable type (PurePayload | SNItem) */


  get references() {
    return this.safeReferences;
  }

  get safeReferences() {
    return this.safeContent.references || [];
  }

  get contentObject() {
    if (this.format !== _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].DecryptedBareObject) {
      throw Error('Attempting to access non-object content as object');
    }

    return this.content;
  }

  get contentString() {
    if (this.format === _Payloads_formats__WEBPACK_IMPORTED_MODULE_5__[/* PayloadFormat */ "a"].DecryptedBareObject) {
      throw Error('Attempting to access non-string content as string');
    }

    return this.content;
  }
  /**
   * Whether a payload can be discarded and removed from storage.
   * This value is true if a payload is marked as deleted and not dirty.
   */


  get discardable() {
    return this.deleted && !this.dirty;
  }

}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var g; // This works in non-strict mode

g = function () {
  return this;
}();

try {
  // This works if eval is allowed (see CSP)
  g = g || new Function("return this")();
} catch (e) {
  // This works if the window reference is available
  if (typeof window === "object") g = window;
} // g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}


module.exports = g;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var listCacheClear = __webpack_require__(82),
    listCacheDelete = __webpack_require__(83),
    listCacheGet = __webpack_require__(84),
    listCacheHas = __webpack_require__(85),
    listCacheSet = __webpack_require__(86);
/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `ListCache`.


ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
module.exports = ListCache;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var eq = __webpack_require__(24);
/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}

module.exports = assocIndexOf;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var root = __webpack_require__(16);
/** Built-in value references. */


var Symbol = root.Symbol;
module.exports = Symbol;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20);
/* Built-in method references that are verified to be native. */


var nativeCreate = getNative(Object, 'create');
module.exports = nativeCreate;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isKeyable = __webpack_require__(106);
/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */


function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}

module.exports = getMapData;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */

function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}

module.exports = isIndex;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetTag = __webpack_require__(23),
    isObjectLike = __webpack_require__(21);
/** `Object#toString` result references. */


var symbolTag = '[object Symbol]';
/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */

function isSymbol(value) {
  return typeof value == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
}

module.exports = isSymbol;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseMerge = __webpack_require__(68),
    createAssigner = __webpack_require__(74);
/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */


var merge = createAssigner(function (object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});
module.exports = merge;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseMatches = __webpack_require__(80),
    baseMatchesProperty = __webpack_require__(136),
    identity = __webpack_require__(53),
    isArray = __webpack_require__(15),
    property = __webpack_require__(147);
/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */


function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }

  if (value == null) {
    return identity;
  }

  if (typeof value == 'object') {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }

  return property(value);
}

module.exports = baseIteratee;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ListCache = __webpack_require__(29),
    stackClear = __webpack_require__(87),
    stackDelete = __webpack_require__(88),
    stackGet = __webpack_require__(89),
    stackHas = __webpack_require__(90),
    stackSet = __webpack_require__(91);
/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
} // Add methods to `Stack`.


Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
module.exports = Stack;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20),
    root = __webpack_require__(16);
/* Built-in method references that are verified to be native. */


var Map = getNative(root, 'Map');
module.exports = Map;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetTag = __webpack_require__(23),
    isObject = __webpack_require__(18);
/** `Object#toString` result references. */


var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  } // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.


  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mapCacheClear = __webpack_require__(98),
    mapCacheDelete = __webpack_require__(105),
    mapCacheGet = __webpack_require__(107),
    mapCacheHas = __webpack_require__(108),
    mapCacheSet = __webpack_require__(109);
/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `MapCache`.


MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
module.exports = MapCache;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */

function setToArray(set) {
  var index = -1,
      result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}

module.exports = setToArray;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayLikeKeys = __webpack_require__(62),
    baseKeys = __webpack_require__(129),
    isArrayLike = __webpack_require__(25);
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */


function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsArguments = __webpack_require__(124),
    isObjectLike = __webpack_require__(21);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Built-in value references. */

var propertyIsEnumerable = objectProto.propertyIsEnumerable;
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */

var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
module.exports = isArguments;

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var root = __webpack_require__(16),
    stubFalse = __webpack_require__(125);
/** Detect free variable `exports`. */


var freeExports =  true && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Built-in value references. */

var Buffer = moduleExports ? root.Buffer : undefined;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */

var isBuffer = nativeIsBuffer || stubFalse;
module.exports = isBuffer;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(46)(module)))

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (module) {
  if (!module.webpackPolyfill) {
    module.deprecate = function () {};

    module.paths = []; // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function get() {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function get() {
        return module.i;
      }
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsTypedArray = __webpack_require__(126),
    baseUnary = __webpack_require__(127),
    nodeUtil = __webpack_require__(128);
/* Node.js helper references. */


var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */

var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
module.exports = isTypedArray;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */

function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used for built-in method references. */

var objectProto = Object.prototype;
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */

function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}

module.exports = isPrototype;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var castPath = __webpack_require__(51),
    toKey = __webpack_require__(26);
/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */


function baseGet(object, path) {
  path = castPath(path, object);
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }

  return index && index == length ? object : undefined;
}

module.exports = baseGet;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isArray = __webpack_require__(15),
    isKey = __webpack_require__(52),
    stringToPath = __webpack_require__(138),
    toString = __webpack_require__(141);
/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */


function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }

  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isArray = __webpack_require__(15),
    isSymbol = __webpack_require__(35);
/** Used to match property names within property paths. */


var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;
/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */

function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }

  var type = typeof value;

  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
    return true;
  }

  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}

module.exports = isKey;

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */

function identity(value) {
  return value;
}

module.exports = identity;

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defineProperty = __webpack_require__(70);
/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

module.exports = baseAssignValue;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/** Detect free variable `global` from Node.js. */

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
module.exports = freeGlobal;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(28)))

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used for built-in method references. */

var funcProto = Function.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */

function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}

module.exports = toSource;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsEqualDeep = __webpack_require__(110),
    isObjectLike = __webpack_require__(21);
/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */


function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }

  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var SetCache = __webpack_require__(59),
    arraySome = __webpack_require__(113),
    cacheHas = __webpack_require__(60);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */

function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  } // Assume cyclic values are equal.


  var stacked = stack.get(array);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var index = -1,
      result = true,
      seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array); // Ignore non-index properties.

  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }

    if (compared !== undefined) {
      if (compared) {
        continue;
      }

      result = false;
      break;
    } // Recursively compare arrays (susceptible to call stack limits).


    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
      result = false;
      break;
    }
  }

  stack['delete'](array);
  stack['delete'](other);
  return result;
}

module.exports = equalArrays;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var MapCache = __webpack_require__(41),
    setCacheAdd = __webpack_require__(111),
    setCacheHas = __webpack_require__(112);
/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */


function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();

  while (++index < length) {
    this.add(values[index]);
  }
} // Add methods to `SetCache`.


SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
module.exports = SetCache;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function cacheHas(cache, key) {
  return cache.has(key);
}

module.exports = cacheHas;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var root = __webpack_require__(16);
/** Built-in value references. */


var Uint8Array = root.Uint8Array;
module.exports = Uint8Array;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseTimes = __webpack_require__(123),
    isArguments = __webpack_require__(44),
    isArray = __webpack_require__(15),
    isBuffer = __webpack_require__(45),
    isIndex = __webpack_require__(34),
    isTypedArray = __webpack_require__(47);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = arrayLikeKeys;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */

function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20),
    root = __webpack_require__(16);
/* Built-in method references that are verified to be native. */


var Set = getNative(root, 'Set');
module.exports = Set;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(18);
/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */


function isStrictComparable(value) {
  return value === value && !isObject(value);
}

module.exports = isStrictComparable;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }

    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}

module.exports = matchesStrictComparable;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */

function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while (fromRight ? index-- : ++index < length) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }

  return -1;
}

module.exports = baseFindIndex;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Stack = __webpack_require__(38),
    assignMergeValue = __webpack_require__(69),
    baseFor = __webpack_require__(160),
    baseMergeDeep = __webpack_require__(162),
    isObject = __webpack_require__(18),
    keysIn = __webpack_require__(73),
    safeGet = __webpack_require__(72);
/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }

  baseFor(source, function (srcValue, key) {
    stack || (stack = new Stack());

    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }

      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

module.exports = baseMerge;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseAssignValue = __webpack_require__(54),
    eq = __webpack_require__(24);
/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignMergeValue;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20);

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();

module.exports = defineProperty;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var overArg = __webpack_require__(63);
/** Built-in value references. */


var getPrototype = overArg(Object.getPrototypeOf, Object);
module.exports = getPrototype;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */

function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

module.exports = safeGet;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayLikeKeys = __webpack_require__(62),
    baseKeysIn = __webpack_require__(174),
    isArrayLike = __webpack_require__(25);
/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */


function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = keysIn;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseRest = __webpack_require__(176),
    isIterateeCall = __webpack_require__(183);
/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */


function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }

    object = Object(object);

    while (++index < length) {
      var source = sources[index];

      if (source) {
        assigner(object, source, index, customizer);
      }
    }

    return object;
  });
}

module.exports = createAssigner;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var SetCache = __webpack_require__(59),
    arrayIncludes = __webpack_require__(184),
    arrayIncludesWith = __webpack_require__(188),
    cacheHas = __webpack_require__(60),
    createSet = __webpack_require__(189),
    setToArray = __webpack_require__(42);
/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE = 200;
/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */

function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = arrayIncludesWith;
  } else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : createSet(array);

    if (set) {
      return setToArray(set);
    }

    isCommon = false;
    includes = cacheHas;
    seen = new SetCache();
  } else {
    seen = iteratee ? [] : result;
  }

  outer: while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;
    value = comparator || value !== 0 ? value : 0;

    if (isCommon && computed === computed) {
      var seenIndex = seen.length;

      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }

      if (iteratee) {
        seen.push(computed);
      }

      result.push(value);
    } else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }

      result.push(value);
    }
  }

  return result;
}

module.exports = baseUniq;

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var scope = typeof global !== "undefined" && global || typeof self !== "undefined" && self || window;
var apply = Function.prototype.apply; // DOM APIs, for completeness

exports.setTimeout = function () {
  return new Timeout(apply.call(setTimeout, scope, arguments), clearTimeout);
};

exports.setInterval = function () {
  return new Timeout(apply.call(setInterval, scope, arguments), clearInterval);
};

exports.clearTimeout = exports.clearInterval = function (timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}

Timeout.prototype.unref = Timeout.prototype.ref = function () {};

Timeout.prototype.close = function () {
  this._clearFn.call(scope, this._id);
}; // Does not start the time, just sets up the members needed.


exports.enroll = function (item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function (item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function (item) {
  clearTimeout(item._idleTimeoutId);
  var msecs = item._idleTimeout;

  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout) item._onTimeout();
    }, msecs);
  }
}; // setimmediate attaches itself to the global object


__webpack_require__(191); // On some exotic environments, it's not clear which object `setimmediate` was
// able to install onto.  Search each possibility in the same order as the
// `setimmediate` library.


exports.setImmediate = typeof self !== "undefined" && self.setImmediate || typeof global !== "undefined" && global.setImmediate || this && this.setImmediate;
exports.clearImmediate = typeof self !== "undefined" && self.clearImmediate || typeof global !== "undefined" && global.clearImmediate || this && this.clearImmediate;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(28)))

/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(setImmediate) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ApplicationService; });
/* harmony import */ var _Services_pure_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
/* harmony import */ var _Lib_events__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);


class ApplicationService extends _Services_pure_service__WEBPACK_IMPORTED_MODULE_0__[/* PureService */ "a"] {
  constructor(application) {
    super();
    this.application = application;
    /* Allow caller constructor to finish setting instance variables before triggering callbacks */

    setImmediate(() => {
      this.addAppEventObserver();
    });
  }

  deinit() {
    this.application = undefined;
    this.unsubApp();
    this.unsubApp = undefined;
    super.deinit();
  }

  addAppEventObserver() {
    if (this.application.isStarted()) {
      this.onAppStart();
    }

    if (this.application.isLaunched()) {
      this.onAppLaunch();
    }

    this.unsubApp = this.application.addEventObserver(async event => {
      this.onAppEvent(event);

      if (event === _Lib_events__WEBPACK_IMPORTED_MODULE_1__[/* ApplicationEvent */ "a"].Started) {
        await this.onAppStart();
      } else if (event === _Lib_events__WEBPACK_IMPORTED_MODULE_1__[/* ApplicationEvent */ "a"].Launched) {
        await this.onAppLaunch();
      } else if (event === _Lib_events__WEBPACK_IMPORTED_MODULE_1__[/* ApplicationEvent */ "a"].CompletedFullSync) {
        this.onAppFullSync();
      } else if (event === _Lib_events__WEBPACK_IMPORTED_MODULE_1__[/* ApplicationEvent */ "a"].CompletedIncrementalSync) {
        this.onAppIncrementalSync();
      } else if (event === _Lib_events__WEBPACK_IMPORTED_MODULE_1__[/* ApplicationEvent */ "a"].KeyStatusChanged) {
        this.onAppKeyChange();
      }
    });
  }

  onAppEvent(event) {
    /** Optional override */
  }

  async onAppStart() {
    /** Optional override */
  }

  async onAppLaunch() {
    /** Optional override */
  }

  async onAppKeyChange() {
    /** Optional override */
  }

  onAppIncrementalSync() {
    /** Optional override */
  }

  onAppFullSync() {
    /** Optional override */
  }

}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(76).setImmediate))

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseMerge = __webpack_require__(68),
    createAssigner = __webpack_require__(74);
/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */


var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});
module.exports = mergeWith;

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseUniq = __webpack_require__(75);
/**
 * This method is like `_.uniq` except that it accepts `comparator` which
 * is invoked to compare elements of `array`. The order of result values is
 * determined by the order they occur in the array.The comparator is invoked
 * with two arguments: (arrVal, othVal).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 2 }];
 *
 * _.uniqWith(objects, _.isEqual);
 * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }]
 */


function uniqWith(array, comparator) {
  comparator = typeof comparator == 'function' ? comparator : undefined;
  return array && array.length ? baseUniq(array, undefined, comparator) : [];
}

module.exports = uniqWith;

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsMatch = __webpack_require__(81),
    getMatchData = __webpack_require__(135),
    matchesStrictComparable = __webpack_require__(66);
/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */


function baseMatches(source) {
  var matchData = getMatchData(source);

  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }

  return function (object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}

module.exports = baseMatches;

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Stack = __webpack_require__(38),
    baseIsEqual = __webpack_require__(57);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */

function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }

  object = Object(object);

  while (index--) {
    var data = matchData[index];

    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }

  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();

      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }

      if (!(result === undefined ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
        return false;
      }
    }
  }

  return true;
}

module.exports = baseIsMatch;

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */

function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assocIndexOf = __webpack_require__(30);
/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  --this.size;
  return true;
}

module.exports = listCacheDelete;

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assocIndexOf = __webpack_require__(30);
/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assocIndexOf = __webpack_require__(30);
/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assocIndexOf = __webpack_require__(30);
/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */


function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
}

module.exports = listCacheSet;

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ListCache = __webpack_require__(29);
/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */


function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}

module.exports = stackClear;

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}

module.exports = stackDelete;

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */

function stackGet(key) {
  return this.__data__.get(key);
}

module.exports = stackGet;

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function stackHas(key) {
  return this.__data__.has(key);
}

module.exports = stackHas;

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ListCache = __webpack_require__(29),
    Map = __webpack_require__(39),
    MapCache = __webpack_require__(41);
/** Used as the size to enable large array optimizations. */


var LARGE_ARRAY_SIZE = 200;
/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */

function stackSet(key, value) {
  var data = this.__data__;

  if (data instanceof ListCache) {
    var pairs = data.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }

    data = this.__data__ = new MapCache(pairs);
  }

  data.set(key, value);
  this.size = data.size;
  return this;
}

module.exports = stackSet;

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isFunction = __webpack_require__(40),
    isMasked = __webpack_require__(95),
    isObject = __webpack_require__(18),
    toSource = __webpack_require__(56);
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */


var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
/** Used to detect host constructors (Safari). */

var reIsHostCtor = /^\[object .+?Constructor\]$/;
/** Used for built-in method references. */

var funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to detect if a method is native. */

var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */

function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }

  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Symbol = __webpack_require__(31);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/** Built-in value references. */

var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */

function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}

module.exports = getRawTag;

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used for built-in method references. */

var objectProto = Object.prototype;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var nativeObjectToString = objectProto.toString;
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */

function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var coreJsData = __webpack_require__(96);
/** Used to detect methods masquerading as native. */


var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */


function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}

module.exports = isMasked;

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var root = __webpack_require__(16);
/** Used to detect overreaching core-js shims. */


var coreJsData = root['__core-js_shared__'];
module.exports = coreJsData;

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */

function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Hash = __webpack_require__(99),
    ListCache = __webpack_require__(29),
    Map = __webpack_require__(39);
/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */


function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}

module.exports = mapCacheClear;

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var hashClear = __webpack_require__(100),
    hashDelete = __webpack_require__(101),
    hashGet = __webpack_require__(102),
    hashHas = __webpack_require__(103),
    hashSet = __webpack_require__(104);
/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
} // Add methods to `Hash`.


Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
module.exports = Hash;

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeCreate = __webpack_require__(32);
/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */


function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */

function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeCreate = __webpack_require__(32);
/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED = '__lodash_hash_undefined__';
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */

function hashGet(key) {
  var data = this.__data__;

  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeCreate = __webpack_require__(32);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */

function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nativeCreate = __webpack_require__(32);
/** Used to stand-in for `undefined` hash values. */


var HASH_UNDEFINED = '__lodash_hash_undefined__';
/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */

function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getMapData = __webpack_require__(33);
/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */

function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}

module.exports = isKeyable;

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getMapData = __webpack_require__(33);
/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getMapData = __webpack_require__(33);
/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getMapData = __webpack_require__(33);
/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */


function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Stack = __webpack_require__(38),
    equalArrays = __webpack_require__(58),
    equalByTag = __webpack_require__(114),
    equalObjects = __webpack_require__(116),
    getTag = __webpack_require__(131),
    isArray = __webpack_require__(15),
    isBuffer = __webpack_require__(45),
    isTypedArray = __webpack_require__(47);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = objIsArr ? arrayTag : getTag(object),
      othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }

    objIsArr = true;
    objIsObj = false;
  }

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }

  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }

  if (!isSameTag) {
    return false;
  }

  stack || (stack = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

module.exports = baseIsEqualDeep;

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used to stand-in for `undefined` hash values. */

var HASH_UNDEFINED = '__lodash_hash_undefined__';
/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */

function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);

  return this;
}

module.exports = setCacheAdd;

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */

function setCacheHas(value) {
  return this.__data__.has(value);
}

module.exports = setCacheHas;

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */

function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }

  return false;
}

module.exports = arraySome;

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Symbol = __webpack_require__(31),
    Uint8Array = __webpack_require__(61),
    eq = __webpack_require__(24),
    equalArrays = __webpack_require__(58),
    mapToArray = __webpack_require__(115),
    setToArray = __webpack_require__(42);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/** `Object#toString` result references. */

var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';
/** Used to convert symbols to primitives and strings. */

var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }

      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }

      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked) {
        return stacked == other;
      }

      bitmask |= COMPARE_UNORDERED_FLAG; // Recursively compare objects (susceptible to call stack limits).

      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }

  }

  return false;
}

module.exports = equalByTag;

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */

function mapToArray(map) {
  var index = -1,
      result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}

module.exports = mapToArray;

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getAllKeys = __webpack_require__(117);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1;
/** Used for built-in method references. */

var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */

function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      objProps = getAllKeys(object),
      objLength = objProps.length,
      othProps = getAllKeys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }

  var index = objLength;

  while (index--) {
    var key = objProps[index];

    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  } // Assume cyclic values are equal.


  var stacked = stack.get(object);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;

  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    } // Recursively compare objects (susceptible to call stack limits).


    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
      result = false;
      break;
    }

    skipCtor || (skipCtor = key == 'constructor');
  }

  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }

  stack['delete'](object);
  stack['delete'](other);
  return result;
}

module.exports = equalObjects;

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetAllKeys = __webpack_require__(118),
    getSymbols = __webpack_require__(120),
    keys = __webpack_require__(43);
/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */


function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}

module.exports = getAllKeys;

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayPush = __webpack_require__(119),
    isArray = __webpack_require__(15);
/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */


function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}

module.exports = baseGetAllKeys;

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */

function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }

  return array;
}

module.exports = arrayPush;

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var arrayFilter = __webpack_require__(121),
    stubArray = __webpack_require__(122);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Built-in value references. */

var propertyIsEnumerable = objectProto.propertyIsEnumerable;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeGetSymbols = Object.getOwnPropertySymbols;
/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */

var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
  if (object == null) {
    return [];
  }

  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function (symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
module.exports = getSymbols;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */

function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];

    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }

  return result;
}

module.exports = arrayFilter;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */

function stubArray() {
  return [];
}

module.exports = stubArray;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */

function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}

module.exports = baseTimes;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetTag = __webpack_require__(23),
    isObjectLike = __webpack_require__(21);
/** `Object#toString` result references. */


var argsTag = '[object Arguments]';
/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */

function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */

function stubFalse() {
  return false;
}

module.exports = stubFalse;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetTag = __webpack_require__(23),
    isLength = __webpack_require__(48),
    isObjectLike = __webpack_require__(21);
/** `Object#toString` result references. */


var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/** Used to identify `toStringTag` values of typed arrays. */

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */

function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */

function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}

module.exports = baseUnary;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var freeGlobal = __webpack_require__(55);
/** Detect free variable `exports`. */


var freeExports =  true && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Detect free variable `process` from Node.js. */

var freeProcess = moduleExports && freeGlobal.process;
/** Used to access faster Node.js helpers. */

var nodeUtil = function () {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    } // Legacy `process.binding('util')` for Node.js < 10.


    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();

module.exports = nodeUtil;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(46)(module)))

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isPrototype = __webpack_require__(49),
    nativeKeys = __webpack_require__(130);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }

  var result = [];

  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }

  return result;
}

module.exports = baseKeys;

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var overArg = __webpack_require__(63);
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeKeys = overArg(Object.keys, Object);
module.exports = nativeKeys;

/***/ }),
/* 131 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DataView = __webpack_require__(132),
    Map = __webpack_require__(39),
    Promise = __webpack_require__(133),
    Set = __webpack_require__(64),
    WeakMap = __webpack_require__(134),
    baseGetTag = __webpack_require__(23),
    toSource = __webpack_require__(56);
/** `Object#toString` result references. */


var mapTag = '[object Map]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    setTag = '[object Set]',
    weakMapTag = '[object WeakMap]';
var dataViewTag = '[object DataView]';
/** Used to detect maps, sets, and weakmaps. */

var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);
/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

var getTag = baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.

if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function getTag(value) {
    var result = baseGetTag(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;

        case mapCtorString:
          return mapTag;

        case promiseCtorString:
          return promiseTag;

        case setCtorString:
          return setTag;

        case weakMapCtorString:
          return weakMapTag;
      }
    }

    return result;
  };
}

module.exports = getTag;

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20),
    root = __webpack_require__(16);
/* Built-in method references that are verified to be native. */


var DataView = getNative(root, 'DataView');
module.exports = DataView;

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20),
    root = __webpack_require__(16);
/* Built-in method references that are verified to be native. */


var Promise = getNative(root, 'Promise');
module.exports = Promise;

/***/ }),
/* 134 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getNative = __webpack_require__(20),
    root = __webpack_require__(16);
/* Built-in method references that are verified to be native. */


var WeakMap = getNative(root, 'WeakMap');
module.exports = WeakMap;

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isStrictComparable = __webpack_require__(65),
    keys = __webpack_require__(43);
/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */


function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }

  return result;
}

module.exports = getMatchData;

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIsEqual = __webpack_require__(57),
    get = __webpack_require__(137),
    hasIn = __webpack_require__(144),
    isKey = __webpack_require__(52),
    isStrictComparable = __webpack_require__(65),
    matchesStrictComparable = __webpack_require__(66),
    toKey = __webpack_require__(26);
/** Used to compose bitmasks for value comparisons. */


var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;
/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */

function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }

  return function (object) {
    var objValue = get(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGet = __webpack_require__(50);
/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */


function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

/***/ }),
/* 138 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var memoizeCapped = __webpack_require__(139);
/** Used to match property names within property paths. */


var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
/** Used to match backslashes in property paths. */

var reEscapeChar = /\\(\\)?/g;
/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */

var stringToPath = memoizeCapped(function (string) {
  var result = [];

  if (string.charCodeAt(0) === 46
  /* . */
  ) {
      result.push('');
    }

  string.replace(rePropName, function (match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
});
module.exports = stringToPath;

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var memoize = __webpack_require__(140);
/** Used as the maximum memoize cache size. */


var MAX_MEMOIZE_SIZE = 500;
/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */

function memoizeCapped(func) {
  var result = memoize(func, function (key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }

    return key;
  });
  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;

/***/ }),
/* 140 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var MapCache = __webpack_require__(41);
/** Error message constants. */


var FUNC_ERROR_TEXT = 'Expected a function';
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */

function memoize(func, resolver) {
  if (typeof func != 'function' || resolver != null && typeof resolver != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  var memoized = function memoized() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };

  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
} // Expose `MapCache`.


memoize.Cache = MapCache;
module.exports = memoize;

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseToString = __webpack_require__(142);
/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */


function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Symbol = __webpack_require__(31),
    arrayMap = __webpack_require__(143),
    isArray = __webpack_require__(15),
    isSymbol = __webpack_require__(35);
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/** Used to convert symbols to primitives and strings. */

var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;
/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */

function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }

  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }

  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

module.exports = baseToString;

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */

function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }

  return result;
}

module.exports = arrayMap;

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseHasIn = __webpack_require__(145),
    hasPath = __webpack_require__(146);
/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */


function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}

module.exports = hasIn;

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */

function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

module.exports = baseHasIn;

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var castPath = __webpack_require__(51),
    isArguments = __webpack_require__(44),
    isArray = __webpack_require__(15),
    isIndex = __webpack_require__(34),
    isLength = __webpack_require__(48),
    toKey = __webpack_require__(26);
/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */


function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = toKey(path[index]);

    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }

    object = object[key];
  }

  if (result || ++index != length) {
    return result;
  }

  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}

module.exports = hasPath;

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseProperty = __webpack_require__(148),
    basePropertyDeep = __webpack_require__(149),
    isKey = __webpack_require__(52),
    toKey = __webpack_require__(26);
/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */


function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = property;

/***/ }),
/* 148 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */

function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}

module.exports = baseProperty;

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGet = __webpack_require__(50);
/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */


function basePropertyDeep(path) {
  return function (object) {
    return baseGet(object, path);
  };
}

module.exports = basePropertyDeep;

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseUnset = __webpack_require__(151),
    isIndex = __webpack_require__(34);
/** Used for built-in method references. */


var arrayProto = Array.prototype;
/** Built-in value references. */

var splice = arrayProto.splice;
/**
 * The base implementation of `_.pullAt` without support for individual
 * indexes or capturing the removed elements.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {number[]} indexes The indexes of elements to remove.
 * @returns {Array} Returns `array`.
 */

function basePullAt(array, indexes) {
  var length = array ? indexes.length : 0,
      lastIndex = length - 1;

  while (length--) {
    var index = indexes[length];

    if (length == lastIndex || index !== previous) {
      var previous = index;

      if (isIndex(index)) {
        splice.call(array, index, 1);
      } else {
        baseUnset(array, index);
      }
    }
  }

  return array;
}

module.exports = basePullAt;

/***/ }),
/* 151 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var castPath = __webpack_require__(51),
    last = __webpack_require__(152),
    parent = __webpack_require__(153),
    toKey = __webpack_require__(26);
/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */


function baseUnset(object, path) {
  path = castPath(path, object);
  object = parent(object, path);
  return object == null || delete object[toKey(last(path))];
}

module.exports = baseUnset;

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */

function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

module.exports = last;

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGet = __webpack_require__(50),
    baseSlice = __webpack_require__(154);
/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */


function parent(object, path) {
  return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
}

module.exports = parent;

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */

function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : length + start;
  }

  end = end > length ? length : end;

  if (end < 0) {
    end += length;
  }

  length = start > end ? 0 : end - start >>> 0;
  start >>>= 0;
  var result = Array(length);

  while (++index < length) {
    result[index] = array[index + start];
  }

  return result;
}

module.exports = baseSlice;

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIteratee = __webpack_require__(37),
    isArrayLike = __webpack_require__(25),
    keys = __webpack_require__(43);
/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */


function createFind(findIndexFunc) {
  return function (collection, predicate, fromIndex) {
    var iterable = Object(collection);

    if (!isArrayLike(collection)) {
      var iteratee = baseIteratee(predicate, 3);
      collection = keys(collection);

      predicate = function predicate(key) {
        return iteratee(iterable[key], key, iterable);
      };
    }

    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

module.exports = createFind;

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseFindIndex = __webpack_require__(67),
    baseIteratee = __webpack_require__(37),
    toInteger = __webpack_require__(157);
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */

function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;

  if (!length) {
    return -1;
  }

  var index = fromIndex == null ? 0 : toInteger(fromIndex);

  if (index < 0) {
    index = nativeMax(length + index, 0);
  }

  return baseFindIndex(array, baseIteratee(predicate, 3), index);
}

module.exports = findIndex;

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toFinite = __webpack_require__(158);
/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */


function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;
  return result === result ? remainder ? result - remainder : result : 0;
}

module.exports = toInteger;

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var toNumber = __webpack_require__(159);
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;
/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */

function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }

  value = toNumber(value);

  if (value === INFINITY || value === -INFINITY) {
    var sign = value < 0 ? -1 : 1;
    return sign * MAX_INTEGER;
  }

  return value === value ? value : 0;
}

module.exports = toFinite;

/***/ }),
/* 159 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(18),
    isSymbol = __webpack_require__(35);
/** Used as references for various `Number` constants. */


var NAN = 0 / 0;
/** Used to match leading and trailing whitespace. */

var reTrim = /^\s+|\s+$/g;
/** Used to detect bad signed hexadecimal string values. */

var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
/** Used to detect binary string values. */

var reIsBinary = /^0b[01]+$/i;
/** Used to detect octal string values. */

var reIsOctal = /^0o[0-7]+$/i;
/** Built-in method references without a dependency on `root`. */

var freeParseInt = parseInt;
/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */

function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }

  if (isSymbol(value)) {
    return NAN;
  }

  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? other + '' : other;
  }

  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }

  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
}

module.exports = toNumber;

/***/ }),
/* 160 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var createBaseFor = __webpack_require__(161);
/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */


var baseFor = createBaseFor();
module.exports = baseFor;

/***/ }),
/* 161 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */

function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}

module.exports = createBaseFor;

/***/ }),
/* 162 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assignMergeValue = __webpack_require__(69),
    cloneBuffer = __webpack_require__(163),
    cloneTypedArray = __webpack_require__(164),
    copyArray = __webpack_require__(166),
    initCloneObject = __webpack_require__(167),
    isArguments = __webpack_require__(44),
    isArray = __webpack_require__(15),
    isArrayLikeObject = __webpack_require__(169),
    isBuffer = __webpack_require__(45),
    isFunction = __webpack_require__(40),
    isObject = __webpack_require__(18),
    isPlainObject = __webpack_require__(170),
    isTypedArray = __webpack_require__(47),
    safeGet = __webpack_require__(72),
    toPlainObject = __webpack_require__(171);
/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }

  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;

    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;

      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }

  assignMergeValue(object, key, newValue);
}

module.exports = baseMergeDeep;

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {

var root = __webpack_require__(16);
/** Detect free variable `exports`. */


var freeExports =  true && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Built-in value references. */

var Buffer = moduleExports ? root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */

function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }

  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(46)(module)))

/***/ }),
/* 164 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var cloneArrayBuffer = __webpack_require__(165);
/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */


function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

module.exports = cloneTypedArray;

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Uint8Array = __webpack_require__(61);
/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */


function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

module.exports = cloneArrayBuffer;

/***/ }),
/* 166 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */

function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));

  while (++index < length) {
    array[index] = source[index];
  }

  return array;
}

module.exports = copyArray;

/***/ }),
/* 167 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseCreate = __webpack_require__(168),
    getPrototype = __webpack_require__(71),
    isPrototype = __webpack_require__(49);
/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */


function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}

module.exports = initCloneObject;

/***/ }),
/* 168 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(18);
/** Built-in value references. */


var objectCreate = Object.create;
/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */

var baseCreate = function () {
  function object() {}

  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }

    if (objectCreate) {
      return objectCreate(proto);
    }

    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();

module.exports = baseCreate;

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isArrayLike = __webpack_require__(25),
    isObjectLike = __webpack_require__(21);
/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

module.exports = isArrayLikeObject;

/***/ }),
/* 170 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseGetTag = __webpack_require__(23),
    getPrototype = __webpack_require__(71),
    isObjectLike = __webpack_require__(21);
/** `Object#toString` result references. */


var objectTag = '[object Object]';
/** Used for built-in method references. */

var funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to infer the `Object` constructor. */

var objectCtorString = funcToString.call(Object);
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */

function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }

  var proto = getPrototype(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

/***/ }),
/* 171 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var copyObject = __webpack_require__(172),
    keysIn = __webpack_require__(73);
/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */


function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

module.exports = toPlainObject;

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assignValue = __webpack_require__(173),
    baseAssignValue = __webpack_require__(54);
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */


function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }

    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }

  return object;
}

module.exports = copyObject;

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseAssignValue = __webpack_require__(54),
    eq = __webpack_require__(24);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */

function assignValue(object, key, value) {
  var objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}

module.exports = assignValue;

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(18),
    isPrototype = __webpack_require__(49),
    nativeKeysIn = __webpack_require__(175);
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }

  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }

  return result;
}

module.exports = baseKeysIn;

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */

function nativeKeysIn(object) {
  var result = [];

  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }

  return result;
}

module.exports = nativeKeysIn;

/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var identity = __webpack_require__(53),
    overRest = __webpack_require__(177),
    setToString = __webpack_require__(179);
/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */


function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

module.exports = baseRest;

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var apply = __webpack_require__(178);
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeMax = Math.max;
/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */

function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

module.exports = overRest;

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}

module.exports = apply;

/***/ }),
/* 179 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseSetToString = __webpack_require__(180),
    shortOut = __webpack_require__(182);
/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var setToString = shortOut(baseSetToString);
module.exports = setToString;

/***/ }),
/* 180 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var constant = __webpack_require__(181),
    defineProperty = __webpack_require__(70),
    identity = __webpack_require__(53);
/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
module.exports = baseSetToString;

/***/ }),
/* 181 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */

function constant(value) {
  return function () {
    return value;
  };
}

module.exports = constant;

/***/ }),
/* 182 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/** Used to detect hot functions by number of calls within a span of milliseconds. */

var HOT_COUNT = 800,
    HOT_SPAN = 16;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeNow = Date.now;
/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */

function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;

    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }

    return func.apply(undefined, arguments);
  };
}

module.exports = shortOut;

/***/ }),
/* 183 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var eq = __webpack_require__(24),
    isArrayLike = __webpack_require__(25),
    isIndex = __webpack_require__(34),
    isObject = __webpack_require__(18);
/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */


function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }

  var type = typeof index;

  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }

  return false;
}

module.exports = isIterateeCall;

/***/ }),
/* 184 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseIndexOf = __webpack_require__(185);
/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */


function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && baseIndexOf(array, value, 0) > -1;
}

module.exports = arrayIncludes;

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var baseFindIndex = __webpack_require__(67),
    baseIsNaN = __webpack_require__(186),
    strictIndexOf = __webpack_require__(187);
/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function baseIndexOf(array, value, fromIndex) {
  return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
}

module.exports = baseIndexOf;

/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */

function baseIsNaN(value) {
  return value !== value;
}

module.exports = baseIsNaN;

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */

function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }

  return -1;
}

module.exports = strictIndexOf;

/***/ }),
/* 188 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */

function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }

  return false;
}

module.exports = arrayIncludesWith;

/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Set = __webpack_require__(64),
    noop = __webpack_require__(190),
    setToArray = __webpack_require__(42);
/** Used as references for various `Number` constants. */


var INFINITY = 1 / 0;
/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */

var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function (values) {
  return new Set(values);
};
module.exports = createSet;

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */

function noop() {// No operation performed.
}

module.exports = noop;

/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, process) {

(function (global, undefined) {
  "use strict";

  if (global.setImmediate) {
    return;
  }

  var nextHandle = 1; // Spec says greater than zero

  var tasksByHandle = {};
  var currentlyRunningATask = false;
  var doc = global.document;
  var registerImmediate;

  function setImmediate(callback) {
    // Callback can either be a function or a string
    if (typeof callback !== "function") {
      callback = new Function("" + callback);
    } // Copy function arguments


    var args = new Array(arguments.length - 1);

    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i + 1];
    } // Store and register the task


    var task = {
      callback: callback,
      args: args
    };
    tasksByHandle[nextHandle] = task;
    registerImmediate(nextHandle);
    return nextHandle++;
  }

  function clearImmediate(handle) {
    delete tasksByHandle[handle];
  }

  function run(task) {
    var callback = task.callback;
    var args = task.args;

    switch (args.length) {
      case 0:
        callback();
        break;

      case 1:
        callback(args[0]);
        break;

      case 2:
        callback(args[0], args[1]);
        break;

      case 3:
        callback(args[0], args[1], args[2]);
        break;

      default:
        callback.apply(undefined, args);
        break;
    }
  }

  function runIfPresent(handle) {
    // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
    // So if we're currently running a task, we'll need to delay this invocation.
    if (currentlyRunningATask) {
      // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
      // "too much recursion" error.
      setTimeout(runIfPresent, 0, handle);
    } else {
      var task = tasksByHandle[handle];

      if (task) {
        currentlyRunningATask = true;

        try {
          run(task);
        } finally {
          clearImmediate(handle);
          currentlyRunningATask = false;
        }
      }
    }
  }

  function installNextTickImplementation() {
    registerImmediate = function registerImmediate(handle) {
      process.nextTick(function () {
        runIfPresent(handle);
      });
    };
  }

  function canUsePostMessage() {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can't be used for this purpose.
    if (global.postMessage && !global.importScripts) {
      var postMessageIsAsynchronous = true;
      var oldOnMessage = global.onmessage;

      global.onmessage = function () {
        postMessageIsAsynchronous = false;
      };

      global.postMessage("", "*");
      global.onmessage = oldOnMessage;
      return postMessageIsAsynchronous;
    }
  }

  function installPostMessageImplementation() {
    // Installs an event handler on `global` for the `message` event: see
    // * https://developer.mozilla.org/en/DOM/window.postMessage
    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
    var messagePrefix = "setImmediate$" + Math.random() + "$";

    var onGlobalMessage = function onGlobalMessage(event) {
      if (event.source === global && typeof event.data === "string" && event.data.indexOf(messagePrefix) === 0) {
        runIfPresent(+event.data.slice(messagePrefix.length));
      }
    };

    if (global.addEventListener) {
      global.addEventListener("message", onGlobalMessage, false);
    } else {
      global.attachEvent("onmessage", onGlobalMessage);
    }

    registerImmediate = function registerImmediate(handle) {
      global.postMessage(messagePrefix + handle, "*");
    };
  }

  function installMessageChannelImplementation() {
    var channel = new MessageChannel();

    channel.port1.onmessage = function (event) {
      var handle = event.data;
      runIfPresent(handle);
    };

    registerImmediate = function registerImmediate(handle) {
      channel.port2.postMessage(handle);
    };
  }

  function installReadyStateChangeImplementation() {
    var html = doc.documentElement;

    registerImmediate = function registerImmediate(handle) {
      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      var script = doc.createElement("script");

      script.onreadystatechange = function () {
        runIfPresent(handle);
        script.onreadystatechange = null;
        html.removeChild(script);
        script = null;
      };

      html.appendChild(script);
    };
  }

  function installSetTimeoutImplementation() {
    registerImmediate = function registerImmediate(handle) {
      setTimeout(runIfPresent, 0, handle);
    };
  } // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.


  var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
  attachTo = attachTo && attachTo.setTimeout ? attachTo : global; // Don't get fooled by e.g. browserify environments.

  if ({}.toString.call(global.process) === "[object process]") {
    // For Node.js before 0.9
    installNextTickImplementation();
  } else if (canUsePostMessage()) {
    // For non-IE10 modern browsers
    installPostMessageImplementation();
  } else if (global.MessageChannel) {
    // For web workers, where supported
    installMessageChannelImplementation();
  } else if (doc && "onreadystatechange" in doc.createElement("script")) {
    // For IE 6–8
    installReadyStateChangeImplementation();
  } else {
    // For older browsers
    installSetTimeoutImplementation();
  }

  attachTo.setImmediate = setImmediate;
  attachTo.clearImmediate = clearImmediate;
})(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(28), __webpack_require__(192)))

/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
 // shim for using process in browser

var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
  throw new Error('setTimeout has not been defined');
}

function defaultClearTimeout() {
  throw new Error('clearTimeout has not been defined');
}

(function () {
  try {
    if (typeof setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
    } else {
      cachedSetTimeout = defaultSetTimout;
    }
  } catch (e) {
    cachedSetTimeout = defaultSetTimout;
  }

  try {
    if (typeof clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
    } else {
      cachedClearTimeout = defaultClearTimeout;
    }
  } catch (e) {
    cachedClearTimeout = defaultClearTimeout;
  }
})();

function runTimeout(fun) {
  if (cachedSetTimeout === setTimeout) {
    //normal enviroments in sane situations
    return setTimeout(fun, 0);
  } // if setTimeout wasn't available but was latter defined


  if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
    cachedSetTimeout = setTimeout;
    return setTimeout(fun, 0);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedSetTimeout(fun, 0);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
      return cachedSetTimeout.call(null, fun, 0);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
      return cachedSetTimeout.call(this, fun, 0);
    }
  }
}

function runClearTimeout(marker) {
  if (cachedClearTimeout === clearTimeout) {
    //normal enviroments in sane situations
    return clearTimeout(marker);
  } // if clearTimeout wasn't available but was latter defined


  if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
    cachedClearTimeout = clearTimeout;
    return clearTimeout(marker);
  }

  try {
    // when when somebody has screwed with setTimeout but no I.E. maddness
    return cachedClearTimeout(marker);
  } catch (e) {
    try {
      // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
      return cachedClearTimeout.call(null, marker);
    } catch (e) {
      // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
      // Some versions of I.E. have different rules for clearTimeout vs setTimeout
      return cachedClearTimeout.call(this, marker);
    }
  }
}

var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
  if (!draining || !currentQueue) {
    return;
  }

  draining = false;

  if (currentQueue.length) {
    queue = currentQueue.concat(queue);
  } else {
    queueIndex = -1;
  }

  if (queue.length) {
    drainQueue();
  }
}

function drainQueue() {
  if (draining) {
    return;
  }

  var timeout = runTimeout(cleanUpNextTick);
  draining = true;
  var len = queue.length;

  while (len) {
    currentQueue = queue;
    queue = [];

    while (++queueIndex < len) {
      if (currentQueue) {
        currentQueue[queueIndex].run();
      }
    }

    queueIndex = -1;
    len = queue.length;
  }

  currentQueue = null;
  draining = false;
  runClearTimeout(timeout);
}

process.nextTick = function (fun) {
  var args = new Array(arguments.length - 1);

  if (arguments.length > 1) {
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
  }

  queue.push(new Item(fun, args));

  if (queue.length === 1 && !draining) {
    runTimeout(drainQueue);
  }
}; // v8 likes predictible objects


function Item(fun, array) {
  this.fun = fun;
  this.array = array;
}

Item.prototype.run = function () {
  this.fun.apply(null, this.array);
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) {
  return [];
};

process.binding = function (name) {
  throw new Error('process.binding is not supported');
};

process.cwd = function () {
  return '/';
};

process.chdir = function (dir) {
  throw new Error('process.chdir is not supported');
};

process.umask = function () {
  return 0;
};

/***/ }),
/* 193 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, "SNApplicationGroup", function() { return /* reexport */ application_group_SNApplicationGroup; });
__webpack_require__.d(__webpack_exports__, "DeinitSource", function() { return /* reexport */ DeinitSource; });
__webpack_require__.d(__webpack_exports__, "SNApplication", function() { return /* reexport */ application_SNApplication; });
__webpack_require__.d(__webpack_exports__, "SNProtocolService", function() { return /* reexport */ protocol_service_SNProtocolService; });
__webpack_require__.d(__webpack_exports__, "KeyMode", function() { return /* reexport */ KeyMode; });
__webpack_require__.d(__webpack_exports__, "SNProtocolOperator001", function() { return /* reexport */ operator_001_SNProtocolOperator001; });
__webpack_require__.d(__webpack_exports__, "SNProtocolOperator002", function() { return /* reexport */ operator_002_SNProtocolOperator002; });
__webpack_require__.d(__webpack_exports__, "SNProtocolOperator003", function() { return /* reexport */ operator_003_SNProtocolOperator003; });
__webpack_require__.d(__webpack_exports__, "SNProtocolOperator004", function() { return /* reexport */ operator_004_SNProtocolOperator004; });
__webpack_require__.d(__webpack_exports__, "SNRootKey", function() { return /* reexport */ root_key_SNRootKey; });
__webpack_require__.d(__webpack_exports__, "DeviceInterface", function() { return /* reexport */ device_interface_DeviceInterface; });
__webpack_require__.d(__webpack_exports__, "SNItem", function() { return /* reexport */ core_item["d" /* SNItem */]; });
__webpack_require__.d(__webpack_exports__, "ItemMutator", function() { return /* reexport */ core_item["b" /* ItemMutator */]; });
__webpack_require__.d(__webpack_exports__, "AppDataField", function() { return /* reexport */ core_item["a" /* AppDataField */]; });
__webpack_require__.d(__webpack_exports__, "SNItemsKey", function() { return /* reexport */ items_key_SNItemsKey; });
__webpack_require__.d(__webpack_exports__, "SNPredicate", function() { return /* reexport */ core_predicate["a" /* SNPredicate */]; });
__webpack_require__.d(__webpack_exports__, "SNNote", function() { return /* reexport */ note_SNNote; });
__webpack_require__.d(__webpack_exports__, "NoteMutator", function() { return /* reexport */ note_NoteMutator; });
__webpack_require__.d(__webpack_exports__, "SNTag", function() { return /* reexport */ tag_SNTag; });
__webpack_require__.d(__webpack_exports__, "TagMutator", function() { return /* reexport */ tag_TagMutator; });
__webpack_require__.d(__webpack_exports__, "SNSmartTag", function() { return /* reexport */ smartTag_SNSmartTag; });
__webpack_require__.d(__webpack_exports__, "SNActionsExtension", function() { return /* reexport */ extension_SNActionsExtension; });
__webpack_require__.d(__webpack_exports__, "Action", function() { return /* reexport */ action_Action; });
__webpack_require__.d(__webpack_exports__, "SNTheme", function() { return /* reexport */ theme_SNTheme; });
__webpack_require__.d(__webpack_exports__, "ThemeMutator", function() { return /* reexport */ theme_ThemeMutator; });
__webpack_require__.d(__webpack_exports__, "SNComponent", function() { return /* reexport */ component_SNComponent; });
__webpack_require__.d(__webpack_exports__, "ComponentAction", function() { return /* reexport */ ComponentAction; });
__webpack_require__.d(__webpack_exports__, "ComponentMutator", function() { return /* reexport */ component_ComponentMutator; });
__webpack_require__.d(__webpack_exports__, "SNEditor", function() { return /* reexport */ editor_SNEditor; });
__webpack_require__.d(__webpack_exports__, "SNUserPrefs", function() { return /* reexport */ userPrefs_SNUserPrefs; });
__webpack_require__.d(__webpack_exports__, "UserPrefsMutator", function() { return /* reexport */ userPrefs_UserPrefsMutator; });
__webpack_require__.d(__webpack_exports__, "WebPrefKey", function() { return /* reexport */ WebPrefKey; });
__webpack_require__.d(__webpack_exports__, "MobilePrefKey", function() { return /* reexport */ MobilePrefKey; });
__webpack_require__.d(__webpack_exports__, "MutationType", function() { return /* reexport */ core_item["c" /* MutationType */]; });
__webpack_require__.d(__webpack_exports__, "ComponentArea", function() { return /* reexport */ ComponentArea; });
__webpack_require__.d(__webpack_exports__, "LiveItem", function() { return /* reexport */ LiveItem; });
__webpack_require__.d(__webpack_exports__, "SNComponentManager", function() { return /* reexport */ component_manager_SNComponentManager; });
__webpack_require__.d(__webpack_exports__, "SessionHistoryMap", function() { return /* reexport */ session_history_map_SessionHistoryMap; });
__webpack_require__.d(__webpack_exports__, "ItemSessionHistory", function() { return /* reexport */ item_session_history_ItemSessionHistory; });
__webpack_require__.d(__webpack_exports__, "ItemHistoryEntry", function() { return /* reexport */ item_history_entry_ItemHistoryEntry; });
__webpack_require__.d(__webpack_exports__, "SNPrivileges", function() { return /* reexport */ privileges_SNPrivileges; });
__webpack_require__.d(__webpack_exports__, "ProtectedAction", function() { return /* reexport */ ProtectedAction; });
__webpack_require__.d(__webpack_exports__, "PrivilegeCredential", function() { return /* reexport */ PrivilegeCredential; });
__webpack_require__.d(__webpack_exports__, "PayloadManager", function() { return /* reexport */ model_manager_PayloadManager; });
__webpack_require__.d(__webpack_exports__, "ItemManager", function() { return /* reexport */ item_manager_ItemManager; });
__webpack_require__.d(__webpack_exports__, "SNHttpService", function() { return /* reexport */ http_service_SNHttpService; });
__webpack_require__.d(__webpack_exports__, "ChallengeService", function() { return /* reexport */ challenge_service_ChallengeService; });
__webpack_require__.d(__webpack_exports__, "PureService", function() { return /* reexport */ pure_service["a" /* PureService */]; });
__webpack_require__.d(__webpack_exports__, "ApplicationService", function() { return /* reexport */ application_service["a" /* ApplicationService */]; });
__webpack_require__.d(__webpack_exports__, "SNStorageService", function() { return /* reexport */ storage_service_SNStorageService; });
__webpack_require__.d(__webpack_exports__, "StoragePersistencePolicies", function() { return /* reexport */ StoragePersistencePolicies; });
__webpack_require__.d(__webpack_exports__, "StorageEncryptionPolicies", function() { return /* reexport */ StorageEncryptionPolicies; });
__webpack_require__.d(__webpack_exports__, "StorageValueModes", function() { return /* reexport */ StorageValueModes; });
__webpack_require__.d(__webpack_exports__, "ValueModesKeys", function() { return /* reexport */ ValueModesKeys; });
__webpack_require__.d(__webpack_exports__, "Challenge", function() { return /* reexport */ Challenge; });
__webpack_require__.d(__webpack_exports__, "ChallengeReason", function() { return /* reexport */ ChallengeReason; });
__webpack_require__.d(__webpack_exports__, "ChallengeResponse", function() { return /* reexport */ ChallengeResponse; });
__webpack_require__.d(__webpack_exports__, "ChallengeType", function() { return /* reexport */ ChallengeType; });
__webpack_require__.d(__webpack_exports__, "challengeTypeToString", function() { return /* reexport */ challengeTypeToString; });
__webpack_require__.d(__webpack_exports__, "ChallengeValue", function() { return /* reexport */ ChallengeValue; });
__webpack_require__.d(__webpack_exports__, "SNSyncService", function() { return /* reexport */ sync_service_SNSyncService; });
__webpack_require__.d(__webpack_exports__, "SyncSources", function() { return /* reexport */ SyncSources; });
__webpack_require__.d(__webpack_exports__, "SyncModes", function() { return /* reexport */ SyncModes; });
__webpack_require__.d(__webpack_exports__, "SyncQueueStrategy", function() { return /* reexport */ SyncQueueStrategy; });
__webpack_require__.d(__webpack_exports__, "SortPayloadsByRecentAndContentPriority", function() { return /* reexport */ SortPayloadsByRecentAndContentPriority; });
__webpack_require__.d(__webpack_exports__, "SNSessionManager", function() { return /* reexport */ session_manager_SNSessionManager; });
__webpack_require__.d(__webpack_exports__, "SNMigrationService", function() { return /* reexport */ migration_service_SNMigrationService; });
__webpack_require__.d(__webpack_exports__, "ButtonType", function() { return /* reexport */ ButtonType; });
__webpack_require__.d(__webpack_exports__, "SNHistoryManager", function() { return /* reexport */ history_manager_SNHistoryManager; });
__webpack_require__.d(__webpack_exports__, "SNPrivilegesService", function() { return /* reexport */ privileges_service_SNPrivilegesService; });
__webpack_require__.d(__webpack_exports__, "SNSingletonManager", function() { return /* reexport */ singleton_manager_SNSingletonManager; });
__webpack_require__.d(__webpack_exports__, "SNApiService", function() { return /* reexport */ api_service_SNApiService; });
__webpack_require__.d(__webpack_exports__, "Copy", function() { return /* reexport */ utils["a" /* Copy */]; });
__webpack_require__.d(__webpack_exports__, "findInArray", function() { return /* reexport */ utils["l" /* findInArray */]; });
__webpack_require__.d(__webpack_exports__, "isNullOrUndefined", function() { return /* reexport */ utils["p" /* isNullOrUndefined */]; });
__webpack_require__.d(__webpack_exports__, "deepMerge", function() { return /* reexport */ utils["h" /* deepMerge */]; });
__webpack_require__.d(__webpack_exports__, "extendArray", function() { return /* reexport */ utils["j" /* extendArray */]; });
__webpack_require__.d(__webpack_exports__, "removeFromIndex", function() { return /* reexport */ utils["C" /* removeFromIndex */]; });
__webpack_require__.d(__webpack_exports__, "subtractFromArray", function() { return /* reexport */ utils["G" /* subtractFromArray */]; });
__webpack_require__.d(__webpack_exports__, "arrayByDifference", function() { return /* reexport */ utils["c" /* arrayByDifference */]; });
__webpack_require__.d(__webpack_exports__, "uniqCombineObjArrays", function() { return /* reexport */ utils["J" /* uniqCombineObjArrays */]; });
__webpack_require__.d(__webpack_exports__, "greaterOfTwoDates", function() { return /* reexport */ utils["n" /* greaterOfTwoDates */]; });
__webpack_require__.d(__webpack_exports__, "getGlobalScope", function() { return /* reexport */ utils["m" /* getGlobalScope */]; });
__webpack_require__.d(__webpack_exports__, "removeFromArray", function() { return /* reexport */ utils["B" /* removeFromArray */]; });
__webpack_require__.d(__webpack_exports__, "addIfUnique", function() { return /* reexport */ utils["b" /* addIfUnique */]; });
__webpack_require__.d(__webpack_exports__, "dictToArray", function() { return /* reexport */ utils["i" /* dictToArray */]; });
__webpack_require__.d(__webpack_exports__, "truncateHexString", function() { return /* reexport */ utils["I" /* truncateHexString */]; });
__webpack_require__.d(__webpack_exports__, "jsonParseEmbeddedKeys", function() { return /* reexport */ utils["v" /* jsonParseEmbeddedKeys */]; });
__webpack_require__.d(__webpack_exports__, "topLevelCompare", function() { return /* reexport */ utils["H" /* topLevelCompare */]; });
__webpack_require__.d(__webpack_exports__, "Uuid", function() { return /* reexport */ uuid_Uuid; });
__webpack_require__.d(__webpack_exports__, "EncryptionIntent", function() { return /* reexport */ intents["a" /* EncryptionIntent */]; });
__webpack_require__.d(__webpack_exports__, "isLocalStorageIntent", function() { return /* reexport */ intents["e" /* isLocalStorageIntent */]; });
__webpack_require__.d(__webpack_exports__, "isFileIntent", function() { return /* reexport */ intents["d" /* isFileIntent */]; });
__webpack_require__.d(__webpack_exports__, "isDecryptedIntent", function() { return /* reexport */ intents["c" /* isDecryptedIntent */]; });
__webpack_require__.d(__webpack_exports__, "intentRequiresEncryption", function() { return /* reexport */ intents["b" /* intentRequiresEncryption */]; });
__webpack_require__.d(__webpack_exports__, "ContentType", function() { return /* reexport */ content_types["a" /* ContentType */]; });
__webpack_require__.d(__webpack_exports__, "CreateItemFromPayload", function() { return /* reexport */ CreateItemFromPayload; });
__webpack_require__.d(__webpack_exports__, "Uuids", function() { return /* reexport */ functions["b" /* Uuids */]; });
__webpack_require__.d(__webpack_exports__, "FillItemContent", function() { return /* reexport */ functions["a" /* FillItemContent */]; });
__webpack_require__.d(__webpack_exports__, "ApplicationEvent", function() { return /* reexport */ events["a" /* ApplicationEvent */]; });
__webpack_require__.d(__webpack_exports__, "Environment", function() { return /* reexport */ Environment; });
__webpack_require__.d(__webpack_exports__, "Platform", function() { return /* reexport */ Platform; });
__webpack_require__.d(__webpack_exports__, "isEnvironmentWebOrDesktop", function() { return /* reexport */ isEnvironmentWebOrDesktop; });
__webpack_require__.d(__webpack_exports__, "isEnvironmentMobile", function() { return /* reexport */ isEnvironmentMobile; });
__webpack_require__.d(__webpack_exports__, "platformFromString", function() { return /* reexport */ platformFromString; });
__webpack_require__.d(__webpack_exports__, "SyncEvent", function() { return /* reexport */ sync_events["a" /* SyncEvent */]; });
__webpack_require__.d(__webpack_exports__, "MutableCollection", function() { return /* reexport */ collection_MutableCollection; });
__webpack_require__.d(__webpack_exports__, "ImmutablePayloadCollection", function() { return /* reexport */ payload_collection_ImmutablePayloadCollection; });
__webpack_require__.d(__webpack_exports__, "ItemCollection", function() { return /* reexport */ item_collection_ItemCollection; });
__webpack_require__.d(__webpack_exports__, "CollectionSort", function() { return /* reexport */ CollectionSort; });
__webpack_require__.d(__webpack_exports__, "CreateMaxPayloadFromAnyObject", function() { return /* reexport */ generator["e" /* CreateMaxPayloadFromAnyObject */]; });
__webpack_require__.d(__webpack_exports__, "CreateSourcedPayloadFromObject", function() { return /* reexport */ generator["f" /* CreateSourcedPayloadFromObject */]; });
__webpack_require__.d(__webpack_exports__, "CreateIntentPayloadFromObject", function() { return /* reexport */ generator["d" /* CreateIntentPayloadFromObject */]; });
__webpack_require__.d(__webpack_exports__, "CreateEncryptionParameters", function() { return /* reexport */ generator["c" /* CreateEncryptionParameters */]; });
__webpack_require__.d(__webpack_exports__, "PayloadByMerging", function() { return /* reexport */ generator["g" /* PayloadByMerging */]; });
__webpack_require__.d(__webpack_exports__, "CopyPayload", function() { return /* reexport */ generator["b" /* CopyPayload */]; });
__webpack_require__.d(__webpack_exports__, "PayloadSource", function() { return /* reexport */ sources["a" /* PayloadSource */]; });
__webpack_require__.d(__webpack_exports__, "isPayloadSourceRetrieved", function() { return /* reexport */ sources["b" /* isPayloadSourceRetrieved */]; });
__webpack_require__.d(__webpack_exports__, "ProtocolVersion", function() { return /* reexport */ versions["a" /* ProtocolVersion */]; });
__webpack_require__.d(__webpack_exports__, "PayloadFormat", function() { return /* reexport */ formats["a" /* PayloadFormat */]; });
__webpack_require__.d(__webpack_exports__, "PurePayload", function() { return /* reexport */ pure_payload["a" /* PurePayload */]; });
__webpack_require__.d(__webpack_exports__, "PayloadField", function() { return /* reexport */ fields["a" /* PayloadField */]; });
__webpack_require__.d(__webpack_exports__, "StorageKey", function() { return /* reexport */ StorageKey; });
__webpack_require__.d(__webpack_exports__, "RawStorageKey", function() { return /* reexport */ RawStorageKey; });
__webpack_require__.d(__webpack_exports__, "BaseMigration", function() { return /* reexport */ _2020_01_01_base_BaseMigration; });
__webpack_require__.d(__webpack_exports__, "PrivilegeSessionLength", function() { return /* reexport */ PrivilegeSessionLength; });

// NAMESPACE OBJECT: ./lib/migrations/index.ts
var migrations_namespaceObject = {};
__webpack_require__.r(migrations_namespaceObject);
__webpack_require__.d(migrations_namespaceObject, "Migration20200115", function() { return _2020_01_15_Migration20200115; });

// CONCATENATED MODULE: ./lib/storage_keys.ts
/**
 * Unmanaged keys stored in root storage
 */
var RawStorageKey;

(function (RawStorageKey) {
  RawStorageKey["StorageObject"] = "storage";
  /** Raw storage keys exist outside of StorageManager domain */

  RawStorageKey["LastMigrationTimestamp"] = "last_migration_timestamp";
  RawStorageKey["DescriptorRecord"] = "descriptors";
})(RawStorageKey || (RawStorageKey = {}));

;
/**
 * Keys used for retrieving and saving simple key/value pairs.
 * These keys are managed and are embedded inside RawStorageKey.StorageObject
 */

var StorageKey;

(function (StorageKey) {
  StorageKey["RootKeyParams"] = "ROOT_KEY_PARAMS";
  StorageKey["WrappedRootKey"] = "WRAPPED_ROOT_KEY";
  StorageKey["RootKeyWrapperKeyParams"] = "ROOT_KEY_WRAPPER_KEY_PARAMS";
  StorageKey["Session"] = "session";
  StorageKey["User"] = "user";
  StorageKey["ServerHost"] = "server";
  StorageKey["LegacyUuid"] = "uuid";
  StorageKey["LastSyncToken"] = "syncToken";
  StorageKey["PaginationToken"] = "cursorToken";
  StorageKey["BiometricsState"] = "biometrics_state";
  StorageKey["MobilePasscodeTiming"] = "passcode_timing";
  StorageKey["MobileBiometricsTiming"] = "biometrics_timing";
  StorageKey["PrivilegesExpirey"] = "SessionExpiresAtKey";
  StorageKey["PrivilegesSessionLength"] = "SessionLengthKey";
  StorageKey["SessionHistoryPersistable"] = "sessionHistory_persist";
  StorageKey["SessionHistoryRevisions"] = "sessionHistory_revisions";
  StorageKey["SessionHistoryOptimize"] = "sessionHistory_autoOptimize";
})(StorageKey || (StorageKey = {}));

;
function namespacedKey(namespace, key) {
  if (namespace) {
    return "".concat(namespace, "-").concat(key);
  } else {
    return key;
  }
}
// EXTERNAL MODULE: ./lib/utils.ts
var utils = __webpack_require__(0);

// CONCATENATED MODULE: ./lib/types.ts
var DeinitSource;

(function (DeinitSource) {
  DeinitSource[DeinitSource["SignOut"] = 1] = "SignOut";
  DeinitSource[DeinitSource["Lock"] = 2] = "Lock";
  DeinitSource[DeinitSource["AppGroupUnload"] = 3] = "AppGroupUnload";
})(DeinitSource || (DeinitSource = {}));
// EXTERNAL MODULE: ./lib/services/pure_service.ts
var pure_service = __webpack_require__(11);

// CONCATENATED MODULE: ./lib/uuid.ts

/**
 * An abstract class with no instance methods. Used globally to generate uuids by any
 * consumer. Application must call SetGenerators before use.
 */

class uuid_Uuid {
  /**
   * Dynamically feed both a syncronous and asyncronous implementation of a UUID generator function.
   * Feeding it this way allows platforms to implement their own uuid generation schemes, without
   * this class having to import any global functions.
   * @param {function} asyncImpl - An asyncronous function that returns a UUID.
   * @param {function} syncImpl - A syncronous function that returns a UUID.
   */
  static SetGenerators(asyncImpl, syncImpl) {
    this.syncUuidFunc = syncImpl;
    this.asyncUuidFunc = asyncImpl;
  }
  /**
   * Whether there is a syncronous UUID generation function available.
   */


  static canGenSync() {
    return !Object(utils["p" /* isNullOrUndefined */])(this.syncUuidFunc);
  }
  /**
   * Generates a UUID string asyncronously.
   */


  static async GenerateUuid() {
    if (this.syncUuidFunc) {
      return this.syncUuidFunc();
    } else {
      return this.asyncUuidFunc();
    }
  }
  /**
   * Generates a UUID string syncronously.
   */


  static GenerateUuidSynchronously() {
    return this.syncUuidFunc();
  }

}
// CONCATENATED MODULE: ./lib/application_group.ts





class application_group_SNApplicationGroup extends pure_service["a" /* PureService */] {
  constructor(deviceInterface) {
    super();
    this.deviceInterface = deviceInterface;
    this.changeObservers = [];
    this.applications = [];
    /** @callback */

    this.onApplicationDeinit = (application, source) => {
      /** If we are initiaitng this unloading via function below,
       * we don't want any side-effects */
      const sideffects = source !== DeinitSource.AppGroupUnload;

      if (this.primaryApplication === application) {
        this.primaryApplication = undefined;
      }

      Object(utils["B" /* removeFromArray */])(this.applications, application);

      if (source === DeinitSource.SignOut) {
        this.removeDescriptor(this.descriptorForApplication(application));

        if (sideffects) {
          /** If there are no more descriptors (all accounts have been signed out),
             * create a new blank slate app */
          const descriptors = this.getDescriptors();

          if (descriptors.length === 0) {
            return this.addNewApplication();
          } else {
            return this.loadApplicationForDescriptor(descriptors[0]);
          }
        }
      } else if (source === DeinitSource.Lock && sideffects) {
        /** Recreate the same application from scratch */
        const descriptor = this.descriptorForApplication(application);
        return this.loadApplicationForDescriptor(descriptor);
      }
    };
  }

  deinit() {
    super.deinit();
    this.deviceInterface.deinit();
    this.deviceInterface = undefined;
  }

  async initialize(callback) {
    this.callback = callback;
    this.descriptorRecord = await this.deviceInterface.getJsonParsedRawStorageValue(RawStorageKey.DescriptorRecord);

    if (!this.descriptorRecord) {
      await this.createDescriptorRecord();
    }

    const primaryDescriptor = this.findPrimaryDescriptor();

    if (!primaryDescriptor) {
      throw Error('No primary application descriptor found. Ensure migrations have been run.');
    }

    const application = this.buildApplication(primaryDescriptor);
    this.applications.push(application);
    this.setPrimaryApplication(application, false);
  }

  async createDescriptorRecord() {
    /** The identifier 'standardnotes' is used because this was the
     * database name of Standard Notes web/desktop */
    const identifier = 'standardnotes';
    const descriptorRecord = {
      [identifier]: {
        identifier: identifier,
        label: 'Main Application',
        primary: true
      }
    };
    this.deviceInterface.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(descriptorRecord));
    this.descriptorRecord = descriptorRecord;
    this.persistDescriptors();
  }

  getApplications() {
    return this.applications;
  }

  getDescriptors() {
    return Object.values(this.descriptorRecord);
  }

  findPrimaryDescriptor() {
    for (const descriptor of this.getDescriptors()) {
      if (descriptor.primary) {
        return descriptor;
      }
    }
  }
  /**
   * Notifies observer when the primary application has changed.
   * Any application which is no longer active is destroyed, and
   * must be removed from the interface.
   */


  addApplicationChangeObserver(callback) {
    this.changeObservers.push(callback);

    if (this.primaryApplication) {
      callback();
    }

    return () => {
      Object(utils["B" /* removeFromArray */])(this.changeObservers, callback);
    };
  }

  notifyObserversOfAppChange() {
    for (const observer of this.changeObservers) {
      observer();
    }
  }

  async setPrimaryApplication(application) {
    let persist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (this.primaryApplication === application) {
      return;
    }

    if (!this.applications.includes(application)) {
      throw Error('Application must be inserted before attempting to switch to it');
    }

    if (this.primaryApplication) {
      this.primaryApplication.deinit(DeinitSource.AppGroupUnload);
    }

    this.primaryApplication = application;
    const descriptor = this.descriptorForApplication(application);
    this.setDescriptorAsPrimary(descriptor);
    this.notifyObserversOfAppChange();

    if (persist) {
      await this.persistDescriptors();
    }
  }

  setDescriptorAsPrimary(primaryDescriptor) {
    for (const descriptor of this.getDescriptors()) {
      descriptor.primary = descriptor === primaryDescriptor;
    }
  }

  async persistDescriptors() {
    this.deviceInterface.setRawStorageValue(RawStorageKey.DescriptorRecord, JSON.stringify(this.descriptorRecord));
  }

  async renameDescriptor(descriptor, label) {
    descriptor.label = label;
    await this.persistDescriptors();
  }

  removeDescriptor(descriptor) {
    delete this.descriptorRecord[descriptor.identifier];
    return this.persistDescriptors();
  }

  descriptorForApplication(application) {
    return this.descriptorRecord[application.identifier];
  }

  async addNewApplication(label) {
    const identifier = await uuid_Uuid.GenerateUuid();
    const index = this.getDescriptors().length + 1;
    const descriptor = {
      identifier: identifier,
      label: label || "Application ".concat(index),
      primary: false
    };
    const application = this.buildApplication(descriptor);
    this.applications.push(application);
    this.descriptorRecord[identifier] = descriptor;
    await this.setPrimaryApplication(application);
    await this.persistDescriptors();
  }

  applicationForDescriptor(descriptor) {
    return this.applications.find(app => app.identifier === descriptor.identifier);
  }

  async loadApplicationForDescriptor(descriptor) {
    let application = this.applicationForDescriptor(descriptor);

    if (!application) {
      application = this.buildApplication(descriptor);
      this.applications.push(application);
    }

    await this.setPrimaryApplication(application);
  }

  buildApplication(descriptor) {
    const application = this.callback.applicationCreator(descriptor, this.deviceInterface);
    application.setOnDeinit(this.onApplicationDeinit);
    return application;
  }

}
// EXTERNAL MODULE: ./lib/models/functions.ts
var functions = __webpack_require__(10);

// CONCATENATED MODULE: ./lib/stages.ts
var ApplicationStage;

(function (ApplicationStage) {
  ApplicationStage[ApplicationStage["PreparingForLaunch_0"] = 0] = "PreparingForLaunch_0";
  ApplicationStage[ApplicationStage["ReadyForLaunch_05"] = 0.5] = "ReadyForLaunch_05";
  ApplicationStage[ApplicationStage["StorageDecrypted_09"] = 0.9] = "StorageDecrypted_09";
  ApplicationStage[ApplicationStage["Launched_10"] = 1] = "Launched_10";
  ApplicationStage[ApplicationStage["LoadingDatabase_11"] = 1.1] = "LoadingDatabase_11";
  ApplicationStage[ApplicationStage["LoadedDatabase_12"] = 1.2] = "LoadedDatabase_12";
  ApplicationStage[ApplicationStage["FullSyncCompleted_13"] = 1.3] = "FullSyncCompleted_13";
  ApplicationStage[ApplicationStage["SignedIn_30"] = 3] = "SignedIn_30";
})(ApplicationStage || (ApplicationStage = {}));

;
// EXTERNAL MODULE: ./lib/events.ts
var events = __webpack_require__(12);

// EXTERNAL MODULE: ./lib/models/core/item.ts
var core_item = __webpack_require__(5);

// CONCATENATED MODULE: ./lib/challenges.ts
var ChallengeType;

(function (ChallengeType) {
  ChallengeType[ChallengeType["LocalPasscode"] = 1] = "LocalPasscode";
  ChallengeType[ChallengeType["AccountPassword"] = 2] = "AccountPassword";
  ChallengeType[ChallengeType["Biometric"] = 3] = "Biometric";
})(ChallengeType || (ChallengeType = {}));

;
/** The source of the challenge */

var ChallengeReason;

(function (ChallengeReason) {
  ChallengeReason[ChallengeReason["ApplicationUnlock"] = 1] = "ApplicationUnlock";
  ChallengeReason[ChallengeReason["ResaveRootKey"] = 2] = "ResaveRootKey";
  ChallengeReason[ChallengeReason["ProtocolUpgrade"] = 3] = "ProtocolUpgrade";
  ChallengeReason[ChallengeReason["Migration"] = 4] = "Migration";
})(ChallengeReason || (ChallengeReason = {}));

;
/**
 * A challenge is a stateless description of what the client needs to provide
 * in order to proceed.
 */

class Challenge {
  constructor(types, reason) {
    this.types = types;
    this.reason = reason;
    this.id = new Date().getTime();
    Object.freeze(this);
  }

}
class ChallengeValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
    Object.freeze(this);
  }

}
class ChallengeResponse {
  constructor(challenge, values, artifacts) {
    this.challenge = challenge;
    this.values = values;
    this.artifacts = artifacts;
    Object.freeze(this);
  }

  getValueForType(type) {
    return this.values.find(value => value.type === type);
  }

}
/**
 * @returns The UI-friendly title for this challenge
 */

function challengeTypeToString(type) {
  const mapping = {
    [ChallengeType.LocalPasscode]: 'application passcode',
    [ChallengeType.AccountPassword]: 'account password',
    [ChallengeType.Biometric]: 'biometrics'
  };
  return mapping[type];
}
// EXTERNAL MODULE: ./lib/models/content_types.ts
var content_types = __webpack_require__(3);

// EXTERNAL MODULE: ./lib/protocol/payloads/generator.ts
var generator = __webpack_require__(1);

// EXTERNAL MODULE: ./lib/protocol/payloads/sources.ts
var sources = __webpack_require__(2);

// EXTERNAL MODULE: ./lib/models/core/predicate.ts
var core_predicate = __webpack_require__(14);

// CONCATENATED MODULE: ./lib/models/app/userPrefs.ts


var WebPrefKey;

(function (WebPrefKey) {
  WebPrefKey["TagsPanelWidth"] = "tagsPanelWidth";
  WebPrefKey["NotesPanelWidth"] = "notesPanelWidth";
  WebPrefKey["EditorWidth"] = "editorWidth";
  WebPrefKey["EditorLeft"] = "editorLeft";
  WebPrefKey["EditorMonospaceEnabled"] = "monospaceFont";
  WebPrefKey["EditorSpellcheck"] = "spellcheck";
  WebPrefKey["EditorResizersEnabled"] = "marginResizersEnabled";
  WebPrefKey["SortNotesBy"] = "sortBy";
  WebPrefKey["SortNotesReverse"] = "sortReverse";
  WebPrefKey["NotesShowArchived"] = "showArchived";
  WebPrefKey["NotesHidePinned"] = "hidePinned";
  WebPrefKey["NotesHideNotePreview"] = "hideNotePreview";
  WebPrefKey["NotesHideDate"] = "hideDate";
})(WebPrefKey || (WebPrefKey = {}));

;
var MobilePrefKey;

(function (MobilePrefKey) {
  MobilePrefKey["SortNotesBy"] = "mobileSortBy";
  MobilePrefKey["SortNotesReverse"] = "mobileSortReverse";
  MobilePrefKey["NotesHideTags"] = "mobileHideTags";
  MobilePrefKey["NotesHideNotePreview"] = "mobileHideNotePreview";
  MobilePrefKey["NotesHideDate"] = "mobileHideDate";
  MobilePrefKey["DarkTheme"] = "mobileDarkTheme";
  MobilePrefKey["LightTgeme"] = "mobileLightTheme";
  MobilePrefKey["DoNotWarnUnsupportedEditors"] = "mobileDoNotShowAgainUnsupportedEditors";
})(MobilePrefKey || (MobilePrefKey = {}));

class userPrefs_SNUserPrefs extends core_item["d" /* SNItem */] {
  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new core_predicate["a" /* SNPredicate */]('content_type', '=', this.content_type);
  }

  getPref(key) {
    return this.getAppDomainValue(key);
  }

}
class userPrefs_UserPrefsMutator extends core_item["b" /* ItemMutator */] {
  setWebPref(key, value) {
    this.setAppDataItem(key, value);
  }

  setMobilePref(key, value) {
    this.setAppDataItem(key, value);
  }

}
// CONCATENATED MODULE: ./lib/models/app/privileges.ts



var ProtectedAction;

(function (ProtectedAction) {
  ProtectedAction["ManageExtensions"] = "ActionManageExtensions";
  ProtectedAction["ManageBackups"] = "ActionManageBackups";
  ProtectedAction["ViewProtectedNotes"] = "ActionViewProtectedNotes";
  ProtectedAction["ManagePrivileges"] = "ActionManagePrivileges";
  ProtectedAction["ManagePasscode"] = "ActionManagePasscode";
  ProtectedAction["DeleteNote"] = "ActionDeleteNote";
})(ProtectedAction || (ProtectedAction = {}));

;
var PrivilegeCredential;

(function (PrivilegeCredential) {
  PrivilegeCredential["AccountPassword"] = "CredentialAccountPassword";
  PrivilegeCredential["LocalPasscode"] = "CredentialLocalPasscode";
})(PrivilegeCredential || (PrivilegeCredential = {}));

;
/**
 * Privileges are a singleton object that store the preferences a user
 * may have configured for protecting certain actions.
 */

class privileges_SNPrivileges extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    this.privilegeMap = {};
    this.privilegeMap = payload.safeContent.desktopPrivileges || {};
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new core_predicate["a" /* SNPredicate */]('content_type', '=', this.content_type);
  }

  getCredentialsForAction(action) {
    return this.privilegeMap[action] || [];
  }

  isCredentialRequiredForAction(action, credential) {
    const credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }

}
class privileges_PrivilegeMutator extends core_item["b" /* ItemMutator */] {
  constructor(item, source) {
    super(item, source);
    this.privilegeMap = {};
    this.privileges = item;
    this.privilegeMap = Object(utils["a" /* Copy */])(this.payload.safeContent.desktopPrivileges || {});
  }

  getResult() {
    if (this.content) {
      this.content.desktopPrivileges = this.privilegeMap;
    }

    return super.getResult();
  }

  setCredentialsForAction(action, credentials) {
    this.privilegeMap[action] = credentials;
  }

  toggleCredentialForAction(action, credential) {
    if (this.privileges.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action, credential) {
    Object(utils["B" /* removeFromArray */])(this.privilegeMap[action], credential);
  }

  addCredentialForAction(action, credential) {
    const credentials = this.privileges.getCredentialsForAction(action).slice();
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

}
// EXTERNAL MODULE: ./lib/protocol/payloads/deltas/strategies.ts
var strategies = __webpack_require__(13);

// CONCATENATED MODULE: ./lib/models/app/component.ts





var ComponentArea;

(function (ComponentArea) {
  ComponentArea["Editor"] = "editor-editor";
  ComponentArea["Themes"] = "themes";
  ComponentArea["TagsList"] = "tags-list";
  ComponentArea["EditorStack"] = "editor-stack";
  ComponentArea["NoteTags"] = "note-tags";
  ComponentArea["Rooms"] = "rooms";
  ComponentArea["Modal"] = "modal";
  ComponentArea["Any"] = "*";
})(ComponentArea || (ComponentArea = {}));

;
var ComponentAction;

(function (ComponentAction) {
  ComponentAction["SetSize"] = "set-size";
  ComponentAction["StreamItems"] = "stream-items";
  ComponentAction["StreamContextItem"] = "stream-context-item";
  ComponentAction["SaveItems"] = "save-items";
  ComponentAction["SelectItem"] = "select-item";
  ComponentAction["AssociateItem"] = "associate-item";
  ComponentAction["DeassociateItem"] = "deassociate-item";
  ComponentAction["ClearSelection"] = "clear-selection";
  ComponentAction["CreateItem"] = "create-item";
  ComponentAction["CreateItems"] = "create-items";
  ComponentAction["DeleteItems"] = "delete-items";
  ComponentAction["SetComponentData"] = "set-component-data";
  ComponentAction["InstallLocalComponent"] = "install-local-component";
  ComponentAction["ToggleActivateComponent"] = "toggle-activate-component";
  ComponentAction["RequestPermissions"] = "request-permissions";
  ComponentAction["PresentConflictResolution"] = "present-conflict-resolution";
  ComponentAction["DuplicateItem"] = "duplicate-item";
  ComponentAction["ComponentRegistered"] = "component-registered";
  ComponentAction["ActivateThemes"] = "themes";
  ComponentAction["Reply"] = "reply";
  ComponentAction["SaveSuccess"] = "save-success";
  ComponentAction["SaveError"] = "save-error";
})(ComponentAction || (ComponentAction = {}));

;
/**
 * Components are mostly iframe based extensions that communicate with the SN parent
 * via the postMessage API. However, a theme can also be a component, which is activated
 * only by its url.
 */

class component_SNComponent extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    this.permissions = [];
    /** Custom data that a component can store in itself */

    this.componentData = this.payload.safeContent.componentData || {};
    this.legacy_url = this.payload.safeContent.legacy_url;
    this.hosted_url = this.payload.safeContent.hosted_url || this.payload.safeContent.url;
    this.local_url = this.payload.safeContent.local_url;
    this.valid_until = new Date(this.payload.safeContent.valid_until);
    this.offlineOnly = this.payload.safeContent.offlineOnly;
    this.name = this.payload.safeContent.name;
    this.area = this.payload.safeContent.area;
    this.package_info = this.payload.safeContent.package_info;
    this.permissions = this.payload.safeContent.permissions || [];
    this.active = this.payload.safeContent.active;
    this.autoupdateDisabled = this.payload.safeContent.autoupdateDisabled;
    this.disassociatedItemIds = this.payload.safeContent.disassociatedItemIds || [];
    this.associatedItemIds = this.payload.safeContent.associatedItemIds || [];
    this.isMobileDefault = this.payload.safeContent.isMobileDefault;
    /**
    * @legacy
    * We don't want to set the url directly, as we'd like to phase it out.
    * If the content.url exists, we'll transfer it to legacy_url. We'll only
    * need to set this if content.hosted_url is blank, otherwise,
    * hosted_url is the url replacement.
    */

    this.legacy_url = !this.payload.safeContent.hosted_url ? this.payload.safeContent.url : undefined;
  }
  /** Do not duplicate components under most circumstances. Always keep original */


  strategyWhenConflictingWithItem(item) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return strategies["a" /* ConflictStrategy */].KeepLeft;
  }

  isEditor() {
    return this.area === ComponentArea.Editor;
  }

  isTheme() {
    return this.content_type === content_types["a" /* ContentType */].Theme || this.area === ComponentArea.Themes;
  }

  isDefaultEditor() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].DefaultEditor) === true;
  }

  getLastSize() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].LastSize);
  }

  acceptsThemes() {
    var _this$payload$safeCon;

    return (_this$payload$safeCon = this.payload.safeContent.package_info) === null || _this$payload$safeCon === void 0 ? void 0 : _this$payload$safeCon.acceptsThemes;
  }
  /**
   * The key used to look up data that this component may have saved to an item.
   * This data will be stored on the item using this key.
   */


  getClientDataKey() {
    if (this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  hasValidHostedUrl() {
    return this.hosted_url || this.legacy_url;
  }

  contentKeysToIgnoreWhenCheckingEquality() {
    return ['active', 'disassociatedItemIds', 'associatedItemIds'].concat(super.contentKeysToIgnoreWhenCheckingEquality());
  }
  /**
   * An associative component depends on being explicitly activated for a
   * given item, compared to a dissaciative component, which is enabled by
   * default in areas unrelated to a certain item.
   */


  static associativeAreas() {
    return [ComponentArea.Editor];
  }

  isAssociative() {
    return component_SNComponent.associativeAreas().includes(this.area);
  }

  isExplicitlyEnabledForItem(uuid) {
    return this.associatedItemIds.indexOf(uuid) !== -1;
  }

  isExplicitlyDisabledForItem(uuid) {
    return this.disassociatedItemIds.indexOf(uuid) !== -1;
  }

}
class component_ComponentMutator extends core_item["b" /* ItemMutator */] {
  get typedContent() {
    return this.content;
  }

  set active(active) {
    this.typedContent.active = active;
  }

  set isMobileDefault(isMobileDefault) {
    this.typedContent.isMobileDefault = isMobileDefault;
  }

  set defaultEditor(defaultEditor) {
    this.setAppDataItem(core_item["a" /* AppDataField */].DefaultEditor, defaultEditor);
  }

  set componentData(componentData) {
    this.typedContent.componentData = componentData;
  }

  set package_info(package_info) {
    this.typedContent.package_info = package_info;
  }

  set local_url(local_url) {
    this.typedContent.local_url = local_url;
  }

  set hosted_url(hosted_url) {
    this.typedContent.hosted_url = hosted_url;
  }

  set permissions(permissions) {
    this.typedContent.permissions = permissions;
  }

  associateWithItem(uuid) {
    const associated = this.typedContent.associatedItemIds || [];
    Object(utils["b" /* addIfUnique */])(associated, uuid);
    this.typedContent.associatedItemIds = associated;
  }

  disassociateWithItem(uuid) {
    const disassociated = this.typedContent.disassociatedItemIds || [];
    Object(utils["b" /* addIfUnique */])(disassociated, uuid);
    this.typedContent.disassociatedItemIds = disassociated;
  }

  removeAssociatedItemId(uuid) {
    Object(utils["B" /* removeFromArray */])(this.typedContent.associatedItemIds || [], uuid);
  }

  removeDisassociatedItemId(uuid) {
    Object(utils["B" /* removeFromArray */])(this.typedContent.disassociatedItemIds || [], uuid);
  }

  setLastSize(size) {
    this.setAppDataItem(core_item["a" /* AppDataField */].LastSize, size);
  }

}
// CONCATENATED MODULE: ./lib/models/app/theme.ts




class theme_SNTheme extends component_SNComponent {
  constructor() {
    super(...arguments);
    this.area = ComponentArea.Themes;
  }

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }
  /** Do not duplicate under most circumstances. Always keep original */


  strategyWhenConflictingWithItem(item) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return strategies["a" /* ConflictStrategy */].KeepLeft;
  }

  getMobileRules() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].MobileRules) || {
      constants: {},
      rules: {}
    };
  }
  /** Same as getMobileRules but without default value. */


  hasMobileRules() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].MobileRules);
  }

  getNotAvailOnMobile() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].NotAvailableOnMobile);
  }

  isMobileActive() {
    return this.getAppDomainValue(core_item["a" /* AppDataField */].MobileActive);
  }

}
class theme_ThemeMutator extends core_item["b" /* ItemMutator */] {
  setMobileRules(rules) {
    this.setAppDataItem(core_item["a" /* AppDataField */].MobileRules, rules);
  }

  setNotAvailOnMobile(notAvailable) {
    this.setAppDataItem(core_item["a" /* AppDataField */].NotAvailableOnMobile, notAvailable);
  }

  set local_url(local_url) {
    this.content.local_url = local_url;
  }
  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */


  setMobileActive(active) {
    this.setAppDataItem(core_item["a" /* AppDataField */].MobileActive, active);
  }

}
// CONCATENATED MODULE: ./lib/models/app/editor.ts

/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */

class editor_SNEditor extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    this.notes = [];
    this.data = {};
    this.url = payload.safeContent.url;
    this.name = payload.safeContent.name;
    this.data = payload.safeContent.data || {};
    this.isDefault = payload.safeContent.default;
    this.systemEditor = payload.safeContent.systemEditor;
  }

}
// EXTERNAL MODULE: ./node_modules/lodash/merge.js
var merge = __webpack_require__(36);
var merge_default = /*#__PURE__*/__webpack_require__.n(merge);

// CONCATENATED MODULE: ./lib/models/app/action.ts

var ActionAccessType;

(function (ActionAccessType) {
  ActionAccessType["Encrypted"] = "encrypted";
  ActionAccessType["Decrypted"] = "decrypted";
})(ActionAccessType || (ActionAccessType = {}));

;
var ActionVerb;

(function (ActionVerb) {
  ActionVerb["Get"] = "get";
  ActionVerb["Render"] = "render";
  ActionVerb["Show"] = "show";
  ActionVerb["Post"] = "post";
  ActionVerb["Nested"] = "nested";
})(ActionVerb || (ActionVerb = {}));

;
/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */

class action_Action {
  constructor(json) {
    merge_default()(this, json);
    this.running = json.running || false;
    this.error = json.error || false;

    if (this.lastExecuted) {
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }

}
// CONCATENATED MODULE: ./lib/models/app/extension.ts


/**
 * Related to the SNActionsService and the local Action model.
 */

class extension_SNActionsExtension extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    this.actions = [];
    this.description = payload.safeContent.description;
    this.url = payload.safeContent.url;
    this.name = payload.safeContent.name;
    this.package_info = payload.safeContent.package_info;
    this.supported_types = payload.safeContent.supported_types;

    if (payload.safeContent.actions) {
      this.actions = payload.safeContent.actions.map(action => {
        return new action_Action(action);
      });
    }
  }

  actionsWithContextForItem(item) {
    return this.actions.filter(action => {
      return action.context === item.content_type || action.context === 'Item';
    });
  }

}
class extension_ActionsExtensionMutator extends core_item["b" /* ItemMutator */] {
  set description(description) {
    this.content.description = description;
  }

  set supported_types(supported_types) {
    this.content.supported_types = supported_types;
  }

  set actions(actions) {
    this.content.actions = actions;
  }

}
// CONCATENATED MODULE: ./lib/models/app/tag.ts


/**
 * Allows organization of notes into groups. A tag can have many notes, and a note
 * can have many tags.
 */

class tag_SNTag extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    this.title = this.payload.safeContent.title;
  }

  get noteCount() {
    return this.payload.safeReferences.length;
  }

  isSmartTag() {
    return this.content_type === content_types["a" /* ContentType */].SmartTag;
  }

  get isAllTag() {
    return this.payload.safeContent.isAllTag;
  }

  get isTrashTag() {
    return this.payload.safeContent.isTrashTag;
  }

  get isArchiveTag() {
    return this.payload.safeContent.isArchiveTag;
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {
      return a.title > b.title ? 1 : -1;
    }).map(tag => {
      return '#' + tag.title;
    }).join(' ');
  }

}
class tag_TagMutator extends core_item["b" /* ItemMutator */] {
  set title(title) {
    this.content.title = title;
  }

}
// CONCATENATED MODULE: ./lib/models/app/smartTag.ts


/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */

class smartTag_SNSmartTag extends tag_SNTag {
  constructor(payload) {
    super(payload);

    if (payload.safeContent.predicate) {
      this.predicate = core_predicate["a" /* SNPredicate */].FromJson(payload.safeContent.predicate);
    }
  }

}
// EXTERNAL MODULE: ./lib/protocol/payloads/formats.ts
var formats = __webpack_require__(9);

// CONCATENATED MODULE: ./lib/models/app/note.ts



/** A note item */

class note_SNNote extends core_item["d" /* SNItem */] {
  constructor(payload) {
    super(payload);
    /* Some external editors can't handle a null value for text.
    * Notes created on mobile with no text have a null value for it,
    * so we'll just set a default here. */

    this.text = '';
    this.hidePreview = false;
    this.title = this.payload.safeContent.title;
    this.text = this.payload.safeContent.text;
    this.preview_plain = this.payload.safeContent.preview_plain;
    this.preview_html = this.payload.safeContent.preview_html;
    this.hidePreview = this.payload.safeContent.hidePreview;

    if (payload.format === formats["a" /* PayloadFormat */].DecryptedBareObject) {
      this.prefersPlainEditor = this.getAppDomainValue(core_item["a" /* AppDataField */].PrefersPlainEditor);
    }

    if (!Object(utils["p" /* isNullOrUndefined */])(this.payload.safeContent.mobilePrefersPlainEditor)) {
      this.mobilePrefersPlainEditor = this.payload.safeContent.mobilePrefersPlainEditor;
    }
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

}
class note_NoteMutator extends core_item["b" /* ItemMutator */] {
  get typedContent() {
    return this.content;
  }

  set title(title) {
    this.typedContent.title = title;
  }

  set text(text) {
    this.typedContent.text = text;
  }

  set hidePreview(hidePreview) {
    this.typedContent.hidePreview = hidePreview;
  }

  set preview_plain(preview_plain) {
    this.typedContent.preview_plain = preview_plain;
  }

  set preview_html(preview_html) {
    this.typedContent.preview_html = preview_html;
  }

  set prefersPlainEditor(prefersPlainEditor) {
    this.setAppDataItem(core_item["a" /* AppDataField */].PrefersPlainEditor, prefersPlainEditor);
  }

}
// EXTERNAL MODULE: ./lib/protocol/versions.ts
var versions = __webpack_require__(6);

// CONCATENATED MODULE: ./lib/models/app/items_key.ts



/**
 * A key used to encrypt other items. Items keys are synced and persisted.
 */

class items_key_SNItemsKey extends core_item["d" /* SNItem */] {
  /** Do not duplicate items keys. Always keep original */
  strategyWhenConflictingWithItem(item) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return strategies["a" /* ConflictStrategy */].KeepLeft;
  }

  get version() {
    return this.payload.safeContent.version;
  }

  get isItemsKey() {
    return true;
  }

  get isDefault() {
    return this.payload.safeContent.isDefault;
  }

  get itemsKey() {
    return this.payload.safeContent.itemsKey;
  }

  get dataAuthenticationKey() {
    if (this.version === versions["a" /* ProtocolVersion */].V004) {
      throw 'Attempting to access legacy data authentication key.';
    }

    return this.payload.safeContent.dataAuthenticationKey;
  }

}
class items_key_ItemsKeyMutator extends core_item["b" /* ItemMutator */] {
  set isDefault(isDefault) {
    this.content.isDefault = isDefault;
  }

}
// CONCATENATED MODULE: ./lib/models/generator.ts












const ContentTypeClassMapping = {
  [content_types["a" /* ContentType */].Note]: note_SNNote,
  [content_types["a" /* ContentType */].Tag]: tag_SNTag,
  [content_types["a" /* ContentType */].ItemsKey]: items_key_SNItemsKey,
  [content_types["a" /* ContentType */].SmartTag]: smartTag_SNSmartTag,
  [content_types["a" /* ContentType */].ActionsExtension]: extension_SNActionsExtension,
  [content_types["a" /* ContentType */].Editor]: editor_SNEditor,
  [content_types["a" /* ContentType */].Theme]: theme_SNTheme,
  [content_types["a" /* ContentType */].Component]: component_SNComponent,
  [content_types["a" /* ContentType */].Privileges]: privileges_SNPrivileges,
  [content_types["a" /* ContentType */].UserPrefs]: userPrefs_SNUserPrefs
};
function CreateItemFromPayload(payload) {
  const itemClass = ContentTypeClassMapping[payload.content_type] || core_item["d" /* SNItem */]; // eslint-disable-next-line new-cap

  const item = new itemClass(payload);
  return item;
}
// EXTERNAL MODULE: ./lib/protocol/intents.ts
var intents = __webpack_require__(8);

// CONCATENATED MODULE: ./lib/services/storage_service.ts








var StoragePersistencePolicies;

(function (StoragePersistencePolicies) {
  StoragePersistencePolicies[StoragePersistencePolicies["Default"] = 1] = "Default";
  StoragePersistencePolicies[StoragePersistencePolicies["Ephemeral"] = 2] = "Ephemeral";
})(StoragePersistencePolicies || (StoragePersistencePolicies = {}));

;
var StorageEncryptionPolicies;

(function (StorageEncryptionPolicies) {
  StorageEncryptionPolicies[StorageEncryptionPolicies["Default"] = 1] = "Default";
  StorageEncryptionPolicies[StorageEncryptionPolicies["Disabled"] = 2] = "Disabled";
})(StorageEncryptionPolicies || (StorageEncryptionPolicies = {}));

;
var StorageValueModes;

(function (StorageValueModes) {
  /** Stored inside wrapped encrpyed storage object */
  StorageValueModes[StorageValueModes["Default"] = 1] = "Default";
  /** Stored outside storage object, unencrypted */

  StorageValueModes[StorageValueModes["Nonwrapped"] = 2] = "Nonwrapped";
})(StorageValueModes || (StorageValueModes = {}));

;
var ValueModesKeys;

(function (ValueModesKeys) {
  /* Is encrypted */
  ValueModesKeys["Wrapped"] = "wrapped";
  /* Is decrypted */

  ValueModesKeys["Unwrapped"] = "unwrapped";
  /* Lives outside of wrapped/unwrapped */

  ValueModesKeys["Nonwrapped"] = "nonwrapped";
})(ValueModesKeys || (ValueModesKeys = {}));

;
/**
 * The storage service is responsible for persistence of both simple key-values, and payload
 * storage. It does so by relying on deviceInterface to save and retrieve raw values and payloads.
 * For simple key/values, items are grouped together in an in-memory hash, and persisted to disk
 * as a single object (encrypted, when possible). It handles persisting payloads in the local
 * database by encrypting the payloads when possible.
 * The storage service also exposes methods that allow the application to initially
 * decrypt the persisted key/values, and also a method to determine whether a particular
 * key can decrypt wrapped storage.
 */

class storage_service_SNStorageService extends pure_service["a" /* PureService */] {
  constructor(deviceInterface, identifier) {
    super();
    /** Wait until application has been unlocked before trying to persist */

    this.storagePersistable = false;
    this.deviceInterface = deviceInterface;
    this.identifier = identifier;
    this.setPersistencePolicy(StoragePersistencePolicies.Default);
    this.setEncryptionPolicy(StorageEncryptionPolicies.Default);
  }

  deinit() {
    this.deviceInterface = undefined;
    this.encryptionDelegate = undefined;
    super.deinit();
  }

  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);

    if (stage === ApplicationStage.Launched_10) {
      this.storagePersistable = true;
    }
  }

  async setPersistencePolicy(persistencePolicy) {
    this.persistencePolicy = persistencePolicy;

    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      await this.deviceInterface.removeAllRawStorageValues();
      await this.clearAllPayloads();
    }
  }

  async setEncryptionPolicy(encryptionPolicy) {
    this.encryptionPolicy = encryptionPolicy;
  }

  isEphemeralSession() {
    return this.persistencePolicy === StoragePersistencePolicies.Ephemeral;
  }

  async initializeFromDisk() {
    const value = await this.deviceInterface.getRawStorageValue(this.getPersistenceKey());
    const values = value ? JSON.parse(value) : undefined;
    this.setInitialValues(values);
  }
  /**
   * Called by platforms with the value they load from disk,
   * after they handle initializeFromDisk
   */


  setInitialValues(values) {
    if (!values) {
      values = this.defaultValuesObject();
    }

    if (!values[ValueModesKeys.Unwrapped]) {
      values[ValueModesKeys.Unwrapped] = {};
    }

    this.values = values;
  }

  isStorageWrapped() {
    const wrappedValue = this.values[ValueModesKeys.Wrapped];
    return !Object(utils["p" /* isNullOrUndefined */])(wrappedValue) && Object.keys(wrappedValue).length > 0;
  }

  async canDecryptWithKey(key) {
    const wrappedValue = this.values[ValueModesKeys.Wrapped];
    const decryptedPayload = await this.decryptWrappedValue(wrappedValue, key);
    return !decryptedPayload.errorDecrypting;
  }

  async decryptWrappedValue(wrappedValue, key) {
    /**
    * The read content type doesn't matter, so long as we know it responds
    * to content type. This allows a more seamless transition when both web
    * and mobile used different content types for encrypted storage.
    */
    if (!(wrappedValue === null || wrappedValue === void 0 ? void 0 : wrappedValue.content_type)) {
      throw Error('Attempting to decrypt nonexistent wrapped value');
    }

    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(wrappedValue, {
      content_type: content_types["a" /* ContentType */].EncryptedStorage
    });
    const decryptedPayload = await this.encryptionDelegate.payloadByDecryptingPayload(payload, key);
    return decryptedPayload;
  }

  async decryptStorage() {
    const wrappedValue = this.values[ValueModesKeys.Wrapped];
    const decryptedPayload = await this.decryptWrappedValue(wrappedValue);

    if (decryptedPayload.errorDecrypting) {
      throw Error('Unable to decrypt storage.');
    }

    this.values[ValueModesKeys.Unwrapped] = Object(utils["a" /* Copy */])(decryptedPayload.contentObject);
  }
  /** @todo This function should be debounced. */


  async persistValuesToDisk() {
    if (!this.storagePersistable) {
      return;
    }

    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      return;
    }

    const values = await this.immediatelyPersistValuesToDisk();
    /** Save the persisted value so we have access to it in memory (for unit tests afawk) */

    this.values[ValueModesKeys.Wrapped] = values[ValueModesKeys.Wrapped];
  }

  async immediatelyPersistValuesToDisk() {
    return this.executeCriticalFunction(async () => {
      const values = await this.generatePersistableValues();
      await this.deviceInterface.setRawStorageValue(this.getPersistenceKey(), JSON.stringify(values));
      return values;
    });
  }
  /**
   * Generates a payload that can be persisted to disk,
   * either as a plain object, or an encrypted item.
   */


  async generatePersistableValues() {
    const rawContent = Object.assign({}, this.values);
    const valuesToWrap = rawContent[ValueModesKeys.Unwrapped];
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
      uuid: await uuid_Uuid.GenerateUuid(),
      content: valuesToWrap,
      content_type: content_types["a" /* ContentType */].EncryptedStorage
    });
    const encryptedPayload = await this.encryptionDelegate.payloadByEncryptingPayload(payload, intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted);
    rawContent[ValueModesKeys.Wrapped] = encryptedPayload.ejected();
    rawContent[ValueModesKeys.Unwrapped] = undefined;
    return rawContent;
  }

  async setValue(key, value) {
    let mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : StorageValueModes.Default;

    if (!this.values) {
      throw Error("Attempting to set storage key ".concat(key, " before loading local storage."));
    }

    this.values[this.domainKeyForMode(mode)][key] = value;
    return this.persistValuesToDisk();
  }

  async getValue(key) {
    let mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StorageValueModes.Default;

    if (!this.values) {
      throw Error("Attempting to get storage key ".concat(key, " before loading local storage."));
    }

    if (!this.values[this.domainKeyForMode(mode)]) {
      throw Error("Storage domain mode not available ".concat(mode, " for key ").concat(key));
    }

    return this.values[this.domainKeyForMode(mode)][key];
  }

  async removeValue(key) {
    let mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StorageValueModes.Default;

    if (!this.values) {
      throw Error("Attempting to remove storage key ".concat(key, " before loading local storage."));
    }

    const domain = this.values[this.domainKeyForMode(mode)];

    if (domain === null || domain === void 0 ? void 0 : domain[key]) {
      delete domain[key];
      return this.persistValuesToDisk();
    }
  }

  getStorageEncryptionPolicy() {
    return this.encryptionPolicy;
  }
  /**
   * Default persistence key. Platforms can override as needed.
   */


  getPersistenceKey() {
    return namespacedKey(this.identifier, RawStorageKey.StorageObject);
  }

  defaultValuesObject(wrapped, unwrapped, nonwrapped) {
    return storage_service_SNStorageService.defaultValuesObject(wrapped, unwrapped, nonwrapped);
  }

  static defaultValuesObject() {
    let wrapped = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    let unwrapped = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let nonwrapped = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return {
      [ValueModesKeys.Wrapped]: wrapped,
      [ValueModesKeys.Unwrapped]: unwrapped,
      [ValueModesKeys.Nonwrapped]: nonwrapped
    };
  }

  domainKeyForMode(mode) {
    if (mode === StorageValueModes.Default) {
      return ValueModesKeys.Unwrapped;
    } else if (mode === StorageValueModes.Nonwrapped) {
      return ValueModesKeys.Nonwrapped;
    } else {
      throw Error('Invalid mode');
    }
  }
  /**
   * Clears simple values from storage only. Does not affect payloads.
   */


  async clearValues() {
    this.setInitialValues();
    await this.immediatelyPersistValuesToDisk();
  }

  async getAllRawPayloads() {
    return this.deviceInterface.getAllRawDatabasePayloads(this.identifier);
  }

  async savePayload(payload) {
    return this.savePayloads([payload]);
  }

  async savePayloads(decryptedPayloads) {
    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      return;
    }

    const nondeleted = [];

    for (const payload of decryptedPayloads) {
      if (payload.discardable) {
        /** If the payload is deleted and not dirty, remove it from db. */
        await this.deletePayloadWithId(payload.uuid);
      } else {
        if (!payload.uuid) {
          throw Error('Attempting to persist payload with no uuid');
        }

        const encrypted = await this.encryptionDelegate.payloadByEncryptingPayload(payload, this.encryptionPolicy === StorageEncryptionPolicies.Default ? intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted : intents["a" /* EncryptionIntent */].LocalStorageDecrypted);
        nondeleted.push(encrypted.ejected());
      }
    }

    return this.executeCriticalFunction(async () => {
      return this.deviceInterface.saveRawDatabasePayloads(nondeleted, this.identifier);
    });
  }

  async deletePayloads(payloads) {
    for (const payload of payloads) {
      await this.deletePayloadWithId(payload.uuid);
    }
  }

  async deletePayloadWithId(id) {
    return this.executeCriticalFunction(async () => {
      return this.deviceInterface.removeRawDatabasePayloadWithId(id, this.identifier);
    });
  }

  async clearAllPayloads() {
    return this.executeCriticalFunction(async () => {
      return this.deviceInterface.removeAllRawDatabasePayloads(this.identifier);
    });
  }

  clearAllData() {
    return this.executeCriticalFunction(async () => {
      await this.clearValues();
      await this.clearAllPayloads();
      await this.deviceInterface.removeRawStorageValue(this.getPersistenceKey());
    });
  }

}
// CONCATENATED MODULE: ./lib/services/alert_service.ts
var ButtonType;

(function (ButtonType) {
  ButtonType[ButtonType["Info"] = 0] = "Info";
  ButtonType[ButtonType["Danger"] = 1] = "Danger";
})(ButtonType || (ButtonType = {}));
// CONCATENATED MODULE: ./lib/services/api/session.ts
class Session {
  static FromRawStorageValue(raw) {
    if (raw.jwt) {
      return new JwtSession(raw.jwt);
    } else {
      const rawSession = raw;
      return new TokenSession(rawSession.accessToken, rawSession.accessExpiration, rawSession.refreshToken, rawSession.refreshExpiration);
    }
  }

}
/** Legacy, for protocol versions <= 003 */

class JwtSession extends Session {
  constructor(jwt) {
    super();
    this.jwt = jwt;
  }

  get authorizationValue() {
    return this.jwt;
  }

  canExpire() {
    return false;
  }

}
/** For protocol versions >= 004 */

class TokenSession extends Session {
  constructor(accessToken, accessExpiration, refreshToken, refreshExpiration) {
    super();
    this.accessToken = accessToken;
    this.accessExpiration = accessExpiration;
    this.refreshToken = refreshToken;
    this.refreshExpiration = refreshExpiration;
  }

  static FromApiResponse(response) {
    const accessToken = response.session.access_token;
    const refreshToken = response.session.refresh_token;
    const accessExpiration = response.session.access_expiration;
    const refreshExpiration = response.session.refresh_expiration;
    return new TokenSession(accessToken, accessExpiration, refreshToken, refreshExpiration);
  }

  getExpireAt() {
    return this.accessExpiration || 0;
  }

  get authorizationValue() {
    return this.accessToken;
  }

  canExpire() {
    return true;
  }

  isExpired() {
    return this.getExpireAt() < Date.now();
  }

}
// CONCATENATED MODULE: ./lib/services/api/messages.ts
const API_MESSAGE_GENERIC_INVALID_LOGIN = 'A server error occurred while trying to sign in. Please try again.';
const API_MESSAGE_GENERIC_REGISTRATION_FAIL = 'A server error occurred while trying to register. Please try again.';
const API_MESSAGE_GENERIC_CHANGE_PW_FAIL = "Something went wrong while changing your password. Your password was not changed. Please try again.";
const API_MESSAGE_GENERIC_SYNC_FAIL = 'Could not connect to server.';
const API_MESSAGE_REGISTRATION_IN_PROGRESS = 'An existing registration request is already in progress.';
const API_MESSAGE_LOGIN_IN_PROGRESS = 'An existing sign in request is already in progress.';
const API_MESSAGE_CHANGE_PW_IN_PROGRESS = 'An existing change password request is already in progress.';
const API_MESSAGE_FALLBACK_LOGIN_FAIL = 'Invalid email or password.';
const API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL = "A server error occurred while trying to refresh your session. Please try again.";
const API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS = "Your account session is being renewed with the server. Please try your request again.";
const API_MESSAGE_INVALID_SESSION = 'Please sign in to an account in order to continue with your request.';
const UNSUPPORTED_PROTOCOL_VERSION = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
const EXPIRED_PROTOCOL_VERSION = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
const OUTDATED_PROTOCOL_VERSION = "The encryption version for your account is outdated and requires upgrade. You may proceed with login, but areadvised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.";
const UNSUPPORTED_KEY_DERIVATION = "Your account was created on a platform with higher security capabilities than this browser supports. If we attempted to generate your login keys here, it would take hours. Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in.";
const INVALID_PASSWORD_COST = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
const INVALID_PASSWORD = "Invalid password.";
const OUTDATED_PROTOCOL_ALERT_TITLE = 'Update Recommended';
const OUTDATED_PROTOCOL_ALERT_IGNORE = 'Sign In';
const UPGRADING_ENCRYPTION = "Upgrading your account's encryption version\u2026";
const SETTING_PASSCODE = "Setting passcode\u2026";
const CHANGING_PASSCODE = "Changing passcode\u2026";
const REMOVING_PASSCODE = "Removing passcode\u2026";
const DO_NOT_CLOSE_APPLICATION = 'Do not close the application until this process completes.';
const UNKNOWN_ERROR = 'Unknown error.';
function InsufficientPasswordMessage(minimum) {
  return "Your password must be at least ".concat(minimum, " characters in length. For your security, please choose a longer password or, ideally, a passphrase, and try again.");
}
function StrictSignInFailed(current, latest) {
  return "Strict Sign In has refused the server's sign-in parameters. The latest account version is ".concat(latest, ", but the server is reporting a version of ").concat(current, " for your account. If you'd like to proceed with sign in anyway, please disable Strict Sign In and try again.");
}
const UNSUPPORTED_BACKUP_FILE_VERSION = "This backup file was created using a newer version of the application and cannot be imported here. Please update your application and try again.";
const BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT = "This backup file was created using a newer encryption version than your account's. Please run the available encryption upgrade and try again.";
// CONCATENATED MODULE: ./lib/services/api/session_manager.ts






const MINIMUM_PASSWORD_LENGTH = 8;
/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */

class session_manager_SNSessionManager extends pure_service["a" /* PureService */] {
  constructor(storageService, apiService, alertService, protocolService) {
    super();
    this.protocolService = protocolService;
    this.storageService = storageService;
    this.apiService = apiService;
    this.alertService = alertService;
  }

  deinit() {
    this.protocolService = undefined;
    this.storageService = undefined;
    this.apiService = undefined;
    this.alertService = undefined;
    this.user = undefined;
    super.deinit();
  }

  async initializeFromDisk() {
    this.user = await this.storageService.getValue(StorageKey.User);

    if (!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageService.getValue(StorageKey.LegacyUuid);

      if (uuid) {
        this.user = {
          uuid: uuid
        };
      }
    }

    const rawSession = await this.storageService.getValue(StorageKey.Session);

    if (rawSession) {
      await this.setSession(Session.FromRawStorageValue(rawSession), false);
    }
  }

  async setSession(session) {
    let persist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    await this.apiService.setSession(session, persist);
  }

  online() {
    return !this.offline();
  }

  offline() {
    return Object(utils["p" /* isNullOrUndefined */])(this.apiService.getSession());
  }

  getUser() {
    return this.user;
  }

  async signOut() {
    this.user = undefined;
    const session = this.apiService.getSession();

    if (session && session.canExpire()) {
      await this.apiService.signOut();
    }
  }

  async register(email, password) {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return {
        response: this.apiService.createErrorResponse(InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH))
      };
    }

    const result = await this.protocolService.createRootKey(email, password);
    const serverPassword = result.key.serverPassword;
    const keyParams = result.keyParams;
    const rootKey = result.key;
    return this.apiService.register(email, serverPassword, keyParams).then(async response => {
      await this.handleAuthResponse(response);
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      };
    });
  }

  async signIn(email, password) {
    let strict = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let mfaKeyPath = arguments.length > 3 ? arguments[3] : undefined;
    let mfaCode = arguments.length > 4 ? arguments[4] : undefined;
    const paramsResponse = await this.apiService.getAccountKeyParams(email, mfaKeyPath, mfaCode);

    if (paramsResponse.error) {
      return {
        response: paramsResponse
      };
    }

    const rawKeyParams = {
      pw_cost: paramsResponse.pw_cost,
      pw_nonce: paramsResponse.pw_nonce,
      identifier: paramsResponse.identifier,
      email: paramsResponse.email,
      pw_salt: paramsResponse.pw_salt,
      version: paramsResponse.version
    };
    const keyParams = this.protocolService.createKeyParams(rawKeyParams);

    if (!keyParams || !keyParams.version) {
      return {
        response: this.apiService.createErrorResponse(API_MESSAGE_FALLBACK_LOGIN_FAIL)
      };
    }

    if (!this.protocolService.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return {
          response: this.apiService.createErrorResponse(UNSUPPORTED_PROTOCOL_VERSION)
        };
      } else {
        return {
          response: this.apiService.createErrorResponse(EXPIRED_PROTOCOL_VERSION)
        };
      }
    }

    if (this.protocolService.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService.costMinimumForVersion(keyParams.version);

      if (keyParams.kdfIterations < minimum) {
        return {
          response: this.apiService.createErrorResponse(INVALID_PASSWORD_COST)
        };
      }

      ;
      const message = OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertService.confirm(message, OUTDATED_PROTOCOL_ALERT_TITLE, OUTDATED_PROTOCOL_ALERT_IGNORE);

      if (!confirmed) {
        return {
          response: this.apiService.createErrorResponse(API_MESSAGE_FALLBACK_LOGIN_FAIL)
        };
      }
    }

    if (!this.protocolService.platformSupportsKeyDerivation(keyParams)) {
      return {
        response: this.apiService.createErrorResponse(UNSUPPORTED_KEY_DERIVATION)
      };
    }

    if (strict) {
      const latest = this.protocolService.getLatestVersion();

      if (keyParams.version !== latest) {
        return {
          response: this.apiService.createErrorResponse(StrictSignInFailed(keyParams.version, latest))
        };
      }
    }

    const {
      rootKey,
      serverPassword
    } = await this.protocolService.computeRootKey(password, keyParams).then(rootKey => {
      return {
        rootKey: rootKey,
        serverPassword: rootKey.serverPassword
      };
    });
    return this.apiService.signIn(email, serverPassword, mfaKeyPath, mfaCode).then(async response => {
      await this.handleAuthResponse(response);
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      };
    });
  }

  async changePassword(currentServerPassword, newServerPassword, newKeyParams) {
    const response = await this.apiService.changePassword(currentServerPassword, newServerPassword, newKeyParams);
    await this.handleAuthResponse(response);
    return response;
  }

  async handleAuthResponse(response) {
    if (response.error) {
      return;
    }

    const user = response.user;
    this.user = user;
    await this.storageService.setValue(StorageKey.User, user);

    if (response.token) {
      /** Legacy JWT response */
      const session = new JwtSession(response.token);
      await this.setSession(session);
    } else {
      /** Non-legacy expirable sessions */
      const session = TokenSession.FromApiResponse(response);
      await this.setSession(session);
    }
  }

}
// CONCATENATED MODULE: ./lib/services/api/http_service.ts


var HttpVerb;

(function (HttpVerb) {
  HttpVerb["Get"] = "get";
  HttpVerb["Post"] = "post";
  HttpVerb["Patch"] = "patch";
})(HttpVerb || (HttpVerb = {}));

const REQUEST_READY_STATE_COMPLETED = 4;
const HTTP_STATUS_MIN_SUCCESS = 200;
const HTTP_STATUS_MAX_SUCCESS = 299;
const HTTP_STATUS_EXPIRED_ACCESS_TOKEN = 498;
/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */

class http_service_SNHttpService extends pure_service["a" /* PureService */] {
  async getAbsolute(url, params, authentication) {
    return this.runHttp({
      url,
      params,
      verb: HttpVerb.Get,
      authentication
    });
  }

  async postAbsolute(url, params, authentication) {
    return this.runHttp({
      url,
      params,
      verb: HttpVerb.Post,
      authentication
    });
  }

  async patchAbsolute(url, params, authentication) {
    return this.runHttp({
      url,
      params,
      verb: HttpVerb.Patch,
      authentication
    });
  }

  async runHttp(httpRequest) {
    const request = this.createXmlRequest(httpRequest);
    return this.runRequest(request, httpRequest.verb, httpRequest.params);
  }

  createXmlRequest(httpRequest) {
    const request = new XMLHttpRequest();

    if (httpRequest.params && httpRequest.verb === HttpVerb.Get && Object.keys(httpRequest.params).length > 0) {
      httpRequest.url = this.urlForUrlAndParams(httpRequest.url, httpRequest.params);
    }

    request.open(httpRequest.verb, httpRequest.url, true);
    request.setRequestHeader('Content-type', 'application/json');

    if (httpRequest.authentication) {
      request.setRequestHeader('Authorization', 'Bearer ' + httpRequest.authentication);
    }

    return request;
  }

  async runRequest(request, verb, params) {
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        this.stateChangeHandlerForRequest(request, resolve, reject);
      };

      if (verb === HttpVerb.Post || verb === HttpVerb.Patch) {
        request.send(JSON.stringify(params));
      } else {
        request.send();
      }
    });
  }

  stateChangeHandlerForRequest(request, resolve, reject) {
    if (request.readyState !== REQUEST_READY_STATE_COMPLETED) {
      return;
    }

    const httpStatus = request.status;
    let response = {
      status: httpStatus
    };

    try {
      const body = JSON.parse(request.responseText);
      response.object = body;
      Object.assign(response, body);
    } catch (error) {}

    if (httpStatus >= HTTP_STATUS_MIN_SUCCESS && httpStatus <= HTTP_STATUS_MAX_SUCCESS) {
      resolve(response);
    } else {
      if (!response.error) {
        response.error = {
          message: UNKNOWN_ERROR,
          status: httpStatus
        };
      }

      reject(response);
    }
  }

  urlForUrlAndParams(url, params) {
    const keyValueString = Object.keys(params).map(key => {
      return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    if (url.includes('?')) {
      return url + '&' + keyValueString;
    } else {
      return url + '?' + keyValueString;
    }
  }

  isErrorResponseExpiredToken(errorResponse) {
    return errorResponse.status === HTTP_STATUS_EXPIRED_ACCESS_TOKEN;
  }

}
// CONCATENATED MODULE: ./lib/services/api/keys.ts
var ApiEndpointParam;

(function (ApiEndpointParam) {
  ApiEndpointParam["LastSyncToken"] = "sync_token";
  ApiEndpointParam["PaginationToken"] = "cursor_token";
  ApiEndpointParam["IntegrityCheck"] = "compute_integrity";
  ApiEndpointParam["IntegrityResult"] = "integrity_hash";
  ApiEndpointParam["SyncDlLimit"] = "limit";
  ApiEndpointParam["SyncPayloads"] = "items";
  ApiEndpointParam["ApiVersion"] = "api";
})(ApiEndpointParam || (ApiEndpointParam = {}));

;
// CONCATENATED MODULE: ./lib/services/api/api_service.ts
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









const REQUEST_PATH_KEY_PARAMS = '/auth/params';
const REQUEST_PATH_REGISTER = '/auth';
const REQUEST_PATH_LOGIN = '/auth/sign_in';
const REQUEST_PATH_CHANGE_PW = '/auth/change_pw';
const REQUEST_PATH_SYNC = '/items/sync';
const REQUEST_PATH_LOGOUT = '/auth/sign_out';
const REQUEST_PATH_SESSION_REFRESH = '/session/refresh';
const REQUEST_PATH_ITEM_REVISIONS = '/items/:item_id/revisions';
const REQUEST_PATH_ITEM_REVISION = '/items/:item_id/revisions/:id';
const API_VERSION = '20200115';
class api_service_SNApiService extends pure_service["a" /* PureService */] {
  constructor(httpService, storageService, defaultHost) {
    super();
    this.registering = false;
    this.authenticating = false;
    this.changing = false;
    this.refreshingSession = false;
    this.httpService = httpService;
    this.storageService = storageService;
    this.host = defaultHost;
  }
  /** @override */


  deinit() {
    this.httpService = undefined;
    this.storageService = undefined;
    this.host = undefined;
    this.session = undefined;
    super.deinit();
  }

  async loadHost() {
    const storedValue = await this.storageService.getValue(StorageKey.ServerHost);
    this.host = storedValue || this.host || window._default_sync_server;
  }

  async setHost(host) {
    this.host = host;
    await this.storageService.setValue(StorageKey.ServerHost, host);
  }

  async getHost() {
    return this.host;
  }

  async setSession(session) {
    let persist = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    this.session = session;

    if (persist) {
      await this.storageService.setValue(StorageKey.Session, session);
    }
  }

  getSession() {
    return this.session;
  }

  async path(path) {
    const host = await this.getHost();

    if (!host) {
      throw "Attempting to build path ".concat(path, " with no host.");
    }

    if (!path) {
      throw 'Attempting to build path with null path.';
    }

    return Object(utils["u" /* joinPaths */])(host, path);
  }

  params(inParams) {
    const params = merge_default()(inParams, {
      [ApiEndpointParam.ApiVersion]: API_VERSION
    });
    return params;
  }

  createErrorResponse(message) {
    return {
      error: {
        message: message
      }
    };
  }

  errorResponseWithFallbackMessage(response, message) {
    if (!response.error.message) {
      response.error.message = message;
    }

    return response;
  }
  /**
   * @param mfaKeyPath  The params path the server expects for authentication against
   *                    a particular mfa challenge. A value of foo would mean the server
   *                    would receive parameters as params['foo'] with value equal to mfaCode.
   * @param mfaCode     The mfa challenge response value.
   */


  async getAccountKeyParams(email, mfaKeyPath, mfaCode) {
    const url = await this.path(REQUEST_PATH_KEY_PARAMS);
    const params = this.params({
      email: email
    });

    if (mfaKeyPath) {
      params[mfaKeyPath] = mfaCode;
    }

    const response = await this.httpService.getAbsolute(url, params).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_INVALID_LOGIN);
    });
    return response;
  }

  async register(email, serverPassword, keyParams) {
    if (this.registering) {
      return this.createErrorResponse(API_MESSAGE_REGISTRATION_IN_PROGRESS);
    }

    this.registering = true;
    const url = await this.path(REQUEST_PATH_REGISTER);
    const params = this.params(_objectSpread({
      password: serverPassword,
      email: email
    }, keyParams.getPortableValue()));
    const response = await this.httpService.postAbsolute(url, params).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_REGISTRATION_FAIL);
    });
    this.registering = false;
    return response;
  }

  async signIn(email, serverPassword, mfaKeyPath, mfaCode) {
    if (this.authenticating) {
      return this.createErrorResponse(API_MESSAGE_LOGIN_IN_PROGRESS);
    }

    this.authenticating = true;
    const url = await this.path(REQUEST_PATH_LOGIN);
    const params = this.params({
      email: email,
      password: serverPassword
    });

    if (mfaKeyPath) {
      params[mfaKeyPath] = mfaCode;
    }

    const response = await this.httpService.postAbsolute(url, params).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_INVALID_LOGIN);
    });
    this.authenticating = false;
    return response;
  }

  async signOut() {
    const url = await this.path(REQUEST_PATH_LOGOUT);
    return this.httpService.postAbsolute(url, undefined, this.session.authorizationValue);
  }

  async changePassword(currentServerPassword, newServerPassword, newKeyParams) {
    if (this.changing) {
      return this.createErrorResponse(API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }

    const preprocessingError = this.preprocessingError();

    if (preprocessingError) {
      return preprocessingError;
    }

    this.changing = true;
    const url = await this.path(REQUEST_PATH_CHANGE_PW);
    const params = this.params(_objectSpread({
      current_password: currentServerPassword,
      new_password: newServerPassword
    }, newKeyParams.getPortableValue()));
    const response = await this.httpService.postAbsolute(url, params, this.session.authorizationValue).catch(async errorResponse => {
      if (this.httpService.isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Post,
          url,
          params
        });
      }

      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_CHANGE_PW_FAIL);
    });
    this.changing = false;
    return response;
  }

  async sync(payloads, lastSyncToken, paginationToken, limit) {
    let checkIntegrity = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    let contentType = arguments.length > 5 ? arguments[5] : undefined;
    let customEvent = arguments.length > 6 ? arguments[6] : undefined;
    const preprocessingError = this.preprocessingError();

    if (preprocessingError) {
      return preprocessingError;
    }

    const url = await this.path(REQUEST_PATH_SYNC);
    const params = this.params({
      [ApiEndpointParam.SyncPayloads]: payloads.map(p => p.ejected()),
      [ApiEndpointParam.LastSyncToken]: lastSyncToken,
      [ApiEndpointParam.PaginationToken]: paginationToken,
      [ApiEndpointParam.IntegrityCheck]: checkIntegrity,
      [ApiEndpointParam.SyncDlLimit]: limit,
      content_type: contentType,
      event: customEvent
    });
    const response = await this.httpService.postAbsolute(url, params, this.session.authorizationValue).catch(async errorResponse => {
      if (this.httpService.isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Post,
          url,
          params
        });
      }

      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_SYNC_FAIL);
    });
    return response;
  }

  async refreshSessionThenRetryRequest(httpRequest) {
    return this.refreshSession().then(sessionResponse => {
      if (sessionResponse === null || sessionResponse === void 0 ? void 0 : sessionResponse.error) {
        return sessionResponse;
      } else {
        return this.httpService.runHttp(_objectSpread(_objectSpread({}, httpRequest), {}, {
          authentication: this.session.authorizationValue
        }));
      }
    });
  }

  async refreshSession() {
    const preprocessingError = this.preprocessingError();

    if (preprocessingError) {
      return preprocessingError;
    }

    this.refreshingSession = true;
    const url = await this.path(REQUEST_PATH_SESSION_REFRESH);
    const session = this.session;
    const params = this.params({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });
    const result = await this.httpService.postAbsolute(url, params).then(async response => {
      const session = TokenSession.FromApiResponse(response);
      await this.setSession(session);
      return response;
    }).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL);
    });
    this.refreshingSession = false;
    return result;
  }

  async getItemRevisions(itemId) {
    const preprocessingError = this.preprocessingError();

    if (preprocessingError) {
      return preprocessingError;
    }

    const path = REQUEST_PATH_ITEM_REVISIONS.replace(/:item_id/, itemId);
    const url = await this.path(path);
    const response = await this.httpService.getAbsolute(url, undefined, this.session.authorizationValue).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_SYNC_FAIL);
    });
    return response;
  }

  async getRevisionForItem(itemId, revisionId) {
    const preprocessingError = this.preprocessingError();

    if (preprocessingError) {
      return preprocessingError;
    }

    const path = REQUEST_PATH_ITEM_REVISION.replace(/:item_id/, itemId).replace(/:id/, revisionId);
    const url = await this.path(path);
    const response = await this.httpService.getAbsolute(url, undefined, this.session.authorizationValue).catch(errorResponse => {
      return this.errorResponseWithFallbackMessage(errorResponse, API_MESSAGE_GENERIC_SYNC_FAIL);
    });
    return response;
  }

  preprocessingError() {
    if (this.refreshingSession) {
      return this.createErrorResponse(API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS);
    }

    if (!this.session) {
      return this.createErrorResponse(API_MESSAGE_INVALID_SESSION);
    }

    return undefined;
  }

}
// EXTERNAL MODULE: ./node_modules/lodash/find.js
var find = __webpack_require__(17);
var find_default = /*#__PURE__*/__webpack_require__.n(find);

// EXTERNAL MODULE: ./node_modules/lodash/uniq.js
var uniq = __webpack_require__(22);
var uniq_default = /*#__PURE__*/__webpack_require__.n(uniq);

// EXTERNAL MODULE: ./node_modules/lodash/remove.js
var remove = __webpack_require__(19);
var remove_default = /*#__PURE__*/__webpack_require__.n(remove);

// CONCATENATED MODULE: ./lib/platforms.ts
var Environment;

(function (Environment) {
  Environment[Environment["Web"] = 1] = "Web";
  Environment[Environment["Desktop"] = 2] = "Desktop";
  Environment[Environment["Mobile"] = 3] = "Mobile";
})(Environment || (Environment = {}));

;
var Platform;

(function (Platform) {
  Platform[Platform["Ios"] = 1] = "Ios";
  Platform[Platform["Android"] = 2] = "Android";
  Platform[Platform["MacWeb"] = 3] = "MacWeb";
  Platform[Platform["MacDesktop"] = 4] = "MacDesktop";
  Platform[Platform["WindowsWeb"] = 5] = "WindowsWeb";
  Platform[Platform["WindowsDesktop"] = 6] = "WindowsDesktop";
  Platform[Platform["LinuxWeb"] = 7] = "LinuxWeb";
  Platform[Platform["LinuxDesktop"] = 8] = "LinuxDesktop";
})(Platform || (Platform = {}));

;
function platformFromString(string) {
  const map = {
    'mac-web': Platform.MacWeb,
    'mac-desktop': Platform.MacDesktop,
    'linux-web': Platform.LinuxWeb,
    'linux-desktop': Platform.LinuxDesktop,
    'windows-web': Platform.WindowsWeb,
    'windows-desktop': Platform.WindowsDesktop,
    'ios': Platform.Ios,
    'android': Platform.Android
  };
  return map[string];
}
function platformToString(platform) {
  const map = {
    [Platform.MacWeb]: 'mac-web',
    [Platform.MacDesktop]: 'mac-desktop',
    [Platform.LinuxWeb]: 'linux-web',
    [Platform.LinuxDesktop]: 'linux-desktop',
    [Platform.WindowsWeb]: 'windows-web',
    [Platform.WindowsDesktop]: 'windows-desktop',
    [Platform.Ios]: 'ios',
    [Platform.Android]: 'android'
  };
  return map[platform];
}
function environmentToString(environment) {
  const map = {
    [Environment.Web]: 'web',
    [Environment.Desktop]: 'desktop',
    [Environment.Mobile]: 'mobile'
  };
  return map[environment];
}
function isEnvironmentWebOrDesktop(environment) {
  return environment === Environment.Web || environment === Environment.Desktop;
}
function isEnvironmentMobile(environment) {
  return environment === Environment.Mobile;
}
// CONCATENATED MODULE: ./lib/services/component_manager.ts
function component_manager_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function component_manager_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { component_manager_ownKeys(Object(source), true).forEach(function (key) { component_manager_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { component_manager_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function component_manager_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }















const DESKTOP_URL_PREFIX = 'sn://';
const LOCAL_HOST = 'localhost';
const CUSTOM_LOCAL_HOST = 'sn.local';
const ANDROID_LOCAL_HOST = '10.0.2.2';
/* This domain will be used to save context item client data */

const ComponentDataDomain = 'org.standardnotes.sn.components';
/**
 * Responsible for orchestrating component functionality, including editors, themes,
 * and other components. The component manager primarily deals with iframes, and orchestrates
 * sending and receiving messages to and from frames via the postMessage API.
 */

class component_manager_SNComponentManager extends pure_service["a" /* PureService */] {
  constructor(itemManager, syncService, alertService, environment, platform, timeout) {
    super();
    this.componentState = {};
    this.streamObservers = [];
    this.contextStreamObservers = [];
    this.activeComponents = {};
    this.permissionDialogs = [];
    this.handlers = [];

    this.detectFocusChange = () => {
      const activeComponents = this.itemManager.findItems(Object.keys(this.activeComponents));

      for (const component of activeComponents) {
        if (document.activeElement === this.iframeForComponent(component.uuid)) {
          this.timeout(() => {
            this.focusChangedForComponent(component);
          });
          break;
        }
      }
    };

    this.onWindowMessage = event => {
      /** Make sure this message is for us */
      if (event.data.sessionKey) {
        this.log('Component manager received message', event.data);
        this.handleMessage(this.componentForSessionKey(event.data.sessionKey), event.data);
      }
    };

    this.timeout = timeout || setTimeout.bind(window);
    this.itemManager = itemManager;
    this.syncService = syncService;
    this.alertService = alertService;
    this.environment = environment;
    this.platform = platform;
    this.configureForGeneralUsage();

    if (environment !== Environment.Mobile) {
      this.configureForNonMobileUsage();
    }
  }

  get isDesktop() {
    return this.environment === Environment.Desktop;
  }

  get isMobile() {
    return this.environment === Environment.Mobile;
  }

  get components() {
    return this.itemManager.getItems([content_types["a" /* ContentType */].Component, content_types["a" /* ContentType */].Theme]);
  }

  componentsForArea(area) {
    return this.components.filter(component => {
      return component.area === area;
    });
  }
  /** @override */


  deinit() {
    super.deinit();
    this.streamObservers.length = 0;
    this.contextStreamObservers.length = 0;
    this.activeComponents = undefined;
    this.permissionDialogs.length = 0;
    this.handlers.length = 0;
    this.itemManager = undefined;
    this.syncService = undefined;
    this.alertService = undefined;
    this.removeItemObserver();
    this.removeItemObserver = null;

    if (window && !this.isMobile) {
      window.removeEventListener('focus', this.detectFocusChange, true);
      window.removeEventListener('blur', this.detectFocusChange, true);
      window.removeEventListener('message', this.onWindowMessage);
    }
  }

  setDesktopManager(desktopManager) {
    this.desktopManager = desktopManager;
    this.configureForDesktop();
  }

  configureForGeneralUsage() {
    this.removeItemObserver = this.itemManager.addObserver(content_types["a" /* ContentType */].Any, (changed, inserted, discarded, source, sourceKey) => {
      const items = Object(utils["f" /* concatArrays */])(changed, inserted, discarded);
      const syncedComponents = items.filter(item => {
        return item.content_type === content_types["a" /* ContentType */].Component || item.content_type === content_types["a" /* ContentType */].Theme;
      });
      /**
       * We only want to sync if the item source is Retrieved, not RemoteSaved to avoid
       * recursion caused by the component being modified and saved after it is updated.
      */

      if (syncedComponents.length > 0 && source !== sources["a" /* PayloadSource */].RemoteSaved) {
        /* Ensure any component in our data is installed by the system */
        if (this.isDesktop) {
          this.desktopManager.syncComponentsInstallation(syncedComponents);
        }
      }

      for (const component of syncedComponents) {
        if (component.isEditor()) {
          /** Editors shouldn't get activated or deactivated */
          continue;
        }

        const isInActive = this.activeComponents[component.uuid];

        if (component.active && !component.deleted && !isInActive) {
          this.activateComponent(component.uuid);
        } else if (!component.active && isInActive) {
          this.deactivateComponent(component.uuid);
        }
      }
      /* LocalChanged is not interesting to send to observers. For local changes,
      we wait until the item is set to dirty before notifying observers, where the mapping
      source would be PayloadSource.LocalChanged */


      if (source !== sources["a" /* PayloadSource */].LocalChanged) {
        this.notifyStreamObservers(items, source, sourceKey);
      }
    });
  }

  notifyStreamObservers(allItems, source, sourceKey) {
    for (const observer of this.streamObservers) {
      if (sourceKey && sourceKey === observer.componentUuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }

      const relevantItems = allItems.filter(item => {
        return observer.contentTypes.indexOf(item.content_type) !== -1;
      });

      if (relevantItems.length === 0) {
        continue;
      }

      const requiredPermissions = [{
        name: ComponentAction.StreamItems,
        content_types: observer.contentTypes.sort()
      }];
      this.runWithPermissions(observer.componentUuid, requiredPermissions, () => {
        this.sendItemsInReply(observer.componentUuid, relevantItems, observer.originalMessage);
      });
    }

    const requiredContextPermissions = [{
      name: ComponentAction.StreamContextItem
    }];

    for (const observer of this.contextStreamObservers) {
      if (sourceKey && sourceKey === observer.componentUuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }

      for (const handler of this.handlers) {
        if (!handler.areas.includes(observer.area) && !handler.areas.includes(ComponentArea.Any)) {
          continue;
        }

        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(observer.componentUuid);

          if (itemInContext) {
            const matchingItem = find_default()(allItems, {
              uuid: itemInContext.uuid
            });

            if (matchingItem) {
              if (matchingItem.deleted) {
                continue;
              }

              this.runWithPermissions(observer.componentUuid, requiredContextPermissions, () => {
                this.sendContextItemInReply(observer.componentUuid, matchingItem, observer.originalMessage, source);
              });
            }
          }
        }
      }
    }
  }

  isNativeExtension(component) {
    const nativeUrls = [window._extensions_manager_location, window._batch_manager_location];
    const hostedUrl = component.hosted_url;
    const localUrl = component.local_url && component.local_url.replace(DESKTOP_URL_PREFIX, '');
    return nativeUrls.includes(hostedUrl) || nativeUrls.includes(localUrl);
  }

  configureForNonMobileUsage() {
    window.addEventListener ? window.addEventListener('focus', this.detectFocusChange, true) : window.attachEvent('onfocusout', this.detectFocusChange);
    window.addEventListener ? window.addEventListener('blur', this.detectFocusChange, true) : window.attachEvent('onblur', this.detectFocusChange);
    /* On mobile, events listeners are handled by a respective component */

    window.addEventListener('message', this.onWindowMessage);
  }

  configureForDesktop() {
    this.desktopManager.registerUpdateObserver(component => {
      /* Reload theme if active */
      if (component.active && component.isTheme()) {
        this.postActiveThemesToAllComponents();
      }
    });
  }

  postActiveThemesToAllComponents() {
    for (const component of this.components) {
      const componentState = this.findOrCreateDataForComponent(component.uuid);
      /* Skip over components that are themes themselves,
        or components that are not active, or components that don't have a window */

      if (component.isTheme() || !component.active || !componentState.window) {
        continue;
      }

      this.postActiveThemesToComponent(component);
    }
  }

  getActiveThemes() {
    if (this.environment === Environment.Mobile) {
      return this.componentsForArea(ComponentArea.Themes).filter(theme => {
        return theme.isMobileActive();
      });
    }

    return this.componentsForArea(ComponentArea.Themes).filter(theme => {
      return theme.active;
    });
  }

  urlsForActiveThemes() {
    const themes = this.getActiveThemes();
    const urls = [];

    for (const theme of themes) {
      const url = this.urlForComponent(theme);

      if (url) {
        urls.push(url);
      }
    }

    return urls;
  }

  postActiveThemesToComponent(component) {
    const urls = this.urlsForActiveThemes();
    const data = {
      themes: urls
    };
    const message = {
      action: ComponentAction.ActivateThemes,
      data: data
    };
    this.sendMessageToComponent(component, message);
  }

  contextItemDidChangeInArea(area) {
    for (const handler of this.handlers) {
      if (!handler.areas.includes(area) && !handler.areas.includes(ComponentArea.Any)) {
        continue;
      }

      const observers = this.contextStreamObservers.filter(observer => {
        return observer.area === area;
      });

      for (const observer of observers) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(observer.componentUuid);

          if (itemInContext) {
            this.sendContextItemInReply(observer.componentUuid, itemInContext, observer.originalMessage);
          }
        }
      }
    }
  }

  isComponentHidden(component) {
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    return componentState.hidden;
  }

  setComponentHidden(component, hidden) {
    /* A hidden component will not receive messages. However, when a component is unhidden,
     * we need to send it any items it may have registered streaming for. */
    const componentState = this.findOrCreateDataForComponent(component.uuid);

    if (hidden) {
      componentState.hidden = true;
    } else if (componentState.hidden) {
      componentState.hidden = false;
      const contextObserver = find_default()(this.contextStreamObservers, {
        identifier: component.uuid
      });

      if (contextObserver) {
        this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
      }

      const streamObserver = find_default()(this.streamObservers, {
        identifier: component.uuid
      });

      if (streamObserver) {
        this.handleStreamItemsMessage(component, streamObserver.originalMessage);
      }
    }
  }

  jsonForItem(item, component, source) {
    const isMetadatUpdate = source === sources["a" /* PayloadSource */].RemoteSaved || source === sources["a" /* PayloadSource */].LocalSaved || source === sources["a" /* PayloadSource */].PreSyncSave;
    /** The data all components store into */

    const componentData = item.getDomainData(ComponentDataDomain) || {};
    /** The data for this particular component */

    const clientData = componentData[component.getClientDataKey()] || {};
    const params = {
      uuid: item.uuid,
      content_type: item.content_type,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted: item.deleted,
      isMetadataUpdate: isMetadatUpdate,
      content: item.content,
      clientData: clientData
    };
    return this.removePrivatePropertiesFromResponseItems([params], component)[0];
  }

  sendItemsInReply(componentUuid, items, message, source) {
    const component = this.itemManager.findItem(componentUuid);
    this.log('Component manager send items in reply', component, items, message);
    const responseData = {};
    const mapped = items.map(item => {
      return this.jsonForItem(item, component, source);
    });
    responseData.items = mapped;
    this.replyToMessage(component, message, responseData);
  }

  sendContextItemInReply(componentUuid, item, originalMessage, source) {
    const component = this.itemManager.findItem(componentUuid);
    this.log('Component manager send context item in reply', component, item, originalMessage);
    const response = {
      item: this.jsonForItem(item, component, source)
    };
    this.replyToMessage(component, originalMessage, response);
  }

  replyToMessage(component, originalMessage, replyData) {
    const reply = {
      action: ComponentAction.Reply,
      original: originalMessage,
      data: replyData
    };
    this.sendMessageToComponent(component, reply);
  }

  sendMessageToComponent(component, message) {
    const permissibleActionsWhileHidden = [ComponentAction.ComponentRegistered, ComponentAction.ActivateThemes];
    const componentState = this.findOrCreateDataForComponent(component.uuid);

    if (componentState.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
      this.log('Component disabled for current item, ignoring messages.', component.name);
      return;
    }

    this.log('Component manager send message to component', component, message);
    let origin = this.urlForComponent(component);

    if (!origin || !componentState.window) {
      this.alertService.alert("Standard Notes is trying to communicate with ".concat(component.name, ",\n        but an error is occurring. Please restart this extension and try again."));
    }

    if (!origin.startsWith('http') && !origin.startsWith('file')) {
      /* Native extension running in web, prefix current host */
      origin = window.location.href + origin;
    }
    /* Mobile messaging requires json */


    componentState.window.postMessage(this.isMobile ? JSON.stringify(message) : message, origin);
  }

  urlForComponent(component) {
    /* offlineOnly is available only on desktop, and not on web or mobile. */
    if (component.offlineOnly && !this.isDesktop) {
      return null;
    }

    if (component.offlineOnly || this.isDesktop && component.local_url) {
      return component.local_url && component.local_url.replace(DESKTOP_URL_PREFIX, this.desktopManager.getExtServerHost());
    } else {
      let url = component.hosted_url || component.legacy_url;

      if (this.isMobile) {
        const localReplacement = this.platform === Platform.Ios ? LOCAL_HOST : ANDROID_LOCAL_HOST;
        url = url.replace(LOCAL_HOST, localReplacement).replace(CUSTOM_LOCAL_HOST, localReplacement);
      }

      return url;
    }
  }

  componentForUrl(url) {
    return this.components.filter(component => {
      return component.hosted_url === url || component.legacy_url === url;
    })[0];
  }

  sessionKeyForComponent(component) {
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    return componentState.sessionKey;
  }

  componentForSessionKey(key) {
    let component;

    for (const uuid of Object.keys(this.componentState)) {
      const data = this.componentState[uuid];

      if ((data === null || data === void 0 ? void 0 : data.sessionKey) === key) {
        component = this.components.find(c => c.uuid === uuid);
        break;
      }
    }

    if (!component) {
      for (const handler of this.handlers) {
        if (handler.componentForSessionKeyHandler) {
          component = handler.componentForSessionKeyHandler(key);

          if (component) {
            break;
          }
        }
      }
    }

    return component;
  }

  handleMessage(component, message) {
    if (!component) {
      this.log('Component not defined for message, returning', message);
      this.alertService.alert('An extension is trying to communicate with Standard Notes,' + 'but there is an error establishing a bridge. Please restart the app and try again.');
      return;
    }

    const readwriteActions = [ComponentAction.SaveItems, ComponentAction.AssociateItem, ComponentAction.DeassociateItem, ComponentAction.CreateItem, ComponentAction.CreateItems, ComponentAction.DeleteItems, ComponentAction.SetComponentData];
    const readonlyState = this.getReadonlyStateForComponent(component);

    if (readonlyState.readonly && readwriteActions.includes(message.action)) {
      this.alertService.alert("The extension ".concat(component.name, " is trying to save, but it is in a locked state and cannot accept changes."));
      return;
    }

    if (message.action === ComponentAction.StreamItems) {
      this.handleStreamItemsMessage(component, message);
    } else if (message.action === ComponentAction.StreamContextItem) {
      this.handleStreamContextItemMessage(component, message);
    } else if (message.action === ComponentAction.SetComponentData) {
      this.handleSetComponentDataMessage(component, message);
    } else if (message.action === ComponentAction.DeleteItems) {
      this.handleDeleteItemsMessage(component, message);
    } else if (message.action === ComponentAction.CreateItems || message.action === ComponentAction.CreateItem) {
      this.handleCreateItemsMessage(component, message);
    } else if (message.action === ComponentAction.SaveItems) {
      this.handleSaveItemsMessage(component, message);
    } else if (message.action === ComponentAction.ToggleActivateComponent) {
      const componentToToggle = this.itemManager.findItem(message.data.uuid);
      this.handleToggleComponentMessage(componentToToggle, message);
    } else if (message.action === ComponentAction.RequestPermissions) {
      this.handleRequestPermissionsMessage(component, message);
    } else if (message.action === ComponentAction.InstallLocalComponent) {
      this.handleInstallLocalComponentMessage(component, message);
    } else if (message.action === ComponentAction.DuplicateItem) {
      this.handleDuplicateItemMessage(component, message);
    }

    for (const handler of this.handlers) {
      if (handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes(ComponentArea.Any))) {
        this.timeout(() => {
          handler.actionHandler(component, message.action, message.data);
        });
      }
    }
  }

  removePrivatePropertiesFromResponseItems(responseItems, component) {
    let includeUrls = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (component && this.isNativeExtension(component)) {
      /* System extensions can bypass this step */
      return responseItems;
    }
    /* Don't allow component to overwrite these properties. */


    let privateContentProperties = ['autoupdateDisabled', 'permissions', 'active'];

    if (includeUrls) {
      privateContentProperties = privateContentProperties.concat(['url', 'hosted_url', 'local_url']);
    }

    return responseItems.map(responseItem => {
      if (!responseItem.content || typeof responseItem.content === 'string') {
        return responseItem;
      }

      const content = {};

      for (const [key, value] of Object.entries(responseItem.content)) {
        /** Only include non-private properties */
        if (!privateContentProperties.includes(key)) {
          content[key] = value;
        }
      }

      return component_manager_objectSpread(component_manager_objectSpread({}, responseItem), {}, {
        content
      });
    });
  }

  handleStreamItemsMessage(component, message) {
    const requiredPermissions = [{
      name: ComponentAction.StreamItems,
      content_types: message.data.content_types.sort()
    }];
    this.runWithPermissions(component.uuid, requiredPermissions, () => {
      if (!find_default()(this.streamObservers, {
        identifier: component.uuid
      })) {
        /* For pushing laster as changes come in */
        this.streamObservers.push({
          identifier: component.uuid,
          componentUuid: component.uuid,
          area: component.area,
          originalMessage: message,
          contentTypes: message.data.content_types
        });
      }
      /* Push immediately now */


      const items = [];

      for (const contentType of message.data.content_types) {
        Object(utils["j" /* extendArray */])(items, this.itemManager.nonErroredItemsForContentType(contentType));
      }

      this.sendItemsInReply(component.uuid, items, message);
    });
  }

  handleStreamContextItemMessage(component, message) {
    const requiredPermissions = [{
      name: ComponentAction.StreamContextItem
    }];
    this.runWithPermissions(component.uuid, requiredPermissions, () => {
      if (!find_default()(this.contextStreamObservers, {
        identifier: component.uuid
      })) {
        this.contextStreamObservers.push({
          identifier: component.uuid,
          componentUuid: component.uuid,
          area: component.area,
          originalMessage: message
        });
      }

      for (const handler of this.handlersForArea(component.area)) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(component.uuid);

          if (itemInContext) {
            this.sendContextItemInReply(component.uuid, itemInContext, message);
          }
        }
      }
    });
  }

  isItemIdWithinComponentContextJurisdiction(uuid, component) {
    const itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    return itemIdsInJurisdiction.includes(uuid);
  }
  /* Returns items that given component has context permissions for */


  itemIdsInContextJurisdictionForComponent(component) {
    const itemIds = [];

    for (const handler of this.handlersForArea(component.area)) {
      if (handler.contextRequestHandler) {
        const itemInContext = handler.contextRequestHandler(component.uuid);

        if (itemInContext) {
          itemIds.push(itemInContext.uuid);
        }
      }
    }

    return itemIds;
  }

  handlersForArea(area) {
    return this.handlers.filter(candidate => {
      return candidate.areas.includes(area);
    });
  }

  async handleSaveItemsMessage(component, message) {
    let responsePayloads = message.data.items;
    const requiredPermissions = [];
    const itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    /* Pending as in needed to be accounted for in permissions. */

    const pendingResponseItems = responsePayloads.slice();

    for (const responseItem of responsePayloads.slice()) {
      if (itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
        requiredPermissions.push({
          name: ComponentAction.StreamContextItem
        });
        Object(utils["B" /* removeFromArray */])(pendingResponseItems, responseItem);
        /* We break because there can only be one context item */

        break;
      }
    }
    /* Check to see if additional privileges are required */


    if (pendingResponseItems.length > 0) {
      const requiredContentTypes = uniq_default()(pendingResponseItems.map(item => {
        return item.content_type;
      })).sort();
      requiredPermissions.push({
        name: ComponentAction.StreamItems,
        content_types: requiredContentTypes
      });
    }

    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      responsePayloads = this.removePrivatePropertiesFromResponseItems(responsePayloads, component, true);
      /* Filter locked items */

      const uuids = Object(functions["b" /* Uuids */])(responsePayloads);
      const items = this.itemManager.findItems(uuids, true);
      let lockedCount = 0;
      let lockedNoteCount = 0;
      items.forEach((item, index) => {
        if (!item) {
          const responseItem = responsePayloads[index]; // An item this extension is trying to save was possibly removed locally, notify user

          this.alertService.alert("The extension ".concat(component.name, " is trying to save an item with type ") + "".concat(responseItem.content_type, ", but that item does not exist .") + "Please restart this extension and try again.");
          return;
        }

        if (item.locked) {
          remove_default()(responsePayloads, {
            uuid: item.uuid
          });
          lockedCount++;

          if (item.content_type === content_types["a" /* ContentType */].Note) {
            lockedNoteCount++;
          }
        }
      });

      if (lockedNoteCount === 1) {
        this.alertService.alert("The note you are attempting to save is locked and cannot be edited.", 'Note Locked');
        return;
      } else if (lockedCount > 0) {
        const itemNoun = lockedCount === 1 ? 'item' : lockedNoteCount === lockedCount ? 'notes' : 'items';
        const auxVerb = lockedCount === 1 ? 'is' : 'are';
        this.alertService.alert("".concat(lockedCount, " ").concat(itemNoun, " you are attempting to save ").concat(auxVerb, " locked and cannot be edited."), 'Items Locked');
        return;
      }

      const payloads = responsePayloads.map(responseItem => {
        return Object(generator["f" /* CreateSourcedPayloadFromObject */])(responseItem, sources["a" /* PayloadSource */].ComponentRetrieved);
      });
      await this.itemManager.changeItems(uuids, mutator => {
        const payload = Object(utils["D" /* searchArray */])(payloads, {
          uuid: mutator.getUuid()
        });
        mutator.mergePayload(payload);
        const responseItem = Object(utils["D" /* searchArray */])(responsePayloads, {
          uuid: mutator.getUuid()
        });

        if (responseItem.clientData) {
          const allComponentData = Object(utils["a" /* Copy */])(mutator.getItem().getDomainData(ComponentDataDomain) || {});
          allComponentData[component.getClientDataKey()] = responseItem.clientData;
          mutator.setDomainData(allComponentData, ComponentDataDomain);
        }
      }, core_item["c" /* MutationType */].UserInteraction, sources["a" /* PayloadSource */].ComponentRetrieved, component.uuid);
      this.syncService.sync().then(() => {
        /* Allow handlers to be notified when a save begins and ends, to update the UI */
        const saveMessage = Object.assign({}, message);
        saveMessage.action = ComponentAction.SaveSuccess;
        this.replyToMessage(component, message, {});
        this.handleMessage(component, saveMessage);
      }).catch(() => {
        const saveMessage = Object.assign({}, message);
        saveMessage.action = ComponentAction.SaveError;
        this.replyToMessage(component, message, {
          error: ComponentAction.SaveError
        });
        this.handleMessage(component, saveMessage);
      });
    });
  }

  handleDuplicateItemMessage(component, message) {
    const itemParams = message.data.item;
    const item = this.itemManager.findItem(itemParams.uuid);
    const requiredPermissions = [{
      name: ComponentAction.StreamItems,
      content_types: [item.content_type]
    }];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      const duplicate = await this.itemManager.duplicateItem(item.uuid);
      this.syncService.sync();
      this.replyToMessage(component, message, {
        item: this.jsonForItem(duplicate, component)
      });
    });
  }

  handleCreateItemsMessage(component, message) {
    let responseItems = message.data.item ? [message.data.item] : message.data.items;
    const uniqueContentTypes = uniq_default()(responseItems.map(item => {
      return item.content_type;
    }));
    const requiredPermissions = [{
      name: ComponentAction.StreamItems,
      content_types: uniqueContentTypes
    }];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      responseItems = this.removePrivatePropertiesFromResponseItems(responseItems, component);
      const processedItems = [];

      for (const responseItem of responseItems) {
        if (!responseItem.uuid) {
          responseItem.uuid = await uuid_Uuid.GenerateUuid();
        }

        const payload = Object(generator["f" /* CreateSourcedPayloadFromObject */])(responseItem, sources["a" /* PayloadSource */].ComponentCreated);
        const template = CreateItemFromPayload(payload);
        const item = await this.itemManager.insertItem(template);
        await this.itemManager.changeItem(item.uuid, mutator => {
          if (responseItem.clientData) {
            const allComponentData = Object(utils["a" /* Copy */])(item.getDomainData(ComponentDataDomain) || {});
            allComponentData[component.getClientDataKey()] = responseItem.clientData;
            mutator.setDomainData(allComponentData, ComponentDataDomain);
          }
        }, core_item["c" /* MutationType */].UserInteraction, sources["a" /* PayloadSource */].ComponentCreated, component.uuid);
        processedItems.push(item);
      }

      this.syncService.sync();
      const reply = message.action === ComponentAction.CreateItem ? {
        item: this.jsonForItem(processedItems[0], component)
      } : {
        items: processedItems.map(item => {
          return this.jsonForItem(item, component);
        })
      };
      this.replyToMessage(component, message, reply);
    });
  }

  handleDeleteItemsMessage(component, message) {
    const requiredContentTypes = uniq_default()(message.data.items.map(item => {
      return item.content_type;
    })).sort();
    const requiredPermissions = [{
      name: ComponentAction.StreamItems,
      content_types: requiredContentTypes
    }];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      const itemsData = message.data.items;
      const noun = itemsData.length === 1 ? 'item' : 'items';
      let reply = null;
      const didConfirm = await this.alertService.confirm("Are you sure you want to delete ".concat(itemsData.length, " ").concat(noun, "?"));

      if (didConfirm) {
        /* Filter for any components and deactivate before deleting */
        for (const itemData of itemsData) {
          const item = this.itemManager.findItem(itemData.uuid);

          if (!item) {
            this.alertService.alert('The item you are trying to delete cannot be found.');
            continue;
          }

          if ([content_types["a" /* ContentType */].Component, content_types["a" /* ContentType */].Theme].includes(item.content_type)) {
            await this.deactivateComponent(item.uuid);
          }

          await this.itemManager.setItemToBeDeleted(item.uuid);
        }

        this.syncService.sync();
        reply = {
          deleted: true
        };
      } else {
        /* Rejected by user */
        reply = {
          deleted: false
        };
      }

      this.replyToMessage(component, message, reply);
    });
  }

  handleRequestPermissionsMessage(component, message) {
    this.runWithPermissions(component.uuid, message.data.permissions, () => {
      this.replyToMessage(component, message, {
        approved: true
      });
    });
  }

  handleSetComponentDataMessage(component, message) {
    /* A component setting its own data does not require special permissions */
    this.runWithPermissions(component.uuid, [], async () => {
      await this.itemManager.changeComponent(component.uuid, mutator => {
        mutator.componentData = message.data.componentData;
      });
      this.syncService.sync();
    });
  }

  async handleToggleComponentMessage(targetComponent, message) {
    await this.toggleComponent(targetComponent);
    this.syncService.sync();
  }

  async toggleComponent(component) {
    if (component.area === ComponentArea.Modal) {
      this.openModalComponent(component);
    } else {
      if (component.active) {
        await this.deactivateComponent(component.uuid);
      } else {
        if (component.content_type === content_types["a" /* ContentType */].Theme) {
          const theme = component;
          /* Deactive currently active theme if new theme is not layerable */

          const activeThemes = this.getActiveThemes();
          /* Activate current before deactivating others, so as not to flicker */

          await this.activateComponent(component.uuid);

          if (!theme.isLayerable()) {
            await Object(utils["E" /* sleep */])(10);

            for (const candidate of activeThemes) {
              if (candidate && !candidate.isLayerable()) {
                await this.deactivateComponent(candidate.uuid);
              }
            }
          }
        } else {
          await this.activateComponent(component.uuid);
        }
      }
    }
  }

  handleInstallLocalComponentMessage(sourceComponent, message) {
    /* Only native extensions have this permission */
    if (!this.isNativeExtension(sourceComponent)) {
      return;
    }

    const targetComponent = this.itemManager.findItem(message.data.uuid);
    this.desktopManager.installComponent(targetComponent);
  }

  runWithPermissions(componentUuid, requiredPermissions, runFunction) {
    const component = this.itemManager.findItem(componentUuid);
    /* Make copy as not to mutate input values */

    requiredPermissions = Object(utils["a" /* Copy */])(requiredPermissions);
    const acquiredPermissions = component.permissions;

    for (const required of requiredPermissions.slice()) {
      /* Remove anything we already have */
      const respectiveAcquired = acquiredPermissions.find(candidate => candidate.name === required.name);

      if (!respectiveAcquired) {
        continue;
      }
      /* We now match on name, lets substract from required.content_types anything we have in acquired. */


      const requiredContentTypes = required.content_types;

      if (!requiredContentTypes) {
        /* If this permission does not require any content types (i.e stream-context-item)
          then we can remove this from required since we match by name (respectiveAcquired.name === required.name) */
        Object(utils["k" /* filterFromArray */])(requiredPermissions, required);
        continue;
      }

      for (const acquiredContentType of respectiveAcquired.content_types) {
        Object(utils["B" /* removeFromArray */])(requiredContentTypes, acquiredContentType);
      }

      if (requiredContentTypes.length === 0) {
        /* We've removed all acquired and end up with zero, means we already have all these permissions */
        Object(utils["k" /* filterFromArray */])(requiredPermissions, required);
      }
    }

    if (requiredPermissions.length > 0) {
      this.promptForPermissions(component, requiredPermissions, async approved => {
        if (approved) {
          runFunction();
        }
      });
    } else {
      runFunction();
    }
  }

  promptForPermissions(component, permissions, callback) {
    const params = {
      component: component,
      permissions: permissions,
      permissionsString: this.permissionsStringForPermissions(permissions, component),
      actionBlock: callback,
      callback: async approved => {
        if (approved) {
          this.log("Changing component to expand permissions", component);
          await this.itemManager.changeItem(component.uuid, m => {
            const componentPermissions = Object(utils["a" /* Copy */])(component.permissions);

            for (const permission of permissions) {
              const matchingPermission = componentPermissions.find(candidate => candidate.name === permission.name);

              if (!matchingPermission) {
                componentPermissions.push(permission);
              } else {
                /* Permission already exists, but content_types may have been expanded */
                const contentTypes = matchingPermission.content_types || [];
                matchingPermission.content_types = uniq_default()(contentTypes.concat(permission.content_types));
              }
            }

            const mutator = m;
            mutator.permissions = componentPermissions;
          });
          this.syncService.sync();
        }

        this.permissionDialogs = this.permissionDialogs.filter(pendingDialog => {
          /* Remove self */
          if (pendingDialog === params) {
            pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            return false;
          }

          const containsObjectSubset = (source, target) => {
            return !target.some(val => !source.find(candidate => JSON.stringify(candidate) === JSON.stringify(val)));
          };

          if (pendingDialog.component === component) {
            /* remove pending dialogs that are encapsulated by already approved permissions, and run its function */
            if (pendingDialog.permissions === permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
              /* If approved, run the action block. Otherwise, if canceled, cancel any
              pending ones as well, since the user was explicit in their intentions */
              if (approved) {
                pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              }

              return false;
            }
          }

          return true;
        });

        if (this.permissionDialogs.length > 0) {
          this.presentPermissionsDialog(this.permissionDialogs[0]);
        }
      }
    };
    /**
     * Since these calls are asyncronous, multiple dialogs may be requested at the same time.
     * We only want to present one and trigger all callbacks based on one modal result
     */

    const existingDialog = find_default()(this.permissionDialogs, {
      component: component
    });
    this.permissionDialogs.push(params);

    if (!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      this.log('Existing dialog, not presenting.');
    }
  }

  presentPermissionsDialog(dialog) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  openModalComponent(component) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  registerHandler(handler) {
    this.handlers.push(handler);
    return () => {
      const matching = find_default()(this.handlers, {
        identifier: handler.identifier
      });

      if (!matching) {
        this.log('Attempting to deregister non-existing handler');
        return;
      }

      Object(utils["B" /* removeFromArray */])(this.handlers, matching);
    };
  }

  findOrCreateDataForComponent(componentUuid) {
    let data = this.componentState[componentUuid];

    if (!data) {
      data = {};
      this.componentState[componentUuid] = data;
    }

    return data;
  }

  setReadonlyStateForComponent(component, readonly) {
    let lockReadonly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const data = this.findOrCreateDataForComponent(component.uuid);
    data.readonly = readonly;
    data.lockReadonly = lockReadonly;
  }

  getReadonlyStateForComponent(component) {
    const data = this.findOrCreateDataForComponent(component.uuid);
    return {
      readonly: data.readonly,
      lockReadonly: data.lockReadonly
    };
  }
  /** Called by other views when the iframe is ready */


  async registerComponentWindow(component, componentWindow) {
    this.log('Register component window', component);
    const data = this.findOrCreateDataForComponent(component.uuid);

    if (data.window === componentWindow) {
      this.log('Web|componentManager', 'attempting to re-register same component window.');
    }

    this.log('Web|componentManager|registerComponentWindow', component);
    data.window = componentWindow;
    data.sessionKey = await uuid_Uuid.GenerateUuid();
    this.sendMessageToComponent(component, {
      action: ComponentAction.ComponentRegistered,
      sessionKey: data.sessionKey,
      componentData: component.componentData,
      data: {
        uuid: component.uuid,
        environment: environmentToString(this.environment),
        platform: platformToString(this.platform),
        activeThemeUrls: this.urlsForActiveThemes()
      }
    });
    this.postActiveThemesToComponent(component);

    if (this.desktopManager) {
      this.desktopManager.notifyComponentActivation(component);
    }
  }

  registerComponent(uuid) {
    this.log('Registering component', uuid);
    const component = this.itemManager.findItem(uuid);
    this.activeComponents[uuid] = component.area;

    for (const handler of this.handlers) {
      if (handler.areas.includes(component.area) || handler.areas.includes(ComponentArea.Any)) {
        var _handler$activationHa;

        (_handler$activationHa = handler.activationHandler) === null || _handler$activationHa === void 0 ? void 0 : _handler$activationHa.call(handler, uuid, component);
      }
    }

    if (component.area === ComponentArea.Themes) {
      this.postActiveThemesToAllComponents();
    }
  }

  async activateComponent(uuid) {
    this.log('Activating component', uuid);
    const component = this.itemManager.findItem(uuid);

    if (!component.active) {
      await this.itemManager.changeComponent(component.uuid, mutator => {
        mutator.active = true;
      });
    }

    this.registerComponent(uuid);
  }

  deregisterComponent(uuid) {
    this.log('Degregistering component', uuid);
    const component = this.itemManager.findItem(uuid);
    delete this.componentState[uuid];
    const area = this.activeComponents[uuid];
    delete this.activeComponents[uuid];

    if (area) {
      for (const handler of this.handlers) {
        if (handler.areas.includes(area) || handler.areas.includes(ComponentArea.Any)) {
          var _handler$activationHa2;

          (_handler$activationHa2 = handler.activationHandler) === null || _handler$activationHa2 === void 0 ? void 0 : _handler$activationHa2.call(handler, uuid, component);
        }
      }
    }

    this.streamObservers = this.streamObservers.filter(o => {
      return o.componentUuid !== uuid;
    });
    this.contextStreamObservers = this.contextStreamObservers.filter(o => {
      return o.componentUuid !== uuid;
    });

    if (area === ComponentArea.Themes) {
      this.postActiveThemesToAllComponents();
    }
  }

  async deactivateComponent(uuid) {
    var _this$itemManager;

    this.log('Deactivating component', uuid);
    const component = (_this$itemManager = this.itemManager) === null || _this$itemManager === void 0 ? void 0 : _this$itemManager.findItem(uuid);

    if (component === null || component === void 0 ? void 0 : component.active) {
      await this.itemManager.changeComponent(component.uuid, mutator => {
        mutator.active = false;
      });
    }

    this.findOrCreateDataForComponent(uuid).sessionKey = undefined;
    this.deregisterComponent(uuid);
  }

  async reloadComponent(uuid) {
    var _this$itemManager2;

    this.log('Reloading component', uuid);
    /* Do soft deactivate */

    const component = (_this$itemManager2 = this.itemManager) === null || _this$itemManager2 === void 0 ? void 0 : _this$itemManager2.findItem(uuid);
    await this.itemManager.changeComponent(component.uuid, mutator => {
      mutator.active = false;
    });
    this.deregisterComponent(component.uuid);
    /* Do soft activate */

    return new Promise(resolve => {
      this.timeout(async () => {
        await this.itemManager.changeComponent(component.uuid, mutator => {
          mutator.active = true;
        });
        this.registerComponent(component.uuid);
        resolve();
      });
    });
  }

  async deleteComponent(uuid) {
    await this.itemManager.setItemToBeDeleted(uuid);
    this.syncService.sync();
  }

  isComponentActive(component) {
    return component.active;
  }

  iframeForComponent(uuid) {
    const iframes = Array.from(document.getElementsByTagName('iframe'));

    for (const frame of iframes) {
      const componentId = frame.dataset.componentId;

      if (componentId === uuid) {
        return frame;
      }
    }
  }

  focusChangedForComponent(component) {
    const focused = document.activeElement === this.iframeForComponent(component.uuid);

    for (const handler of this.handlers) {
      /* Notify all handlers, and not just ones that match this component type */
      handler.focusHandler && handler.focusHandler(component, focused);
    }
  }

  handleSetSizeEvent(component, data) {
    const setSize = (element, size) => {
      const widthString = Object(utils["s" /* isString */])(size.width) ? size.width : "".concat(data.width, "px");
      const heightString = Object(utils["s" /* isString */])(size.height) ? size.height : "".concat(data.height, "px");

      if (element) {
        element.setAttribute('style', "width:".concat(widthString, "; height:").concat(heightString, ";"));
      }
    };

    if (component.area === ComponentArea.Rooms || component.area === ComponentArea.Modal) {
      const selector = component.area === ComponentArea.Rooms ? 'inner' : 'outer';
      const content = document.getElementById("component-content-".concat(selector, "-").concat(component.uuid));

      if (content) {
        setSize(content, data);
      }
    } else {
      const iframe = this.iframeForComponent(component.uuid);

      if (!iframe) {
        return;
      }

      setSize(iframe, data);
      /**
       * On Firefox, resizing a component iframe does not seem to have an effect with
       * editor-stack extensions. Sizing the parent does the trick, however, we can't do
       * this globally, otherwise, areas like the note-tags will not be able to expand
       * outside of the bounds (to display autocomplete, for example).
       */

      if (component.area === ComponentArea.EditorStack) {
        const parent = iframe.parentElement;

        if (parent) {
          setSize(parent, data);
        }
      }
    }
  }

  editorForNote(note) {
    const editors = this.componentsForArea(ComponentArea.Editor);

    for (const editor of editors) {
      if (editor.isExplicitlyEnabledForItem(note.uuid)) {
        return editor;
      }
    }

    let defaultEditor;
    /* No editor found for note. Use default editor, if note does not prefer system editor */

    if (this.isMobile) {
      if (!note.mobilePrefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    } else {
      if (!note.prefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    }

    if (defaultEditor && !defaultEditor.isExplicitlyDisabledForItem(note.uuid)) {
      return defaultEditor;
    } else {
      return undefined;
    }
  }

  getDefaultEditor() {
    const editors = this.componentsForArea(ComponentArea.Editor);

    if (this.isMobile) {
      return editors.filter(e => {
        return e.isMobileDefault;
      })[0];
    } else {
      return editors.filter(e => e.isDefaultEditor())[0];
    }
  }

  permissionsStringForPermissions(permissions, component) {
    let finalString = '';
    const permissionsCount = permissions.length;

    const addSeparator = (index, length) => {
      if (index > 0) {
        if (index === length - 1) {
          if (length === 2) {
            return ' and ';
          } else {
            return ', and ';
          }
        } else {
          return ', ';
        }
      }

      return '';
    };

    permissions.forEach((permission, index) => {
      if (permission.name === ComponentAction.StreamItems) {
        const types = permission.content_types.map(type => {
          const desc = Object(content_types["c" /* displayStringForContentType */])(type);

          if (desc) {
            return desc + 's';
          } else {
            return 'items of type ' + type;
          }
        });
        let typesString = '';

        for (let i = 0; i < types.length; i++) {
          const type = types[i];
          typesString += addSeparator(i, types.length + permissionsCount - index - 1);
          typesString += type;
        }

        finalString += addSeparator(index, permissionsCount);
        finalString += typesString;

        if (types.length >= 2 && index < permissionsCount - 1) {
          /* If you have a list of types, and still an additional root-level
             permission coming up, add a comma */
          finalString += ', ';
        }
      } else if (permission.name === ComponentAction.StreamContextItem) {
        const mapping = {
          [ComponentArea.EditorStack]: 'working note',
          [ComponentArea.NoteTags]: 'working note',
          [ComponentArea.Editor]: 'working note'
        };
        finalString += addSeparator(index, permissionsCount);
        finalString += mapping[component.area];
      }
    });
    return finalString + '.';
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/delta.ts
/**
 * A payload delta is a class that defines instructions that process an incoming collection
 * of payloads, applies some set of operations on those payloads wrt to the current base state,
 * and returns the resulting collection. Deltas are purely functional and do not modify
 * input data, instead returning what the collection would look like after its been
 * transformed. The consumer may choose to act as they wish with this end result.
 *
 * A delta object takes a baseCollection (the current state of the data) and an applyCollection
 * (the data another source is attempting to merge on top of our base data). The delta will
 * then iterate over this data and return a `resultingCollection` object that includes the final
 * state of the data after the class-specific operations have been applied.
 *
 * For example, the RemoteRetrieved delta will take the current state of local data as
 * baseCollection, the data the server is sending as applyCollection, and determine what
 * the end state of the data should look like.
 */
class PayloadsDelta {
  /**
   * @param baseCollection The authoratitive collection on top of which to compute changes.
   * @param applyCollection The collection of payloads to apply, from one given source only.
   * @param relatedCollectionSet A collection set (many collections) that contain payloads
   *                             that may be neccessary to carry out computation.
   */
  constructor(baseCollection, applyCollection, relatedCollectionSet) {
    this.baseCollection = baseCollection;
    this.applyCollection = applyCollection;
    this.relatedCollectionSet = relatedCollectionSet;
  }

  async resultingCollection() {
    throw 'Must override PayloadDelta.resultingCollection.';
  }
  /**
   * @param {string} id  - The uuid of the payload to find
   */


  findBasePayload(id) {
    return this.baseCollection.find(id);
  }

  findRelatedPayload(id, source) {
    var _this$relatedCollecti;

    const collection = (_this$relatedCollecti = this.relatedCollectionSet) === null || _this$relatedCollecti === void 0 ? void 0 : _this$relatedCollecti.collectionForSource(source);
    return collection === null || collection === void 0 ? void 0 : collection.find(id);
  }

}
// CONCATENATED MODULE: ./lib/protocol/collection/uuid_map.ts

class uuid_map_UuidMap {
  constructor() {
    /** uuid to uuids that we have a relationship with */
    this.directMap = {};
    /** uuid to uuids that have a relationship with us */

    this.inverseMap = {};
  }

  makeCopy() {
    const copy = new uuid_map_UuidMap();
    copy.directMap = Object.assign({}, this.directMap);
    copy.inverseMap = Object.assign({}, this.inverseMap);
    return copy;
  }

  getDirectRelationships(uuid) {
    return this.directMap[uuid] || [];
  }

  getInverseRelationships(uuid) {
    return this.inverseMap[uuid] || [];
  }

  establishRelationship(uuidA, uuidB) {
    this.establishDirectRelationship(uuidA, uuidB);
    this.establishInverseRelationship(uuidA, uuidB);
  }

  deestablishRelationship(uuidA, uuidB) {
    this.deestablishDirectRelationship(uuidA, uuidB);
    this.deestablishInverseRelationship(uuidA, uuidB);
  }

  setAllRelationships(uuid, relationships) {
    const previousDirect = this.directMap[uuid] || [];
    this.directMap[uuid] = relationships;
    /** Remove all previous values in case relationships have changed
     * The updated references will be added afterwards.
    */

    for (const previousRelationship of previousDirect) {
      this.deestablishInverseRelationship(uuid, previousRelationship);
    }
    /** Now map current relationships */


    for (const newRelationship of relationships) {
      this.establishInverseRelationship(uuid, newRelationship);
    }
  }

  removeFromMap(uuid) {
    /** Items that we reference */
    const directReferences = this.directMap[uuid] || [];

    for (const directReference of directReferences) {
      Object(utils["B" /* removeFromArray */])(this.inverseMap[directReference] || [], uuid);
    }

    delete this.directMap[uuid];
    /** Items that are referencing us */

    const inverseReferences = this.inverseMap[uuid] || [];

    for (const inverseReference of inverseReferences) {
      Object(utils["B" /* removeFromArray */])(this.directMap[inverseReference] || [], uuid);
    }

    delete this.inverseMap[uuid];
  }

  establishDirectRelationship(uuidA, uuidB) {
    const index = this.directMap[uuidA] || [];
    Object(utils["b" /* addIfUnique */])(index, uuidB);
    this.directMap[uuidA] = index;
  }

  establishInverseRelationship(uuidA, uuidB) {
    const inverseIndex = this.inverseMap[uuidB] || [];
    Object(utils["b" /* addIfUnique */])(inverseIndex, uuidA);
    this.inverseMap[uuidB] = inverseIndex;
  }

  deestablishDirectRelationship(uuidA, uuidB) {
    const index = this.directMap[uuidA] || [];
    Object(utils["B" /* removeFromArray */])(index, uuidB);
    this.directMap[uuidA] = index;
  }

  deestablishInverseRelationship(uuidA, uuidB) {
    const inverseIndex = this.inverseMap[uuidB] || [];
    Object(utils["B" /* removeFromArray */])(inverseIndex, uuidA);
    this.inverseMap[uuidB] = inverseIndex;
  }

}
// CONCATENATED MODULE: ./lib/protocol/collection/collection.ts



class collection_MutableCollection {
  constructor() {
    let copy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let mapCopy = arguments.length > 1 ? arguments[1] : undefined;
    let typedMapCopy = arguments.length > 2 ? arguments[2] : undefined;
    let referenceMapCopy = arguments.length > 3 ? arguments[3] : undefined;
    let conflictMapCopy = arguments.length > 4 ? arguments[4] : undefined;
    this.map = {};
    this.typedMap = ({} = {});
    /** An array of uuids of items that are dirty */

    this.dirtyIndex = new Set();
    /** An array of uuids of items that are errorDecrypting or waitingForKey */

    this.invalidsIndex = new Set();
    /** An array of uuids of items that are not marked as deleted */

    this.nondeletedIndex = new Set();

    if (copy) {
      this.map = mapCopy;
      this.typedMap = typedMapCopy;
      this.referenceMap = referenceMapCopy;
      this.conflictMap = conflictMapCopy;
    } else {
      this.referenceMap = new uuid_map_UuidMap();
      this.conflictMap = new uuid_map_UuidMap();
    }
  }

  uuids() {
    return Object.keys(this.map);
  }

  all(contentType) {
    if (contentType) {
      if (Array.isArray(contentType)) {
        const elements = [];

        for (const type of contentType) {
          Object(utils["j" /* extendArray */])(elements, this.typedMap[type] || []);
        }

        return elements;
      } else {
        var _this$typedMap$conten;

        return ((_this$typedMap$conten = this.typedMap[contentType]) === null || _this$typedMap$conten === void 0 ? void 0 : _this$typedMap$conten.slice()) || [];
      }
    } else {
      return Object.keys(this.map).map(uuid => {
        return this.map[uuid];
      });
    }
  }

  find(uuid) {
    return this.map[uuid];
  }
  /** Returns all elements that are marked as dirty */


  dirtyElements() {
    const uuids = Array.from(this.dirtyIndex);
    return this.findAll(uuids);
  }
  /** Returns all elements that are errorDecrypting or waitingForKey */


  invalidElements() {
    const uuids = Array.from(this.invalidsIndex);
    return this.findAll(uuids);
  }
  /** Returns all elements that are not marked as deleted */


  nondeletedElements() {
    const uuids = Array.from(this.nondeletedIndex);
    return this.findAll(uuids);
  }
  /**
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */


  findAll(uuids) {
    let includeBlanks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const results = [];

    for (const id of uuids) {
      const element = this.map[id];

      if (element || includeBlanks) {
        results.push(element);
      }
    }

    return results;
  }

  set(elements) {
    elements = Array.isArray(elements) ? elements : [elements];

    if (elements.length === 0) {
      console.warn('Attempting to set 0 elements onto collection');
      return;
    }

    for (const element of elements) {
      this.map[element.uuid] = element;
      this.setToTypedMap(element);
      /** Dirty index */

      if (element.dirty) {
        this.dirtyIndex.add(element.uuid);
      } else {
        this.dirtyIndex.delete(element.uuid);
      }
      /** Invalids index */


      if (element.errorDecrypting || element.waitingForKey) {
        this.invalidsIndex.add(element.uuid);
      } else {
        this.invalidsIndex.delete(element.uuid);
      }

      if (element.deleted) {
        this.referenceMap.removeFromMap(element.uuid);
        this.nondeletedIndex.delete(element.uuid);
      } else {
        this.nondeletedIndex.add(element.uuid);
        const conflictOf = element.safeContent.conflict_of;

        if (conflictOf) {
          this.conflictMap.establishRelationship(conflictOf, element.uuid);
        }

        this.referenceMap.setAllRelationships(element.uuid, element.references.map(r => r.uuid));
      }
    }
  }

  discard(elements) {
    elements = Array.isArray(elements) ? elements : [elements];

    for (const element of elements) {
      this.conflictMap.removeFromMap(element.uuid);
      this.referenceMap.removeFromMap(element.uuid);
      this.deleteFromTypedMap(element);
      delete this.map[element.uuid];
    }
  }

  setToTypedMap(element) {
    const array = this.typedMap[element.content_type] || [];
    remove_default()(array, {
      uuid: element.uuid
    });
    array.push(element);
    this.typedMap[element.content_type] = array;
  }

  deleteFromTypedMap(element) {
    const array = this.typedMap[element.content_type] || [];
    remove_default()(array, {
      uuid: element.uuid
    });
    this.typedMap[element.content_type] = array;
  }

  uuidsThatReferenceUuid(uuid) {
    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid string');
    }

    return this.referenceMap.getInverseRelationships(uuid);
  }

  elementsReferencingElement(element) {
    const uuids = this.uuidsThatReferenceUuid(element.uuid);
    return this.findAll(uuids);
  }

  referencesForElement(element) {
    const uuids = this.referenceMap.getDirectRelationships(element.uuid);
    return this.findAll(uuids);
  }

  conflictsOf(uuid) {
    const uuids = this.conflictMap.getDirectRelationships(uuid);
    return this.findAll(uuids);
  }

}
// CONCATENATED MODULE: ./lib/protocol/collection/payload_collection.ts

/**
 * A collection of payloads coming from a single source.
 */

class payload_collection_ImmutablePayloadCollection extends collection_MutableCollection {
  /** We don't use a constructor for this because we don't want the constructor to have
   * side-effects, such as calling collection.set(). */
  static WithPayloads() {
    let payloads = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    let source = arguments.length > 1 ? arguments[1] : undefined;
    const collection = new payload_collection_ImmutablePayloadCollection();
    collection.source = source;

    if (payloads.length > 0) {
      collection.set(payloads);
    }

    Object.freeze(collection);
    return collection;
  }

  static FromCollection(collection) {
    const mapCopy = Object.freeze(Object.assign({}, collection.map));
    const typedMapCopy = Object.freeze(Object.assign({}, collection.typedMap));
    const referenceMapCopy = Object.freeze(collection.referenceMap.makeCopy());
    const conflictMapCopy = Object.freeze(collection.conflictMap.makeCopy());
    const result = new payload_collection_ImmutablePayloadCollection(true, mapCopy, typedMapCopy, referenceMapCopy, conflictMapCopy);
    Object.freeze(result);
    return result;
  }

  get payloads() {
    return this.all();
  }

}
// CONCATENATED MODULE: ./lib/models/index.ts















// CONCATENATED MODULE: ./lib/protocol/payloads/functions.ts
function functions_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function functions_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { functions_ownKeys(Object(source), true).forEach(function (key) { functions_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { functions_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function functions_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }










function NoteDuplicationAffectedPayloads(basePayload, duplicatePayload, baseCollection) {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection.all(content_types["a" /* ContentType */].Component).map(payload => {
    return CreateItemFromPayload(payload);
  });
  const editor = components.filter(c => c.area === ComponentArea.Editor).find(e => {
    return e.isExplicitlyEnabledForItem(basePayload.uuid);
  });

  if (!editor) {
    return undefined;
  }
  /** Modify the editor to include new note */


  const mutator = new component_ComponentMutator(editor, core_item["c" /* MutationType */].Internal);
  mutator.associateWithItem(duplicatePayload.uuid);
  const result = mutator.getResult();
  return [result];
}

const AffectorMapping = {
  [content_types["a" /* ContentType */].Note]: NoteDuplicationAffectedPayloads
};
/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */

async function PayloadsByDuplicating(payload, baseCollection, isConflict) {
  const results = [];
  const override = {
    uuid: await uuid_Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
    duplicate_of: payload.uuid
  };

  if (isConflict) {
    override.content = functions_objectSpread(functions_objectSpread({}, payload.safeContent), {}, {
      conflict_of: payload.uuid
    });
  }

  const copy = Object(generator["b" /* CopyPayload */])(payload, override);
  results.push(copy);
  /**
   * Get the payloads that make reference to payload and add the copy.
   */

  const referencing = baseCollection.elementsReferencingElement(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences(referencing, [{
    uuid: copy.uuid,
    content_type: copy.content_type
  }]);
  Object(utils["j" /* extendArray */])(results, updatedReferencing);
  const affector = AffectorMapping[payload.content_type];

  if (affector) {
    const affected = affector(payload, copy, baseCollection);

    if (affected) {
      Object(utils["j" /* extendArray */])(results, affected);
    }
  }

  return results;
}
/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */

async function PayloadsByAlternatingUuid(payload, baseCollection) {
  const results = [];
  /**
  * We need to clone payload and give it a new uuid,
  * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
  */

  const copy = Object(generator["b" /* CopyPayload */])(payload, {
    uuid: await uuid_Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null
  });
  results.push(copy);
  /**
   * Get the payloads that make reference to payload and remove
   * payload as a relationship, instead adding the new copy.
   */

  const referencing = baseCollection.elementsReferencingElement(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences(referencing, [{
    uuid: copy.uuid,
    content_type: copy.content_type
  }], [payload.uuid]);
  Object(utils["j" /* extendArray */])(results, updatedReferencing);
  const updatedSelf = Object(generator["b" /* CopyPayload */])(payload, {
    deleted: true,

    /** Do not set as dirty; this item is non-syncable
      and should be immediately discarded */
    dirty: false,
    content: undefined
  });
  results.push(updatedSelf);
  return results;
}

async function PayloadsByUpdatingReferences(payloads, add, removeIds) {
  const results = [];

  for (const payload of payloads) {
    const references = payload.contentObject.references.slice();

    if (add) {
      for (const reference of add) {
        references.push(reference);
      }
    }

    if (removeIds) {
      for (const id of removeIds) {
        remove_default()(references, {
          uuid: id
        });
      }
    }

    const result = Object(generator["b" /* CopyPayload */])(payload, {
      dirty: true,
      dirtiedDate: new Date(),
      content: functions_objectSpread(functions_objectSpread({}, payload.safeContent), {}, {
        references: references
      })
    });
    results.push(result);
  }

  return results;
}
/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */


function PayloadContentsEqual(payloadA, payloadB) {
  const itemA = CreateItemFromPayload(payloadA);
  const itemB = CreateItemFromPayload(payloadB);
  return itemA.isItemContentEqualWith(itemB);
}
// EXTERNAL MODULE: ./lib/protocol/payloads/fields.ts
var fields = __webpack_require__(4);

// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/conflict.ts
function conflict_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function conflict_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { conflict_ownKeys(Object(source), true).forEach(function (key) { conflict_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { conflict_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function conflict_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









class conflict_ConflictDelta {
  constructor(baseCollection, basePayload, applyPayload, source) {
    this.baseCollection = baseCollection;
    this.basePayload = basePayload;
    this.applyPayload = applyPayload;
    this.source = source;
  }

  async resultingCollection() {
    const tmpBaseItem = CreateItemFromPayload(this.basePayload);
    const tmpApplyItem = CreateItemFromPayload(this.applyPayload);
    const strategy = tmpBaseItem.strategyWhenConflictingWithItem(tmpApplyItem);
    const results = await this.payloadsByHandlingStrategy(strategy);
    return payload_collection_ImmutablePayloadCollection.WithPayloads(results, this.source);
  }

  async payloadsByHandlingStrategy(strategy) {
    /** Ensure no conflict has already been created with the incoming content.
     * This can occur in a multi-page sync request where in the middle of the request,
     * we make changes to many items, including duplicating, but since we are still not
     * uploading the changes until after the multi-page request completes, we may have
     * already conflicted this item. */
    const existingConflict = this.baseCollection.conflictsOf(this.applyPayload.uuid)[0];

    if (existingConflict && PayloadContentsEqual(existingConflict, this.applyPayload)) {
      /** Conflict exists and its contents are the same as incoming value, do not make duplicate */
      return [];
    }

    if (strategy === strategies["a" /* ConflictStrategy */].KeepLeft) {
      const updatedAt = Object(utils["n" /* greaterOfTwoDates */])(this.basePayload.updated_at, this.applyPayload.updated_at);
      const leftPayload = Object(generator["b" /* CopyPayload */])(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date()
      });
      return [leftPayload];
    }

    if (strategy === strategies["a" /* ConflictStrategy */].KeepRight) {
      const result = Object(generator["g" /* PayloadByMerging */])(this.applyPayload, this.basePayload, [fields["a" /* PayloadField */].LastSyncBegan], {
        lastSyncEnd: new Date()
      });
      return [result];
    }

    if (strategy === strategies["a" /* ConflictStrategy */].KeepLeftDuplicateRight) {
      const updatedAt = Object(utils["n" /* greaterOfTwoDates */])(this.basePayload.updated_at, this.applyPayload.updated_at);
      const leftPayload = Object(generator["b" /* CopyPayload */])(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date()
      });
      const rightPayloads = await PayloadsByDuplicating(this.applyPayload, this.baseCollection, true);
      return [leftPayload].concat(rightPayloads);
    }

    if (strategy === strategies["a" /* ConflictStrategy */].DuplicateLeftKeepRight) {
      const leftPayloads = await PayloadsByDuplicating(this.basePayload, this.baseCollection, true);
      const rightPayload = Object(generator["g" /* PayloadByMerging */])(this.applyPayload, this.basePayload, [fields["a" /* PayloadField */].LastSyncBegan], {
        lastSyncEnd: new Date()
      });
      return leftPayloads.concat([rightPayload]);
    }

    if (strategy === strategies["a" /* ConflictStrategy */].KeepLeftMergeRefs) {
      const refs = Object(utils["J" /* uniqCombineObjArrays */])(this.basePayload.contentObject.references, this.applyPayload.contentObject.references, ['uuid', 'content_type']);
      const updatedAt = Object(utils["n" /* greaterOfTwoDates */])(this.basePayload.updated_at, this.applyPayload.updated_at);
      const payload = Object(generator["b" /* CopyPayload */])(this.basePayload, {
        updated_at: updatedAt,
        dirty: true,
        dirtiedDate: new Date(),
        content: conflict_objectSpread(conflict_objectSpread({}, this.basePayload.safeContent), {}, {
          references: refs
        })
      });
      return [payload];
    }

    throw 'Unhandled strategy';
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/file_import.ts






class file_import_DeltaFileImport extends PayloadsDelta {
  async resultingCollection() {
    const results = [];

    for (const payload of this.applyCollection.all()) {
      const handled = await this.payloadsByHandlingPayload(payload, results);
      const payloads = handled.map(result => {
        return Object(generator["b" /* CopyPayload */])(result, {
          dirty: true,
          dirtiedDate: new Date(),
          deleted: false
        });
      });
      Object(utils["j" /* extendArray */])(results, payloads);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(results, sources["a" /* PayloadSource */].FileImport);
  }

  async payloadsByHandlingPayload(payload, currentResults) {
    /**
     * Check to see if we've already processed a payload for this id.
     * If so, that would be the latest value, and not what's in the base collection.
     */

    /*
     * Find the most recently created conflict if available, as that
     * would contain the most recent value.
     */
    let current = currentResults.find(candidate => {
      return candidate.contentObject.conflict_of === payload.uuid;
    });
    /**
     * If no latest conflict, find by uuid directly.
     */

    if (!current) {
      current = currentResults.find(candidate => {
        return candidate.uuid === payload.uuid;
      });
    }
    /**
     * If not found in current results, use the base value.
     */


    if (!current) {
      current = this.findBasePayload(payload.uuid);
    }
    /**
     * If the current doesn't exist, we're creating a new item from payload.
     */


    if (!current) {
      return [payload];
    }

    const delta = new conflict_ConflictDelta(this.baseCollection, current, payload, sources["a" /* PayloadSource */].FileImport);
    const deltaCollection = await delta.resultingCollection();
    return deltaCollection.all();
  }

}
// CONCATENATED MODULE: ./lib/services/model_manager.ts









/**
 * The model manager is responsible for keeping state regarding what items exist in the
 * global application state. It does so by exposing functions that allow consumers to 'map'
 * a detached payload into global application state. Whenever a change is made or retrieved
 * from any source, it must be mapped in order to be properly reflected in global application state.
 * The model manager deals only with in-memory state, and does not deal directly with storage.
 * It also serves as a query store, and can be queried for current notes, tags, etc.
 * It exposes methods that allow consumers to listen to mapping events. This is how
 * applications 'stream' items to display in the interface.
 */

class model_manager_PayloadManager extends pure_service["a" /* PureService */] {
  constructor() {
    super();
    this.changeObservers = [];
    this.emitQueue = [];
    this.collection = new collection_MutableCollection();
  }
  /**
   * Our payload collection keeps the latest mapped payload for every payload
   * that passes through our mapping function. Use this to query current state
   * as needed to make decisions, like about duplication or uuid alteration.
   */


  getMasterCollection() {
    return payload_collection_ImmutablePayloadCollection.FromCollection(this.collection);
  }

  deinit() {
    super.deinit();
    this.changeObservers.length = 0;
    this.resetState();
  }

  resetState() {
    this.collection = new collection_MutableCollection();
  }

  find(uuids) {
    return this.collection.findAll(uuids);
  }
  /**
   * One of many mapping helpers available.
   * This function maps a collection of payloads.
   */


  async emitCollection(collection, sourceKey) {
    return this.emitPayloads(collection.all(), collection.source, sourceKey);
  }
  /**
   * One of many mapping helpers available.
   * This function maps a payload to an item
   * @returns every paylod altered as a result of this operation, to be
   * saved to storage by the caller
   */


  async emitPayload(payload, source, sourceKey) {
    return this.emitPayloads([payload], source, sourceKey);
  }
  /**
   * This function maps multiple payloads to items, and is the authoratative mapping
   * function that all other mapping helpers rely on
   * @returns every paylod altered as a result of this operation, to be
   * saved to storage by the caller
   */


  async emitPayloads(payloads, source, sourceKey) {
    if (payloads.length === 0) {
      console.warn("Attempting to emit 0 payloads.");
    }

    return new Promise(resolve => {
      this.emitQueue.push({
        payloads,
        source,
        sourceKey,
        resolve
      });

      if (this.emitQueue.length === 1) {
        this.popQueue();
      }
    });
  }

  async popQueue() {
    const first = this.emitQueue[0];
    const {
      changed,
      inserted,
      discarded
    } = this.mergePayloadsOntoMaster(first.payloads);
    this.notifyChangeObservers(changed, inserted, discarded, first.source, first.sourceKey);
    Object(utils["B" /* removeFromArray */])(this.emitQueue, first);
    first.resolve(changed.concat(inserted, discarded));

    if (this.emitQueue.length > 0) {
      this.popQueue();
    }
  }

  mergePayloadsOntoMaster(payloads) {
    const changed = [];
    const inserted = [];
    const discarded = [];

    for (const payload of payloads) {
      if (!payload.uuid || !payload.content_type) {
        console.error('Payload is corrupt:', payload);
        continue;
      }

      const masterPayload = this.collection.find(payload.uuid);
      const newPayload = masterPayload ? Object(generator["g" /* PayloadByMerging */])(masterPayload, payload) : payload;
      /** The item has been deleted and synced,
       * and can thus be removed from our local record */

      if (newPayload.discardable) {
        this.collection.discard(newPayload);
        discarded.push(newPayload);
      } else {
        this.collection.set(newPayload);

        if (!masterPayload) {
          inserted.push(newPayload);
        } else {
          changed.push(newPayload);
        }
      }
    }

    return {
      changed,
      inserted,
      discarded
    };
  }
  /**
   * Notifies observers when an item has been mapped.
   * @param types - An array of content types to listen for
   * @param priority - The lower the priority, the earlier the function is called
   *  wrt to other observers
   */


  addObserver(types, callback) {
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    if (!Array.isArray(types)) {
      types = [types];
    }

    const observer = {
      types,
      priority,
      callback
    };
    this.changeObservers.push(observer);
    return () => {
      Object(utils["B" /* removeFromArray */])(this.changeObservers, observer);
    };
  }
  /**
   * This function is mostly for internal use, but can be used externally by consumers who
   * explicitely understand what they are doing (want to propagate model state without mapping)
   */


  notifyChangeObservers(changed, inserted, discarded, source, sourceKey) {
    /** Slice the observers array as sort modifies in-place */
    const observers = this.changeObservers.slice().sort((a, b) => {
      return a.priority < b.priority ? -1 : 1;
    });

    const filter = (payloads, types) => {
      return types.includes(content_types["a" /* ContentType */].Any) ? payloads.slice() : payloads.slice().filter(payload => {
        return types.includes(payload.content_type);
      });
    };

    for (const observer of observers) {
      observer.callback(filter(changed, observer.types), filter(inserted, observer.types), filter(discarded, observer.types), source, sourceKey);
    }
  }
  /**
   * Imports an array of payloads from an external source (such as a backup file)
   * and marks the items as dirty.
   * @returns Resulting items
   */


  async importPayloads(payloads) {
    const delta = new file_import_DeltaFileImport(this.getMasterCollection(), payload_collection_ImmutablePayloadCollection.WithPayloads(payloads, sources["a" /* PayloadSource */].FileImport));
    const collection = await delta.resultingCollection();
    await this.emitCollection(collection);
    return Object(functions["b" /* Uuids */])(collection.payloads);
  }

  removePayloadLocally(payload) {
    this.collection.discard(payload);
  }

}
// EXTERNAL MODULE: ./lib/services/sync/events.ts
var sync_events = __webpack_require__(7);

// CONCATENATED MODULE: ./lib/services/singleton_manager.ts








/**
 * The singleton manager allow consumers to ensure that only 1 item exists of a certain
 * predicate. For example, consumers may want to ensure that only one item of contentType
 * UserPreferences exist. The singleton manager allows consumers to do this via 2 methods:
 * 1. Consumers may use `findOrCreateSingleton` to retrieve an item if it exists, or create
 *    it otherwise. While this method may serve most cases, it does not allow the consumer
 *    to subscribe to changes, such as if after this method is called, a UserPreferences object
 *    is downloaded from a remote source.
 * 2. Consumers may use `registerPredicate` in order to constantly monitor a particular
 *    predicate and ensure that only 1 value exists for that predicate. This may be used in
 *    tandem with `findOrCreateSingleton`, for example to monitor a predicate after we
 *    intitially create the item.
 */

class singleton_manager_SNSingletonManager extends pure_service["a" /* PureService */] {
  constructor(itemManager, syncService) {
    super();
    this.resolveQueue = [];
    this.registeredPredicates = [];
    this.itemManager = itemManager;
    this.syncService = syncService;
    this.addObservers();
  }

  deinit() {
    this.syncService = undefined;
    this.itemManager = undefined;
    this.resolveQueue.length = 0;
    this.registeredPredicates.length = 0;
    this.removeItemObserver();
    this.removeItemObserver = undefined;
    this.removeSyncObserver();
    this.removeSyncObserver = undefined;
    super.deinit();
  }

  popResolveQueue() {
    const queue = this.resolveQueue.slice();
    this.resolveQueue = [];
    return queue;
  }
  /**
   * We only want to resolve singletons for items that are newly created (because this
   * is when items proliferate). However, we don't want to resolve immediately on creation,
   * but instead wait for the next full sync to complete. This is so that when you download
   * a singleton and create the object, but the items key for the item has not yet been
   * downloaded, the singleton will be errorDecrypting, and would be mishandled in the
   * overall singleton logic. By waiting for a full sync to complete, we can be sure that
   * all items keys have been downloaded.
   */


  addObservers() {
    this.removeItemObserver = this.itemManager.addObserver(content_types["a" /* ContentType */].Any, (changed, inserted) => {
      if (changed.length > 0) {
        /**
         * For performance reasons, we typically only queue items in the resolveQueue once,
         * when they are inserted. However, items recently inserted could still be errorDecrypting.
         * We want to re-run singleton logic on any items whose decryption status has changed,
         * due to the fact that singleton logic does not apply properly if an item is not
         * decrypted.
         */
        const decryptionStatusChanged = changed.filter(i => i.errorDecryptingValueChanged);

        if (decryptionStatusChanged.length > 0) {
          this.resolveQueue = this.resolveQueue.concat(decryptionStatusChanged);
        }
      }

      if (inserted.length > 0) {
        this.resolveQueue = this.resolveQueue.concat(inserted);
      }
    });
    this.removeSyncObserver = this.syncService.addEventObserver(async eventName => {
      if (eventName === sync_events["a" /* SyncEvent */].DownloadFirstSyncCompleted || eventName === sync_events["a" /* SyncEvent */].FullSyncCompleted) {
        await this.resolveSingletonsForItems(this.popResolveQueue(), eventName);
      }
    });
  }
  /**
   * Predicates registered are automatically observed. If global item state changes
   * such that the item(s) match the predicate, procedures will be followed such that
   * the end result is that only 1 item remains, and the others are deleted.
   */


  registerPredicate(predicate) {
    this.registeredPredicates.push(predicate);
  }

  validItemsMatchingPredicate(predicate) {
    return this.itemManager.itemsMatchingPredicate(predicate).filter(item => {
      return !item.errorDecrypting;
    });
  }

  async resolveSingletonsForItems(items, eventSource) {
    const matchesForRegisteredPredicate = item => {
      for (const predicate of this.registeredPredicates) {
        if (item.satisfiesPredicate(predicate)) {
          return this.validItemsMatchingPredicate(predicate);
        }
      }
    };

    const matchesForSelfPredicate = item => {
      if (!item.isSingleton) {
        return null;
      }

      return this.validItemsMatchingPredicate(item.singletonPredicate);
    };

    const matches = item => {
      const selfMatches = matchesForSelfPredicate(item);

      if (selfMatches && selfMatches.length > 0) {
        return selfMatches;
      }

      return matchesForRegisteredPredicate(item);
    };

    const handled = [];

    for (const item of items) {
      if (handled.includes(item)) {
        continue;
      }

      const matchingItems = matches(item);
      Object(utils["j" /* extendArray */])(handled, matchingItems || []);

      if (!matchingItems || matchingItems.length <= 1) {
        continue;
      }

      await this.handleStrategy(matchingItems, item.singletonStrategy);
    }
    /**
     * Only sync if event source is FullSyncCompleted.
     * If it is on DownloadFirstSyncCompleted, we don't need to sync,
     * as a sync request will automatically be made as part of the second phase
     * of a download-first request.
     */


    if (handled.length > 0 && eventSource === sync_events["a" /* SyncEvent */].FullSyncCompleted) {
      /**
       * Do not await. We want any local-side changes to
       * be awaited but the actual sync shouldn't be since it's non-essential
       * Perform after timeout so that we can yield to event notifier that triggered us
       */
      setTimeout(() => {
        this.syncService.sync();
      });
    }
  }

  async handleStrategy(items, strategy) {
    if (strategy !== core_item["e" /* SingletonStrategy */].KeepEarliest) {
      throw 'Unhandled singleton strategy';
    }

    const earliestFirst = items.sort((a, b) => {
      /** -1: a comes first, 1: b comes first */
      if (a.errorDecrypting) {
        return 1;
      }

      if (b.errorDecrypting) {
        return -1;
      }

      return a.created_at < b.created_at ? -1 : 1;
    });
    const deleteItems = Object(utils["d" /* arrayByRemovingFromIndex */])(earliestFirst, 0);
    await this.itemManager.setItemsToBeDeleted(Object(functions["b" /* Uuids */])(deleteItems));
  }

  async findOrCreateSingleton(predicate, createContentType, createContent) {
    return new Promise(async resolve => {
      const matchingItems = this.validItemsMatchingPredicate(predicate);

      if (matchingItems.length > 0) {
        return resolve(matchingItems[0]);
      }
      /** Item not found, safe to create after full sync has completed */


      if (!this.syncService.getLastSyncDate()) {
        /** Add a temporary observer in case of long-running sync request, where
         * the item we're looking for ends up resolving early or in the middle. */
        let didResolve = false;
        const removeObserver = this.itemManager.addObserver(createContentType, (_, inserted) => {
          if (inserted.length > 0) {
            const matchingItems = this.itemManager.subItemsMatchingPredicates(inserted, [predicate]);

            if (matchingItems.length > 0) {
              didResolve = true;
              resolve(matchingItems[0]);
            }
          }
        });
        await this.syncService.sync();
        removeObserver();

        if (didResolve) {
          return;
        }
        /** Check again */


        const refreshedItems = this.validItemsMatchingPredicate(predicate);

        if (refreshedItems.length > 0) {
          return resolve(refreshedItems[0]);
        }
      }
      /** Delete any items that are errored */


      const errorDecrypting = this.itemManager.itemsMatchingPredicate(predicate).filter(item => {
        return item.errorDecrypting;
      });
      await this.itemManager.setItemsToBeDeleted(Object(functions["b" /* Uuids */])(errorDecrypting));
      /** Safe to create */

      const dirtyPayload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
        uuid: await uuid_Uuid.GenerateUuid(),
        content_type: createContentType,
        content: createContent,
        dirty: true,
        dirtiedDate: new Date()
      });
      const item = await this.itemManager.emitItemFromPayload(dirtyPayload);

      if (!item) {
        throw Error("Created singleton item should not be null ".concat(createContentType));
      }

      await this.syncService.sync();
      return resolve(item);
    });
  }

}
// CONCATENATED MODULE: ./lib/services/actions_service.ts






/**
 * The Actions Service allows clients to interact with action-based extensions.
 * Action-based extensions are mostly RESTful actions that can push a local value or
 * retrieve a remote value and act on it accordingly.
 * There are 4 action types:
 * `get`: performs a GET request on an endpoint to retrieve an item value, and merges the
 *      value onto the local item value. For example, you can GET an item's older revision
 *      value and replace the current value with the revision.
 * `render`: performs a GET request, and displays the result in the UI. This action does not
 *         affect data unless action is taken explicitely in the UI after the data is presented.
 * `show`: opens the action's URL in a browser.
 * `post`: sends an item's data to a remote service. This is used for example by Listed
 *       to allow publishing a note to a user's blog.
 */

class actions_service_SNActionsService extends pure_service["a" /* PureService */] {
  constructor(itemManager, alertService, deviceInterface, httpService, modelManager, protocolService, syncService) {
    super();
    this.previousPasswords = [];
    this.itemManager = itemManager;
    this.alertService = alertService;
    this.deviceInterface = deviceInterface;
    this.httpService = httpService;
    this.modelManager = modelManager;
    this.protocolService = protocolService;
    this.syncService = syncService;
    this.previousPasswords = [];
  }
  /** @override */


  deinit() {
    this.itemManager = undefined;
    this.alertService = undefined;
    this.deviceInterface = undefined;
    this.httpService = undefined;
    this.modelManager = undefined;
    this.protocolService = undefined;
    this.syncService = undefined;
    this.previousPasswords.length = 0;
    super.deinit();
  }

  getExtensions() {
    return this.itemManager.nonErroredItemsForContentType(content_types["a" /* ContentType */].ActionsExtension);
  }

  extensionsInContextOfItem(item) {
    return this.getExtensions().filter(ext => {
      return ext.supported_types.includes(item.content_type) || ext.actionsWithContextForItem(item).length > 0;
    });
  }
  /**
   * Loads an extension in the context of a certain item.
   * The server then has the chance to respond with actions that are
   * relevant just to this item. The response extension is not saved,
   * just displayed as a one-time thing.
  */


  async loadExtensionInContextOfItem(extension, item) {
    const params = {
      content_type: item.content_type,
      item_uuid: item.uuid
    };
    const response = await this.httpService.getAbsolute(extension.url, params).catch(response => {
      console.error('Error loading extension', response);
      return null;
    });

    if (!response) {
      return;
    }

    const description = response.description || extension.description;
    const supported_types = response.supported_types || extension.supported_types;
    const actions = response.actions ? response.actions.map(action => {
      return new action_Action(action);
    }) : [];
    await this.itemManager.changeActionsExtension(extension.uuid, mutator => {
      mutator.description = description;
      mutator.supported_types = supported_types;
      mutator.actions = actions;
    });
    return this.itemManager.findItem(extension.uuid);
  }

  async runAction(action, item, passwordRequestHandler) {
    let result;

    switch (action.verb) {
      case 'get':
        result = await this.handleGetAction(action, passwordRequestHandler);
        break;

      case 'render':
        result = await this.handleRenderAction(action, passwordRequestHandler);
        break;

      case 'show':
        result = await this.handleShowAction(action);
        break;

      case 'post':
        result = await this.handlePostAction(action, item);
        break;

      default:
        break;
    }

    return result;
  }

  async handleGetAction(action, passwordRequestHandler) {
    const confirmed = await this.alertService.confirm("Are you sure you want to replace the current note contents with this action's results?");

    if (confirmed) {
      return this.runConfirmedGetAction(action, passwordRequestHandler);
    } else {
      return {
        error: {
          message: 'Action canceled by user.'
        }
      };
    }
  }

  async runConfirmedGetAction(action, passwordRequestHandler) {
    const response = await this.httpService.getAbsolute(action.url).catch(response => {
      const error = response && response.error || {
        message: 'An issue occurred while processing this action. Please try again.'
      };
      this.alertService.alert(error.message);
      return {
        error
      };
    });

    if (response.error) {
      return {
        response
      };
    }

    const payload = await this.payloadByDecryptingResponse(response, passwordRequestHandler);
    await this.modelManager.emitPayload(Object(generator["b" /* CopyPayload */])(payload, {
      dirty: true,
      dirtiedDate: new Date()
    }), sources["a" /* PayloadSource */].RemoteActionRetrieved);
    this.syncService.sync();
    return {
      response,
      item: response.item
    };
  }

  async handleRenderAction(action, passwordRequestHandler) {
    const response = await this.httpService.getAbsolute(action.url).then(async response => {
      const payload = await this.payloadByDecryptingResponse(response, passwordRequestHandler);

      if (payload) {
        const item = await this.itemManager.createItem(payload.content_type, payload.contentObject);
        return {
          response,
          item
        };
      }
    }).catch(response => {
      const error = response && response.error || {
        message: 'An issue occurred while processing this action. Please try again.'
      };
      this.alertService.alert(error.message);
      return {
        error
      };
    });
    return response;
  }

  async payloadByDecryptingResponse(response, passwordRequestHandler, key) {
    let triedPasswords = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(response.item);
    const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(payload, key);

    if (!decryptedPayload.errorDecrypting) {
      return decryptedPayload;
    }

    const keyParamsData = response.keyParams || response.auth_params;

    if (!keyParamsData) {
      /**
       * In some cases revisions were missing auth params.
       * Instruct the user to email us to get this remedied.
       */
      this.alertService.alert('We were unable to decrypt this revision using your current keys, ' + 'and this revision is missing metadata that would allow us to try different ' + 'keys to decrypt it. This can likely be fixed with some manual intervention. ' + 'Please email hello@standardnotes.org for assistance.');
      return undefined;
    }

    const keyParams = this.protocolService.createKeyParams(keyParamsData);
    /* Try previous passwords */

    for (const passwordCandidate of this.previousPasswords) {
      if (triedPasswords.includes(passwordCandidate)) {
        continue;
      }

      triedPasswords.push(passwordCandidate);
      const key = await this.protocolService.computeRootKey(passwordCandidate, keyParams);

      if (!key) {
        continue;
      }

      const nestedResponse = await this.payloadByDecryptingResponse(response, passwordRequestHandler, key, triedPasswords);

      if (nestedResponse) {
        return nestedResponse;
      }
    }
    /** Prompt for other passwords */


    const password = await passwordRequestHandler();

    if (this.previousPasswords.includes(password)) {
      return undefined;
    }

    this.previousPasswords.push(password);
    return this.payloadByDecryptingResponse(response, passwordRequestHandler, key);
  }

  async handlePostAction(action, item) {
    const decrypted = action.access_type === ActionAccessType.Decrypted;
    const itemParams = await this.outgoingPayloadForItem(item, decrypted);
    const params = {
      items: [itemParams]
    };
    return this.httpService.postAbsolute(action.url, params).then(response => {
      return {
        response
      };
    }).catch(response => {
      console.error('Action error response:', response);
      this.alertService.alert('An issue occurred while processing this action. Please try again.');
      return {
        response
      };
    });
  }

  async handleShowAction(action) {
    this.deviceInterface.openUrl(action.url);
    return {
      response: undefined
    };
  }

  async outgoingPayloadForItem(item) {
    let decrypted = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const intent = decrypted ? intents["a" /* EncryptionIntent */].FileDecrypted : intents["a" /* EncryptionIntent */].FileEncrypted;
    const encrypted = await this.protocolService.payloadByEncryptingPayload(item.payloadRepresentation(), intent);
    return encrypted.ejected();
  }

}
// CONCATENATED MODULE: ./node_modules/sncrypto/lib/common/utils.ts
/**
 * Constant-time string comparison
 * @param a
 * @param b
 */
function timingSafeEqual(a, b) {
  const strA = String(a);
  let strB = String(b);
  const lenA = strA.length;
  let result = 0;

  if (lenA !== strB.length) {
    strB = strA;
    result = 1;
  }

  for (let i = 0; i < lenA; i++) {
    result |= strA.charCodeAt(i) ^ strB.charCodeAt(i);
  }

  return result === 0;
}
// CONCATENATED MODULE: ./lib/protocol/root_key.ts







/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys. A root key extends SNItem for local convenience, but is
 * not part of the syncing or storage ecosystem—root keys are managed independently.
 */

class root_key_SNRootKey extends core_item["d" /* SNItem */] {
  static async Create(content, uuid) {
    if (!uuid) {
      uuid = await uuid_Uuid.GenerateUuid();
    }

    if (!content.version) {
      if (content.dataAuthenticationKey) {
        /**
         * If there's no version stored, it must be either 001 or 002.
         * If there's a dataAuthenticationKey, it has to be 002. Otherwise it's 001.
         */
        content.version = versions["a" /* ProtocolVersion */].V002;
      } else {
        content.version = versions["a" /* ProtocolVersion */].V001;
      }
    }

    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
      uuid: uuid,
      content_type: content_types["a" /* ContentType */].RootKey,
      content: Object(functions["a" /* FillItemContent */])(content)
    });
    return new root_key_SNRootKey(payload);
  }

  get version() {
    if (!this.payload.safeContent.version) {
      throw 'Attempting to create key without version.';
    }

    return this.payload.safeContent.version;
  }

  get isRootKey() {
    return true;
  }
  /**
   * When the root key is used to encrypt items, we use the masterKey directly.
   */


  get itemsKey() {
    return this.masterKey;
  }

  get masterKey() {
    return this.payload.safeContent.masterKey;
  }

  get serverPassword() {
    return this.payload.safeContent.serverPassword;
  }
  /** 003 and below only. */


  get dataAuthenticationKey() {
    return this.payload.safeContent.dataAuthenticationKey;
  }
  /**
   * Compares two keys for equality
   */


  compare(otherKey) {
    if (this.version !== otherKey.version) {
      return false;
    }

    const hasServerPassword = this.serverPassword && otherKey.serverPassword;
    return timingSafeEqual(this.masterKey, otherKey.masterKey) && (!hasServerPassword || timingSafeEqual(this.serverPassword, otherKey.serverPassword));
  }
  /**
   * @returns Object containg key/values that should be extracted from key for local saving.
   */


  getPersistableValue() {
    const values = {
      version: this.version
    };

    if (this.masterKey) {
      values.masterKey = this.masterKey;
    }

    if (this.dataAuthenticationKey) {
      values.dataAuthenticationKey = this.dataAuthenticationKey;
    }

    return values;
  }

}
// CONCATENATED MODULE: ./lib/migrations/migration.ts
class Migration {
  constructor(services) {
    this.services = services;
    this.stageHandlers = {};
    this.registerStageHandlers();
  }

  static timestamp() {
    throw 'Must override';
  }

  registerStageHandler(stage, handler) {
    this.stageHandlers[stage] = handler;
  }

  markDone() {
    var _this$onDoneHandler;

    (_this$onDoneHandler = this.onDoneHandler) === null || _this$onDoneHandler === void 0 ? void 0 : _this$onDoneHandler.call(this);
    this.onDoneHandler = undefined;
  }

  onDone(callback) {
    this.onDoneHandler = callback;
  }

  async handleStage(stage) {
    const handler = this.stageHandlers[stage];

    if (handler) {
      await handler();
    }
  }

}
// CONCATENATED MODULE: ./lib/migrations/2020-01-15.ts


















const LegacyKeys = {
  WebPasscodeParamsKey: 'offlineParams',
  MobilePasscodeParamsKey: 'pc_params',
  AllAccountKeyParamsKey: 'auth_params',
  WebEncryptedStorageKey: 'encryptedStorage',
  MobileWrappedRootKeyKey: 'encrypted_account_keys',
  MobileBiometricsPrefs: 'biometrics_prefs',
  AllMigrations: 'migrations'
};
class _2020_01_15_Migration20200115 extends Migration {
  static timestamp() {
    return new Date('2020-01-15').getTime();
  }

  registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.services.environment)) {
        await this.migrateStorageStructureForWebDesktop();
      } else if (isEnvironmentMobile(this.services.environment)) {
        await this.migrateStorageStructureForMobile();
      }
    });
    this.registerStageHandler(ApplicationStage.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      await this.migrateSessionStorage();
      await this.deleteLegacyStorageValues();
    });
    this.registerStageHandler(ApplicationStage.LoadingDatabase_11, async () => {
      await this.createDefaultItemsKeyForAllPlatforms();
      this.markDone();
    });
  }
  /**
   * Web
   * Migrates legacy storage structure into new managed format.
   * If encrypted storage exists, we need to first decrypt it with the passcode.
   * Then extract the account key from it. Then, encrypt storage with the
   * account key. Then encrypt the account key with the passcode and store it
   * within the new storage format.
   *
   * Generate note: We do not use the keychain if passcode is available.
   */


  async migrateStorageStructureForWebDesktop() {
    const deviceInterface = this.services.deviceInterface;
    const newStorageRawStructure = {
      [ValueModesKeys.Wrapped]: {},
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Nonwrapped]: {}
    };
    const rawAccountKeyParams = await deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.AllAccountKeyParamsKey);
    /** Could be null if no account, or if account and storage is encrypted */

    if (rawAccountKeyParams) {
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams] = rawAccountKeyParams;
    }

    const encryptedStorage = await deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.WebEncryptedStorageKey);

    if (encryptedStorage) {
      const encryptedStoragePayload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(encryptedStorage);
      const passcodeResult = await this.webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedStoragePayload);
      const passcodeKey = passcodeResult.key;
      const decryptedStoragePayload = passcodeResult.decryptedStoragePayload;
      const passcodeParams = passcodeResult.keyParams;
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyWrapperKeyParams] = passcodeParams.getPortableValue();
      const rawStorageValueStore = Object(utils["a" /* Copy */])(decryptedStoragePayload.contentObject.storage);
      const storageValueStore = Object(utils["v" /* jsonParseEmbeddedKeys */])(rawStorageValueStore);
      /** Store previously encrypted auth_params into new nonwrapped value key */

      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams] = storageValueStore[LegacyKeys.AllAccountKeyParamsKey];
      let keyToEncryptStorageWith = passcodeKey;
      /** Extract account key (mk, pw, ak) if it exists */

      const hasAccountKeys = !Object(utils["p" /* isNullOrUndefined */])(storageValueStore.mk);

      if (hasAccountKeys) {
        const {
          accountKey,
          wrappedKey
        } = await this.webDesktopHelperExtractAndWrapAccountKeysFromValueStore(passcodeKey, storageValueStore);
        keyToEncryptStorageWith = accountKey;
        newStorageRawStructure.nonwrapped[StorageKey.WrappedRootKey] = wrappedKey;
      }
      /** Encrypt storage with proper key */


      newStorageRawStructure.wrapped = await this.webDesktopHelperEncryptStorage(keyToEncryptStorageWith, decryptedStoragePayload, storageValueStore);
    } else {
      /**
       * No encrypted storage, take account keys out of raw storage
       * and place them in the keychain. */
      const ak = await this.services.deviceInterface.getRawStorageValue('ak');
      const version = !Object(utils["p" /* isNullOrUndefined */])(ak) ? versions["a" /* ProtocolVersion */].V003 : versions["a" /* ProtocolVersion */].V002;
      const accountKey = await root_key_SNRootKey.Create({
        masterKey: await this.services.deviceInterface.getRawStorageValue('mk'),
        serverPassword: await this.services.deviceInterface.getRawStorageValue('pw'),
        dataAuthenticationKey: ak,
        version: version
      });
      await this.services.deviceInterface.setNamespacedKeychainValue(accountKey.getPersistableValue(), this.services.identifier);
    }
    /** Persist storage under new key and structure */


    await this.allPlatformHelperSetStorageStructure(newStorageRawStructure);
  }
  /**
   * Helper
   * All platforms
   */


  async allPlatformHelperSetStorageStructure(rawStructure) {
    const newStructure = storage_service_SNStorageService.defaultValuesObject(rawStructure.wrapped, rawStructure.unwrapped, rawStructure.nonwrapped);
    newStructure[ValueModesKeys.Unwrapped] = undefined;
    await this.services.deviceInterface.setRawStorageValue(namespacedKey(this.services.identifier, RawStorageKey.StorageObject), JSON.stringify(newStructure));
  }
  /**
   * Helper
   * Web/desktop only
   */


  async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload) {
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.WebPasscodeParamsKey);
    const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams);
    /** Decrypt it with the passcode */

    let decryptedStoragePayload;
    let errorDecrypting = true;
    let passcodeKey;
    const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);

    while (errorDecrypting) {
      const [value] = await this.services.challengeService.promptForChallengeResponseWithCustomValidation(challenge);
      const passcode = value.value;
      passcodeKey = await this.services.protocolService.computeRootKey(passcode, passcodeParams);
      decryptedStoragePayload = await this.services.protocolService.payloadByDecryptingPayload(encryptedPayload, passcodeKey);
      errorDecrypting = decryptedStoragePayload.errorDecrypting;
      this.services.challengeService.setValidationStatusForChallenge(challenge, value, !decryptedStoragePayload.errorDecrypting);
    }

    return {
      decryptedStoragePayload,
      key: passcodeKey,
      keyParams: passcodeParams
    };
  }
  /**
   * Helper
   * Web/desktop only
   */


  async webDesktopHelperExtractAndWrapAccountKeysFromValueStore(passcodeKey, storageValueStore) {
    var _encryptedAccountKey;

    const version = storageValueStore.ak ? versions["a" /* ProtocolVersion */].V003 : versions["a" /* ProtocolVersion */].V002;
    const accountKey = await root_key_SNRootKey.Create({
      masterKey: storageValueStore.mk,
      serverPassword: storageValueStore.pw,
      dataAuthenticationKey: storageValueStore.ak,
      version: version
    });
    delete storageValueStore.mk;
    delete storageValueStore.pw;
    delete storageValueStore.ak;
    const accountKeyPayload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(accountKey);
    let encryptedAccountKey;

    if (passcodeKey) {
      /** Encrypt account key with passcode */
      encryptedAccountKey = await this.services.protocolService.payloadByEncryptingPayload(accountKeyPayload, intents["a" /* EncryptionIntent */].LocalStorageEncrypted, passcodeKey);
    }

    return {
      accountKey: accountKey,
      wrappedKey: (_encryptedAccountKey = encryptedAccountKey) === null || _encryptedAccountKey === void 0 ? void 0 : _encryptedAccountKey.ejected()
    };
  }
  /**
   * Helper
   * Web/desktop only
   * Encrypt storage with account key
   */


  async webDesktopHelperEncryptStorage(key, decryptedStoragePayload, storageValueStore) {
    const wrapped = await this.services.protocolService.payloadByEncryptingPayload(Object(generator["b" /* CopyPayload */])(decryptedStoragePayload, {
      content_type: content_types["a" /* ContentType */].EncryptedStorage,
      content: storageValueStore
    }), intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted, key);
    return wrapped.ejected();
  }
  /**
   * Mobile
   * On mobile legacy structure is mostly similar to new structure,
   * in that the account key is encrypted with the passcode. But mobile did
   * not have encrypted storage, so we simply need to transfer all existing
   * storage values into new managed structure.
   *
   * If no account but passcode only, the only thing we stored on mobile
   * previously was keys.offline.pw and keys.offline.timing in the keychain
   * that we compared against for valid decryption.
   * In the new version, we know a passcode is correct if it can decrypt storage.
   * As part of the migration, we’ll need to request the raw passcode from user,
   * compare it against the keychain offline.pw value, and if correct,
   * migrate storage to new structure, and encrypt with passcode key.
   *
   * If account only, take the value in the keychain, and rename the values
   * (i.e mk > masterKey).
   * @access private
   */


  async migrateStorageStructureForMobile() {
    const wrappedAccountKey = await this.services.deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.MobileWrappedRootKeyKey);
    const rawAccountKeyParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.AllAccountKeyParamsKey);
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.MobilePasscodeParamsKey);
    const rawStructure = {
      [ValueModesKeys.Nonwrapped]: {
        [StorageKey.WrappedRootKey]: wrappedAccountKey,
        [StorageKey.RootKeyWrapperKeyParams]: rawPasscodeParams,
        [StorageKey.RootKeyParams]: rawAccountKeyParams
      },
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Wrapped]: {}
    };
    const keychainValue = await this.services.deviceInterface.getRawKeychainValue();
    const biometricPrefs = await this.services.deviceInterface.getJsonParsedRawStorageValue(LegacyKeys.MobileBiometricsPrefs);

    if (biometricPrefs) {
      rawStructure.nonwrapped[StorageKey.BiometricsState] = biometricPrefs.enabled;
      rawStructure.nonwrapped[StorageKey.MobileBiometricsTiming] = biometricPrefs.timing;
    }

    if (rawPasscodeParams) {
      const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams);

      const getPasscodeKey = async () => {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const pwHash = keychainValue.offline.pw;
        let passcodeKey;
        const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);

        while (!passcodeKey || passcodeKey.serverPassword !== pwHash) {
          const [value] = await this.services.challengeService.promptForChallengeResponseWithCustomValidation(challenge);
          const passcode = value.value;
          passcodeKey = await this.services.protocolService.computeRootKey(passcode, passcodeParams);
          this.services.challengeService.setValidationStatusForChallenge(challenge, value, passcodeKey.serverPassword === pwHash);
        }

        return passcodeKey;
      };

      const timing = keychainValue.offline.timing;
      rawStructure.nonwrapped[StorageKey.MobilePasscodeTiming] = timing;

      if (wrappedAccountKey) {
        /**
         * Account key is encrypted with passcode. Inside, the accountKey is located inside
         * content.accountKeys. We want to unembed these values to main content, rename
         * with proper property names, wrap again, and store in new rawStructure.
         */
        const passcodeKey = await getPasscodeKey();
        const unwrappedAccountKey = await this.services.protocolService.payloadByDecryptingPayload(Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(wrappedAccountKey), passcodeKey);
        const accountKeyContent = unwrappedAccountKey.contentObject.accountKeys;
        const defaultVersion = !Object(utils["p" /* isNullOrUndefined */])(accountKeyContent.ak) ? versions["a" /* ProtocolVersion */].V003 : versions["a" /* ProtocolVersion */].V002;
        const newAccountKey = Object(generator["b" /* CopyPayload */])(unwrappedAccountKey, {
          content: {
            masterKey: accountKeyContent.mk,
            serverPassword: accountKeyContent.pw,
            dataAuthenticationKey: accountKeyContent.ak,
            version: accountKeyContent.version || defaultVersion,
            accountKeys: null
          }
        });
        const newWrappedAccountKey = await this.services.protocolService.payloadByEncryptingPayload(newAccountKey, intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted, passcodeKey);
        rawStructure.nonwrapped[StorageKey.WrappedRootKey] = newWrappedAccountKey.ejected();
        await this.services.deviceInterface.clearRawKeychainValue();
      } else if (!wrappedAccountKey) {
        /** Passcode only, no account */
        const passcodeKey = await getPasscodeKey();
        const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
          uuid: await uuid_Uuid.GenerateUuid(),
          content: Object(functions["a" /* FillItemContent */])(rawStructure.unwrapped),
          content_type: content_types["a" /* ContentType */].EncryptedStorage
        });
        /** Encrypt new storage.unwrapped structure with passcode */

        const wrapped = await this.services.protocolService.payloadByEncryptingPayload(payload, intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted, passcodeKey);
        rawStructure.wrapped = wrapped.ejected();
        await this.services.deviceInterface.clearRawKeychainValue();
      }
    } else {
      /** No passcode, potentially account. Migrate keychain property keys. */
      const hasAccount = keychainValue && keychainValue.mk;

      if (hasAccount) {
        const defaultVersion = !Object(utils["p" /* isNullOrUndefined */])(keychainValue.ak) ? versions["a" /* ProtocolVersion */].V003 : versions["a" /* ProtocolVersion */].V002;
        const accountKey = await root_key_SNRootKey.Create({
          masterKey: keychainValue.mk,
          serverPassword: keychainValue.pw,
          dataAuthenticationKey: keychainValue.ak,
          version: keychainValue.version || defaultVersion
        });
        await this.services.deviceInterface.setNamespacedKeychainValue(accountKey.getPersistableValue(), this.services.identifier);
      }
    }
    /** Move encrypted account key into place where it is now expected */


    await this.allPlatformHelperSetStorageStructure(rawStructure);
  }
  /**
   * All platforms
   * Migrate all previously independently stored storage keys into new
   * managed approach. Also deletes any legacy values from raw storage.
   * @access private
   */


  async migrateArbitraryRawStorageToManagedStorageAllPlatforms() {
    const allKeyValues = await this.services.deviceInterface.getAllRawStorageKeyValues();
    const legacyKeys = Object(utils["x" /* objectToValueArray */])(LegacyKeys);

    const tryJsonParse = value => {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    };

    const applicationIdentifier = this.services.identifier;

    for (const keyValuePair of allKeyValues) {
      const key = keyValuePair.key;
      const value = keyValuePair.value;
      const isNameSpacedKey = applicationIdentifier && applicationIdentifier.length > 0 && key.startsWith(applicationIdentifier);

      if (legacyKeys.includes(key) || isNameSpacedKey) {
        continue;
      }

      if (!Object(utils["p" /* isNullOrUndefined */])(value)) {
        /**
         * Raw values should always have been json stringified.
         * New values should always be objects/parsed.
         */
        const newValue = tryJsonParse(value);
        await this.services.storageService.setValue(key, newValue);
      }
    }
  }
  /**
   * All platforms
   * Deletes all StorageKey and LegacyKeys from root raw storage.
   * @access private
   */


  async deleteLegacyStorageValues() {
    const miscKeys = ['mk', 'ak', 'jwt', 'ephemeral', 'cachedThemes'];
    const managedKeys = [...Object(utils["x" /* objectToValueArray */])(StorageKey), ...Object(utils["x" /* objectToValueArray */])(LegacyKeys), ...miscKeys];

    for (const key of managedKeys) {
      await this.services.deviceInterface.removeRawStorageValue(key);
    }
  }
  /**
   * All platforms
   * Migrate previously stored session string token into object
   * @access private
   */


  async migrateSessionStorage() {
    const LEGACY_SESSION_TOKEN_KEY = 'jwt';
    const currentToken = await this.services.storageService.getValue(LEGACY_SESSION_TOKEN_KEY);

    if (!currentToken) {
      return;
    }

    const session = new JwtSession(currentToken);
    await this.services.storageService.setValue(StorageKey.Session, session);
  }
  /**
   * All platforms
   * Create new default SNItemsKey from root key.
   * Otherwise, when data is loaded, we won't be able to decrypt it
   * without existence of an item key. This will mean that if this migration
   * is run on two different platforms for the same user, they will create
   * two new items keys. Which one they use to decrypt past items and encrypt
   * future items doesn't really matter.
   * @access private
   */


  async createDefaultItemsKeyForAllPlatforms() {
    const rootKey = await this.services.protocolService.getRootKey();

    if (rootKey) {
      const rootKeyParams = await this.services.protocolService.getRootKeyParams();
      const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
        uuid: await uuid_Uuid.GenerateUuid(),
        content_type: content_types["a" /* ContentType */].ItemsKey,
        content: Object(functions["a" /* FillItemContent */])({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: rootKeyParams.version
        }),
        dirty: true,
        dirtiedDate: new Date()
      });
      const itemsKey = CreateItemFromPayload(payload);
      await this.services.itemManager.emitItemFromPayload(itemsKey.payloadRepresentation(), sources["a" /* PayloadSource */].LocalChanged);
    }
  }

}
// CONCATENATED MODULE: ./lib/migrations/index.ts

// CONCATENATED MODULE: ./lib/migrations/2020-01-01-base.ts




class _2020_01_01_base_BaseMigration extends Migration {
  static timestamp() {
    return new Date('2020-01-01').getTime();
  }

  registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      await this.migrateMigrationTimestampAllPlatforms();
      this.markDone();
    });
  }
  /**
   * Establish last_migration_date.
   * We need to determine if this is a new application download,
   * or if we're coming from an older, non-current client.
   *
   * If new application download, we expect last_migration_date
   * to be null. However, last_migration_date can also be null if you
   * haven't yet migration to using this system.
   *
   * So in addition to this date being null, we check if deviceInterface
   * has pre-existing storage values for old migration system.
   * If so, this means this is a legacy client making its first jump to
   * this new migration system.
   */


  async migrateMigrationTimestampAllPlatforms() {
    /** If any of these keys exist in raw storage, we are coming from a previous application version */
    const possibleLegacyKeys = ['migrations', 'ephemeral', 'user', 'cachedThemes', 'syncToken', 'encryptedStorage'];
    let hasLegacyValue = false;

    for (const legacyKey of possibleLegacyKeys) {
      const value = await this.services.deviceInterface.getRawStorageValue(legacyKey);

      if (value) {
        hasLegacyValue = true;
        break;
      }
    }

    const newKey = namespacedKey(this.services.identifier, RawStorageKey.LastMigrationTimestamp);
    const lastDate = await this.services.deviceInterface.getRawStorageValue(newKey);
    const hasNewStructure = !Object(utils["p" /* isNullOrUndefined */])(lastDate);

    if (!hasNewStructure && hasLegacyValue) {
      /**
       * Old client updating for the first time. We need to run all migrations.
       * Set last migration date as epoch.
       */
      const newLastMigrationDate = new Date(0).getTime();
      await this.services.deviceInterface.setRawStorageValue(newKey, newLastMigrationDate);
    } else if (!hasNewStructure && !hasLegacyValue) {
      /** New application, dont run any migrations. Set last migration date as now. */
      const newLastMigrationDate = new Date().getTime();
      await this.services.deviceInterface.setRawStorageValue(newKey, newLastMigrationDate);
    } else if (hasNewStructure) {
      /** Application which has already performed base migration. Keep date as is. */
    }
  }

}
// CONCATENATED MODULE: ./lib/services/migration_service.ts







/**
 * The migration service orchestrates the execution of multi-stage migrations.
 * Migrations are registered during initial application launch, and listen for application
 * life-cycle events, and act accordingly. Migrations operate on the app-level, and not global level.
 * For example, a single migration may perform a unique set of steps when the application
 * first launches, and also other steps after the application is unlocked, or after the
 * first sync completes. Migrations live under /migrations and inherit from the base Migration class.
 */

class migration_service_SNMigrationService extends pure_service["a" /* PureService */] {
  constructor(services) {
    super();
    this.services = services;
    this.handledFullSyncStage = false;
  }

  deinit() {
    this.services = undefined;

    if (this.activeMigrations) {
      this.activeMigrations.length = 0;
    }

    super.deinit();
  }

  async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();

    if (this.activeMigrations.length > 0) {
      const lastMigration = Object(utils["w" /* lastElement */])(this.activeMigrations);
      lastMigration.onDone(async () => {
        await this.saveLastMigrationTimestamp(lastMigration.constructor.timestamp());
      });
    }
  }
  /**
   * Application instances will call this function directly when they arrive
   * at a certain migratory state.
   */


  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);
    await this.handleStage(stage);
  }
  /**
   * Called by application
   */


  async handleApplicationEvent(event) {
    if (event === events["a" /* ApplicationEvent */].SignedIn) {
      await this.handleStage(ApplicationStage.SignedIn_30);
    } else if (event === events["a" /* ApplicationEvent */].CompletedFullSync) {
      if (!this.handledFullSyncStage) {
        this.handledFullSyncStage = true;
        await this.handleStage(ApplicationStage.FullSyncCompleted_13);
      }
    }
  }

  async runBaseMigration() {
    const baseMigration = new _2020_01_01_base_BaseMigration(this.services);
    await baseMigration.handleStage(ApplicationStage.PreparingForLaunch_0);
  }

  async hasPendingMigrations() {
    return (await this.getRequiredMigrations()).length > 0;
  }

  async getRequiredMigrations() {
    const lastMigrationTimestamp = await this.getLastMigrationTimestamp();
    const activeMigrations = [];
    const migrationClasses = Object.keys(migrations_namespaceObject).map(key => {
      return migrations_namespaceObject[key];
    }).sort((a, b) => {
      const aTimestamp = a.timestamp();
      const bTimestamp = b.timestamp();

      if (aTimestamp < bTimestamp) {
        return -1;
      } else if (aTimestamp > bTimestamp) {
        return 1;
      } else {
        return 0;
      }
    });

    for (const migrationClass of migrationClasses) {
      const migrationTimestamp = migrationClass.timestamp();

      if (migrationTimestamp > lastMigrationTimestamp) {
        // eslint-disable-next-line new-cap
        activeMigrations.push(new migrationClass(this.services));
      }
    }

    return activeMigrations;
  }

  getNamespacedTimeStampKey() {
    return namespacedKey(this.services.identifier, RawStorageKey.LastMigrationTimestamp);
  }

  async getLastMigrationTimestamp() {
    const timestamp = await this.services.deviceInterface.getRawStorageValue(this.getNamespacedTimeStampKey());

    if (Object(utils["p" /* isNullOrUndefined */])(timestamp)) {
      throw 'Timestamp should not be null. Be sure to run base migration first.';
    }

    return JSON.parse(timestamp);
  }

  async saveLastMigrationTimestamp(timestamp) {
    await this.services.deviceInterface.setRawStorageValue(this.getNamespacedTimeStampKey(), JSON.stringify(timestamp));
  }

  async handleStage(stage) {
    for (const migration of this.activeMigrations) {
      await migration.handleStage(stage);
    }
  }

}
// CONCATENATED MODULE: ./lib/protocol/key_params.ts


function CreateKeyParams(keyParams) {
  return new key_params_SNRootKeyParams(keyParams);
}
/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */

class key_params_SNRootKeyParams {
  constructor(content) {
    this.content = content;
  }
  /**
   * For consumers to determine whether the object they are
   * working with is a proper RootKeyParams object.
   */


  get isKeyParamsObject() {
    return true;
  }

  get kdfIterations() {
    return this.content.pw_cost;
  }

  get seed() {
    return this.content.pw_nonce;
  }

  get identifier() {
    return this.content.identifier || this.content.email;
  }

  get salt() {
    return this.content.pw_salt;
  }

  get version() {
    return this.content.version;
  }
  /**
   * @access public
   * When saving in a file or communicating with server,
   * use the original values.
   */


  getPortableValue() {
    /**
     * For version >= 003, do not send kdfIterations, as this value is always deduced
     * locally depending on the version.
     * Versions <= 002 had dynamic kdfIterations, so these values must be transfered.
     */
    if (Object(versions["b" /* compareVersions */])(this.version, versions["a" /* ProtocolVersion */].V003) >= 0) {
      return Object(utils["y" /* omitByCopy */])(this.content, ['pw_cost']);
    } else {
      return this.content;
    }
  }

}
// CONCATENATED MODULE: ./lib/protocol/operator/algorithms.ts
var V001Algorithm;

(function (V001Algorithm) {
  V001Algorithm[V001Algorithm["SaltSeedLength"] = 128] = "SaltSeedLength";
  V001Algorithm[V001Algorithm["PbkdfMinCost"] = 3000] = "PbkdfMinCost";
  V001Algorithm[V001Algorithm["PbkdfOutputLength"] = 512] = "PbkdfOutputLength";
  V001Algorithm[V001Algorithm["EncryptionKeyLength"] = 256] = "EncryptionKeyLength";
})(V001Algorithm || (V001Algorithm = {}));

var V002Algorithm;

(function (V002Algorithm) {
  V002Algorithm[V002Algorithm["SaltSeedLength"] = 128] = "SaltSeedLength";
  V002Algorithm[V002Algorithm["PbkdfMinCost"] = 3000] = "PbkdfMinCost";
  V002Algorithm[V002Algorithm["PbkdfOutputLength"] = 768] = "PbkdfOutputLength";
  V002Algorithm[V002Algorithm["EncryptionKeyLength"] = 256] = "EncryptionKeyLength";
  V002Algorithm[V002Algorithm["EncryptionIvLength"] = 128] = "EncryptionIvLength";
})(V002Algorithm || (V002Algorithm = {}));

var V003Algorithm;

(function (V003Algorithm) {
  V003Algorithm[V003Algorithm["SaltSeedLength"] = 256] = "SaltSeedLength";
  V003Algorithm[V003Algorithm["PbkdfCost"] = 110000] = "PbkdfCost";
  V003Algorithm[V003Algorithm["PbkdfOutputLength"] = 768] = "PbkdfOutputLength";
  V003Algorithm[V003Algorithm["EncryptionKeyLength"] = 256] = "EncryptionKeyLength";
  V003Algorithm[V003Algorithm["EncryptionIvLength"] = 128] = "EncryptionIvLength";
})(V003Algorithm || (V003Algorithm = {}));

var V004Algorithm;

(function (V004Algorithm) {
  V004Algorithm[V004Algorithm["ArgonSaltSeedLength"] = 256] = "ArgonSaltSeedLength";
  V004Algorithm[V004Algorithm["ArgonSaltLength"] = 128] = "ArgonSaltLength";
  V004Algorithm[V004Algorithm["ArgonIterations"] = 5] = "ArgonIterations";
  V004Algorithm[V004Algorithm["ArgonMemLimit"] = 67108864] = "ArgonMemLimit";
  V004Algorithm[V004Algorithm["ArgonOutputKeyBytes"] = 64] = "ArgonOutputKeyBytes";
  V004Algorithm[V004Algorithm["EncryptionKeyLength"] = 256] = "EncryptionKeyLength";
  V004Algorithm[V004Algorithm["EncryptionNonceLength"] = 192] = "EncryptionNonceLength";
})(V004Algorithm || (V004Algorithm = {}));
// CONCATENATED MODULE: ./lib/protocol/operator/operator.ts







/**w
 * An operator is responsible for performing crypto operations, such as generating keys
 * and encrypting/decrypting payloads. Operators interact directly with
 * platform dependent SNPureCrypto implementation to directly access cryptographic primitives.
 * Each operator is versioned according to the protocol version. Functions that are common
 * across all versions appear in this generic parent class.
 */

class operator_SNProtocolOperator {
  constructor(crypto) {
    this.crypto = crypto;
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length / 2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length / 2, key.length);
  }

  splitKey(key, parts) {
    const outputLength = key.length;
    const partLength = outputLength / parts;
    const partitions = [];

    for (let i = 0; i < parts; i++) {
      const partition = key.slice(partLength * i, partLength * (i + 1));
      partitions.push(partition);
    }

    return partitions;
  }
  /**
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   */


  async createItemsKey() {
    const content = await this.generateNewItemsKeyContent();
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
      uuid: await uuid_Uuid.GenerateUuid(),
      content_type: content_types["a" /* ContentType */].ItemsKey,
      content: Object(functions["a" /* FillItemContent */])(content)
    });
    return CreateItemFromPayload(payload);
  }
  /**
  * Converts a bare payload into an encrypted one in the desired format.
  * @param payload - The non-encrypted payload object to encrypt
  * @param key - The key to use to encrypt the payload. Can be either
  *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
  * items keys), or an ItemsKey (if encrypted regular items)
  * @param format - The desired result format
  */


  async generateEncryptedParameters(payload, format, key) {
    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject) {
      return Object(generator["c" /* CreateEncryptionParameters */])({
        content: payload.content
      });
    } else if (format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      const jsonString = JSON.stringify(payload.content);
      const base64String = await this.crypto.base64Encode(jsonString);
      const content = versions["a" /* ProtocolVersion */].V000Base64Decrypted + base64String;
      return Object(generator["c" /* CreateEncryptionParameters */])({
        content: content
      });
    } else {
      throw "Must override generateEncryptedParameters to handle format ".concat(format, ".");
    }
  }
  /**
  * Converts encrypted parameters (a subset of a Payload) into decrypted counterpart.
  * @param encryptedParameters - The encrypted payload object to decrypt
  * @param key - The key to use to decrypt the payload. Can be either
  *  a RootKey (when encrypting payloads that require root key encryption, such as encrypting
  * items keys), or an ItemsKey (if encrypted regular items)
  */


  async generateDecryptedParameters(encryptedParameters, key) {
    const format = encryptedParameters.format;

    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject) {
      /** No decryption required */
      return encryptedParameters;
    } else if (format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      const contentString = encryptedParameters.contentString.substring(versions["a" /* ProtocolVersion */].VersionLength, encryptedParameters.contentString.length);
      let decodedContent;

      try {
        const jsonString = await this.crypto.base64Decode(contentString);
        decodedContent = JSON.parse(jsonString);
      } catch (e) {
        decodedContent = encryptedParameters.content;
      }

      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        content: decodedContent
      });
    } else {
      throw Error("Must override generateDecryptedParameters to handle format ".concat(format, "."));
    }
  }

}
// CONCATENATED MODULE: ./lib/protocol/operator/001/operator_001.ts








const NO_IV = '00000000000000000000000000000000';
/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts
 */

class operator_001_SNProtocolOperator001 extends operator_SNProtocolOperator {
  getEncryptionDisplayName() {
    return 'AES-256';
  }

  get version() {
    return versions["a" /* ProtocolVersion */].V001;
  }

  async generateNewItemsKeyContent() {
    const keyLength = V001Algorithm.EncryptionKeyLength;
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const response = {
      itemsKey: itemsKey,
      version: this.version
    };
    return response;
  }

  async createRootKey(identifier, password) {
    const pwCost = V001Algorithm.PbkdfMinCost;
    const pwNonce = await this.crypto.generateRandomKey(V001Algorithm.SaltSeedLength);
    const pwSalt = await this.crypto.unsafeSha1(identifier + 'SN' + pwNonce);
    const key = await this.deriveKey(password, pwSalt, pwCost);
    const keyParams = CreateKeyParams({
      email: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      pw_salt: pwSalt,
      version: this.version
    });
    return {
      key: key,
      keyParams: keyParams
    };
  }

  async computeRootKey(password, keyParams) {
    const key = await this.deriveKey(password, keyParams.salt, keyParams.kdfIterations);
    return key;
  }

  async decryptString(ciphertext, key) {
    return this.crypto.aes256CbcDecrypt(ciphertext, NO_IV, key);
  }

  async encryptString(text, key) {
    return this.crypto.aes256CbcEncrypt(text, NO_IV, key);
  }

  async generateEncryptedParameters(payload, format, key) {
    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateEncryptedParameters(payload, format, key);
    }

    if (format !== formats["a" /* PayloadFormat */].EncryptedString) {
      throw "Unsupport format for generateEncryptedParameters ".concat(format);
    }

    if (!key) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.';
    }
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */


    const itemKey = await this.crypto.generateRandomKey(V001Algorithm.EncryptionKeyLength * 2);
    const encItemKey = await this.encryptString(itemKey, key.itemsKey);
    /** Encrypt content */

    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const contentCiphertext = await this.encryptString(JSON.stringify(payload.content), ek);
    const ciphertext = key.version + contentCiphertext;
    const authHash = await this.crypto.hmac256(ciphertext, ak);
    return Object(generator["c" /* CreateEncryptionParameters */])({
      uuid: payload.uuid,
      items_key_id: key instanceof items_key_SNItemsKey ? key.uuid : undefined,
      content: ciphertext,
      enc_item_key: encItemKey,
      auth_hash: authHash
    });
  }

  async generateDecryptedParameters(encryptedParameters, key) {
    const format = encryptedParameters.format;

    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateDecryptedParameters(encryptedParameters, key);
    }

    if (!encryptedParameters.enc_item_key) {
      console.error('Missing item encryption key, skipping decryption.');
      return encryptedParameters;
    }
    /** Decrypt encrypted key */


    let encryptedItemKey = encryptedParameters.enc_item_key;
    encryptedItemKey = this.version + encryptedItemKey;
    const itemKeyComponents = this.encryptionComponentsFromString(encryptedItemKey, key.itemsKey);
    const itemKey = await this.decryptString(itemKeyComponents.ciphertext, itemKeyComponents.key);

    if (!itemKey) {
      console.error('Error decrypting parameters', encryptedParameters);
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    }

    const ek = await this.firstHalfOfKey(itemKey);
    const itemParams = this.encryptionComponentsFromString(encryptedParameters.contentString, ek);
    const content = await this.decryptString(itemParams.ciphertext, itemParams.key);

    if (!content) {
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    } else {
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        errorDecrypting: false,
        errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
        waitingForKey: false
      });
    }
  }

  encryptionComponentsFromString(string, encryptionKey) {
    const encryptionVersion = string.substring(0, versions["a" /* ProtocolVersion */].VersionLength);
    return {
      ciphertext: string.substring(versions["a" /* ProtocolVersion */].VersionLength, string.length),
      version: encryptionVersion,
      key: encryptionKey
    };
  }

  async deriveKey(password, pwSalt, pwCost) {
    const derivedKey = await this.crypto.pbkdf2(password, pwSalt, pwCost, V001Algorithm.PbkdfOutputLength);
    const partitions = await this.splitKey(derivedKey, 2);
    const key = await root_key_SNRootKey.Create({
      serverPassword: partitions[0],
      masterKey: partitions[1],
      version: this.version
    });
    return key;
  }

}
// CONCATENATED MODULE: ./lib/protocol/operator/002/operator_002.ts








/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts.
 */

class operator_002_SNProtocolOperator002 extends operator_001_SNProtocolOperator001 {
  get version() {
    return versions["a" /* ProtocolVersion */].V002;
  }

  async generateNewItemsKeyContent() {
    const keyLength = V002Algorithm.EncryptionKeyLength;
    const itemsKey = await this.crypto.generateRandomKey(keyLength);
    const authKey = await this.crypto.generateRandomKey(keyLength);
    const response = {
      itemsKey: itemsKey,
      dataAuthenticationKey: authKey,
      version: this.version
    };
    return response;
  }

  async createRootKey(identifier, password) {
    const pwCost = V002Algorithm.PbkdfMinCost;
    const pwNonce = await this.crypto.generateRandomKey(V002Algorithm.SaltSeedLength);
    const pwSalt = await this.crypto.unsafeSha1(identifier + ':' + pwNonce);
    const key = await this.deriveKey(password, pwSalt, pwCost);
    const keyParams = CreateKeyParams({
      email: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      pw_salt: pwSalt,
      version: this.version
    });
    return {
      key,
      keyParams
    };
  }
  /**
   * Note that version 002 supported "dynamic" iteration counts. Some accounts
   * may have had costs of 5000, and others of 101000. Therefore, when computing
   * the root key, we must use the value returned by the server.
   */


  async computeRootKey(password, keyParams) {
    /* Salt is returned from server */
    const key = await this.deriveKey(password, keyParams.salt, keyParams.kdfIterations);
    return key;
  }

  async decryptString002(text, key, iv) {
    return this.crypto.aes256CbcDecrypt(text, iv, key);
  }

  async encryptString002(text, key, iv) {
    return this.crypto.aes256CbcEncrypt(text, iv, key);
  }

  async encryptTextParams(string, encryptionKey, authKey, uuid, version) {
    const iv = await this.crypto.generateRandomKey(V002Algorithm.EncryptionIvLength);
    const contentCiphertext = await this.encryptString002(string, encryptionKey, iv);
    const ciphertextToAuth = [version, uuid, iv, contentCiphertext].join(':');
    const authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
    const fullCiphertext = [version, authHash, uuid, iv, contentCiphertext].join(':');
    return fullCiphertext;
  }

  async decryptTextParams(ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey) {
    if (!encryptionKey) {
      throw 'Attempting to decryptTextParams with null encryptionKey';
    }

    const localAuthHash = await this.crypto.hmac256(ciphertextToAuth, authKey);

    if (this.crypto.timingSafeEqual(authHash, localAuthHash) === false) {
      console.error('Auth hash does not match, returning null.');
      return null;
    }

    return this.decryptString002(contentCiphertext, encryptionKey, iv);
  }

  async generateEncryptedParameters(payload, format, key) {
    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateEncryptedParameters(payload, format, key);
    }

    if (format !== formats["a" /* PayloadFormat */].EncryptedString) {
      throw "Unsupport format for generateEncryptedParameters ".concat(format);
    }

    if (!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.';
    }
    /**
     * Generate new item key that is double the key size.
     * Will be split to create encryption key and authentication key.
     */


    const itemKey = await this.crypto.generateRandomKey(V002Algorithm.EncryptionKeyLength * 2);
    const encItemKey = await this.encryptTextParams(itemKey, key.itemsKey, key.dataAuthenticationKey, payload.uuid, key.version);
    /** Encrypt content */

    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const ciphertext = await this.encryptTextParams(JSON.stringify(payload.content), ek, ak, payload.uuid, key.version);
    return Object(generator["c" /* CreateEncryptionParameters */])({
      uuid: payload.uuid,
      items_key_id: key instanceof items_key_SNItemsKey ? key.uuid : undefined,
      content: ciphertext,
      enc_item_key: encItemKey
    });
  }

  async generateDecryptedParameters(encryptedParameters, key) {
    const format = encryptedParameters.format;

    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateDecryptedParameters(encryptedParameters, key);
    }

    if (!encryptedParameters.enc_item_key) {
      console.error('Missing item encryption key, skipping decryption.');
      return encryptedParameters;
    }

    if (!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }
    /* Decrypt encrypted key */


    const encryptedItemKey = encryptedParameters.enc_item_key;
    const itemKeyComponents = this.encryptionComponentsFromString002(encryptedItemKey, key.itemsKey, key.dataAuthenticationKey);
    const itemKey = await this.decryptTextParams(itemKeyComponents.ciphertextToAuth, itemKeyComponents.contentCiphertext, itemKeyComponents.encryptionKey, itemKeyComponents.iv, itemKeyComponents.authHash, itemKeyComponents.authKey);

    if (!itemKey) {
      console.error('Error decrypting item_key parameters', encryptedParameters);
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    }
    /* Decrypt content */


    const ek = await this.firstHalfOfKey(itemKey);
    const ak = await this.secondHalfOfKey(itemKey);
    const itemParams = this.encryptionComponentsFromString002(encryptedParameters.contentString, ek, ak);
    const content = await this.decryptTextParams(itemParams.ciphertextToAuth, itemParams.contentCiphertext, itemParams.encryptionKey, itemParams.iv, itemParams.authHash, itemParams.authKey);

    if (!content) {
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    } else {
      let authParams;

      try {
        authParams = JSON.parse(await this.crypto.base64Decode(itemParams.authParams)); // eslint-disable-next-line no-empty
      } catch (e) {}

      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        auth_params: authParams,
        errorDecrypting: false,
        errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
        waitingForKey: false
      });
    }
  }

  async deriveKey(password, pwSalt, pwCost) {
    const derivedKey = await this.crypto.pbkdf2(password, pwSalt, pwCost, V002Algorithm.PbkdfOutputLength);
    const partitions = await this.splitKey(derivedKey, 3);
    const key = await root_key_SNRootKey.Create({
      serverPassword: partitions[0],
      masterKey: partitions[1],
      dataAuthenticationKey: partitions[2],
      version: this.version
    });
    return key;
  }

  encryptionComponentsFromString002(string, encryptionKey, authKey) {
    const components = string.split(':');
    return {
      encryptionVersion: components[0],
      authHash: components[1],
      uuid: components[2],
      iv: components[3],
      contentCiphertext: components[4],
      authParams: components[5],
      ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(':'),
      encryptionKey: encryptionKey,
      authKey: authKey
    };
  }

}
// CONCATENATED MODULE: ./lib/protocol/operator/003/operator_003.ts




/**
 * @deprecated
 * Non-expired operator but no longer used for generating new accounts.
 * This operator subclasses the 002 operator to share functionality that has not
 * changed, and overrides functions where behavior may differ.
 */

class operator_003_SNProtocolOperator003 extends operator_002_SNProtocolOperator002 {
  get version() {
    return versions["a" /* ProtocolVersion */].V003;
  }

  async computeRootKey(password, keyParams) {
    /** Unlike 002, 003 uses a hardcoded cost and not a variable one.
     * Therefore, we always use our own hardcoded value and not what is offered by
     * input keyParams. */
    const pwCost = V003Algorithm.PbkdfCost;
    const version = this.version;
    const salt = await this.generateSalt(keyParams.identifier, version, pwCost, keyParams.seed);
    const key = await this.deriveKey(password, salt, pwCost);
    return key;
  }

  async createRootKey(identifier, password) {
    const version = this.version;
    const pwCost = V003Algorithm.PbkdfCost;
    const pwNonce = await this.crypto.generateRandomKey(V003Algorithm.SaltSeedLength);
    const pwSalt = await this.generateSalt(identifier, version, pwCost, pwNonce);
    const key = await this.deriveKey(password, pwSalt, pwCost);
    const keyParams = CreateKeyParams({
      identifier: identifier,
      pw_cost: pwCost,
      pw_nonce: pwNonce,
      version: version
    });
    return {
      key: key,
      keyParams: keyParams
    };
  }

  async generateSalt(identifier, version, cost, nonce) {
    const result = await this.crypto.sha256([identifier, 'SF', version, cost, nonce].join(':'));
    return result;
  }

}
// CONCATENATED MODULE: ./lib/protocol/operator/004/operator_004.ts









const PARTITION_CHARACTER = ':';
class operator_004_SNProtocolOperator004 extends operator_003_SNProtocolOperator003 {
  getEncryptionDisplayName() {
    return 'XChaCha20-Poly1305';
  }

  get version() {
    return versions["a" /* ProtocolVersion */].V004;
  }

  async generateNewItemsKeyContent() {
    const itemsKey = await this.crypto.generateRandomKey(V004Algorithm.EncryptionKeyLength);
    const response = {
      itemsKey: itemsKey,
      version: this.version
    };
    return response;
  }
  /**
   * We require both a client-side component and a server-side component in generating a
   * salt. This way, a comprimised server cannot benefit from sending the same seed value
   * for every user. We mix a client-controlled value that is globally unique
   * (their identifier), with a server controlled value to produce a salt for our KDF.
   * @param identifier
   * @param seed
  */


  async generateSalt004(identifier, seed) {
    const hash = await this.crypto.sha256([identifier, seed].join(PARTITION_CHARACTER));
    return Object(utils["I" /* truncateHexString */])(hash, V004Algorithm.ArgonSaltLength);
  }
  /**
   * Computes a root key given a password and previous keyParams
   * @param password - Plain string representing raw user password
   * @param keyParams - KeyParams object
   */


  async computeRootKey(password, keyParams) {
    const salt = await this.generateSalt004(keyParams.identifier, keyParams.seed);
    const key = await this.deriveKey(password, salt, V004Algorithm.ArgonIterations);
    return key;
  }
  /**
   * Creates a new root key given an identifier and a user password
   * @param identifier - Plain string representing a unique identifier
   * @param password - Plain string representing raw user password
   */


  async createRootKey(identifier, password) {
    const version = this.version;
    const iterations = V004Algorithm.ArgonIterations;
    const seed = await this.crypto.generateRandomKey(V004Algorithm.ArgonSaltSeedLength);
    const salt = await this.generateSalt004(identifier, seed);
    const key = await this.deriveKey(password, salt, iterations);
    const keyParams = CreateKeyParams({
      identifier: identifier,
      pw_cost: iterations,
      pw_nonce: seed,
      version: version
    });
    return {
      key: key,
      keyParams: keyParams
    };
  }
  /**
   * @param plaintext - The plaintext to encrypt.
   * @param rawKey - The key to use to encrypt the plaintext.
   * @param nonce - The nonce for encryption.
   * @param aad - JavaScript object (will be stringified) representing
                'Additional authenticated data': data you want to be included in authentication.
   */


  async encryptString004(plaintext, rawKey, nonce, aad) {
    if (!nonce) {
      throw 'encryptString null nonce';
    }

    if (!rawKey) {
      throw 'encryptString null rawKey';
    }

    return this.crypto.xchacha20Encrypt(plaintext, nonce, rawKey, JSON.stringify(aad));
  }
  /**
   * @param {string} ciphertext  The encrypted text to decrypt.
   * @param {string} rawKey  The key to use to decrypt the ciphertext.
   * @param {string} nonce  The nonce for decryption.
   * @param {object} aad  JavaScript object (will be stringified) representing
                'Additional authenticated data' - data you want to be included in authentication.
   */


  async decryptString004(ciphertext, rawKey, nonce, aad) {
    return this.crypto.xchacha20Decrypt(ciphertext, nonce, rawKey, JSON.stringify(aad));
  }
  /**
   * @param plaintext  The plaintext text to decrypt.
   * @param rawKey  The key to use to encrypt the plaintext.
   * @param itemUuid  The uuid of the item being encrypted
   */


  async generateEncryptedProtocolString(plaintext, rawKey, itemUuid) {
    const nonce = await this.crypto.generateRandomKey(V004Algorithm.EncryptionNonceLength);
    const version = this.version;
    const ciphertext = await this.encryptString004(plaintext, rawKey, nonce, {
      u: itemUuid,
      v: version
    });
    const payload = [version, nonce, ciphertext].join(PARTITION_CHARACTER);
    return payload;
  }

  async generateEncryptedParameters(payload, format, key) {
    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateEncryptedParameters(payload, format, key);
    }

    if (format !== formats["a" /* PayloadFormat */].EncryptedString) {
      throw "Unsupport format for generateEncryptedParameters ".concat(format);
    }

    if (!payload.uuid) {
      throw 'payload.uuid cannot be null';
    }

    if (!key || !key.itemsKey) {
      throw 'Attempting to generateEncryptedParameters with no itemsKey.';
    }

    const itemKey = await this.crypto.generateRandomKey(V004Algorithm.EncryptionKeyLength);
    /** Encrypt content with item_key */

    const contentPlaintext = JSON.stringify(payload.content);
    const encryptedContentString = await this.generateEncryptedProtocolString(contentPlaintext, itemKey, payload.uuid);
    /** Encrypt item_key with master itemEncryptionKey */

    const encryptedItemKey = await this.generateEncryptedProtocolString(itemKey, key.itemsKey, payload.uuid);
    return Object(generator["c" /* CreateEncryptionParameters */])({
      uuid: payload.uuid,
      items_key_id: key instanceof items_key_SNItemsKey ? key.uuid : undefined,
      content: encryptedContentString,
      enc_item_key: encryptedItemKey
    });
  }

  async generateDecryptedParameters(encryptedParameters, key) {
    const format = encryptedParameters.format;

    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject || format === formats["a" /* PayloadFormat */].DecryptedBase64String) {
      return super.generateDecryptedParameters(encryptedParameters, key);
    }

    if (!encryptedParameters.uuid) {
      throw 'encryptedParameters.uuid cannot be null';
    }

    if (!key || !key.itemsKey) {
      throw 'Attempting to generateDecryptedParameters with no itemsKey.';
    }
    /** Decrypt item_key payload. */


    const itemKeyComponents = this.deconstructEncryptedPayloadString(encryptedParameters.enc_item_key);
    const itemKey = await this.decryptString004(itemKeyComponents.ciphertext, key.itemsKey, itemKeyComponents.nonce, {
      u: encryptedParameters.uuid,
      v: itemKeyComponents.version
    });

    if (!itemKey) {
      console.error('Error decrypting itemKey parameters', encryptedParameters);
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    }
    /** Decrypt content payload. */


    const contentComponents = this.deconstructEncryptedPayloadString(encryptedParameters.contentString);
    const content = await this.decryptString004(contentComponents.ciphertext, itemKey, contentComponents.nonce, {
      u: encryptedParameters.uuid,
      v: contentComponents.version
    });

    if (!content) {
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !encryptedParameters.errorDecrypting
      });
    } else {
      return Object(generator["a" /* CopyEncryptionParameters */])(encryptedParameters, {
        content: JSON.parse(content),
        items_key_id: undefined,
        enc_item_key: undefined,
        errorDecrypting: false,
        errorDecryptingValueChanged: encryptedParameters.errorDecrypting === true,
        waitingForKey: false
      });
    }
  }

  deconstructEncryptedPayloadString(payloadString) {
    const components = payloadString.split(PARTITION_CHARACTER);
    return {
      version: components[0],
      nonce: components[1],
      ciphertext: components[2]
    };
  }

  async deriveKey(password, salt, iterations) {
    const derivedKey = await this.crypto.argon2(password, salt, iterations, V004Algorithm.ArgonMemLimit, V004Algorithm.ArgonOutputKeyBytes);
    const partitions = this.splitKey(derivedKey, 2);
    const masterKey = partitions[0];
    const serverPassword = partitions[1];
    return root_key_SNRootKey.Create({
      masterKey,
      serverPassword,
      version: this.version
    });
  }

}
// CONCATENATED MODULE: ./lib/protocol/index.ts








// CONCATENATED MODULE: ./lib/services/protocol_service.ts
























var KeyMode;

(function (KeyMode) {
  /** i.e No account and no passcode */
  KeyMode[KeyMode["RootKeyNone"] = 0] = "RootKeyNone";
  /** i.e Account but no passcode */

  KeyMode[KeyMode["RootKeyOnly"] = 1] = "RootKeyOnly";
  /** i.e Account plus passcode */

  KeyMode[KeyMode["RootKeyPlusWrapper"] = 2] = "RootKeyPlusWrapper";
  /** i.e No account, but passcode */

  KeyMode[KeyMode["WrapperOnly"] = 3] = "WrapperOnly";
})(KeyMode || (KeyMode = {}));
/** The last protocol version to not use root-key based items keys */


const LAST_NONROOT_ITEMS_KEY_VERSION = versions["a" /* ProtocolVersion */].V003;
/**
 * The protocol service is responsible for the encryption and decryption of payloads, and
 * handles delegation of a task to the respective protocol operator. Each version of the protocol
 * (001, 002, 003, 004, etc) uses a respective operator version to perform encryption operations.
 * Operators are located in /protocol/operator.
 * The protocol service depends on the keyManager for determining which key to use for the
 * encryption and decryption of a particular payload.
 * The protocol service is also responsible for dictating which protocol versions are valid,
 * and which are no longer valid or not supported.

 * The key manager is responsible for managing root key and root key wrapper states.
 * When the key manager is initialized, it initiates itself with a keyMode, which
 * dictates the entire flow of key management. The key manager's responsibilities include:
 * - interacting with the device keychain to save or clear the root key
 * - interacting with storage to save root key params or wrapper params, or the wrapped root key.
 * - exposing methods that allow the application to unwrap the root key (unlock the application)
 *
 * It also exposes two primary methods for determining what key should be used to encrypt
 * or decrypt a particular payload. Some payloads are encrypted directly with the rootKey
 * (such as itemsKeys and encryptedStorage). Others are encrypted with itemsKeys (notes, tags, etc).

 * The items key manager manages the lifecycle of items keys.
 * It is responsible for creating the default items key when conditions call for it
 * (such as after the first sync completes and no key exists).
 * It also exposes public methods that allows consumers to retrieve an items key
 * for a particular payload, and also retrieve all available items keys.
*/

class protocol_service_SNProtocolService extends pure_service["a" /* PureService */] {
  constructor(itemManager, modelManager, deviceInterface, storageService, identifier, crypto) {
    super();
    this.identifier = identifier;
    this.operators = {};
    this.keyMode = KeyMode.RootKeyNone;
    this.keyObservers = [];
    this.itemManager = itemManager;
    this.modelManager = modelManager;
    this.deviceInterface = deviceInterface;
    this.storageService = storageService;
    this.crypto = crypto;

    if (Object(utils["r" /* isReactNativeEnvironment */])()) {
      uuid_Uuid.SetGenerators(this.crypto.generateUUID, undefined // no sync implementation on React Native
      );
    } else {
      uuid_Uuid.SetGenerators(this.crypto.generateUUID, this.crypto.generateUUIDSync);
    }
    /** Hide rootKey enumeration */


    Object.defineProperty(this, 'rootKey', {
      enumerable: false,
      writable: true
    });
    this.removeItemsObserver = this.itemManager.addObserver([content_types["a" /* ContentType */].ItemsKey], (_, inserted) => {
      if (inserted.length > 0) {
        this.decryptErroredItems();
      }
    });
  }
  /** @override */


  deinit() {
    this.itemManager = undefined;
    this.modelManager = undefined;
    this.deviceInterface = undefined;
    this.storageService = undefined;
    this.crypto.deinit();
    this.crypto = undefined;
    this.operators = {};
    this.keyObservers.length = 0;
    this.removeItemsObserver();
    this.removeItemsObserver = null;
    this.rootKey = undefined;
    super.deinit();
  }

  async initialize() {
    const wrappedRootKey = await this.getWrappedRootKey();
    const accountKeyParams = await this.getAccountKeyParams();
    const hasWrapper = await this.hasRootKeyWrapper();
    const hasRootKey = !Object(utils["p" /* isNullOrUndefined */])(wrappedRootKey) || !Object(utils["p" /* isNullOrUndefined */])(accountKeyParams);

    if (hasWrapper && hasRootKey) {
      this.keyMode = KeyMode.RootKeyPlusWrapper;
    } else if (hasWrapper && !hasRootKey) {
      this.keyMode = KeyMode.WrapperOnly;
    } else if (!hasWrapper && hasRootKey) {
      this.keyMode = KeyMode.RootKeyOnly;
    } else if (!hasWrapper && !hasRootKey) {
      this.keyMode = KeyMode.RootKeyNone;
    } else {
      throw 'Invalid key mode condition';
    }

    if (this.keyMode === KeyMode.RootKeyOnly) {
      this.rootKey = await this.getRootKeyFromKeychain();
      await this.notifyObserversOfKeyChange();
    }
  }
  /**
   * Returns encryption protocol display name
   */


  getDefaultOperatorEncryptionDisplayName() {
    return this.defaultOperator().getEncryptionDisplayName();
  }
  /**
   * Returns the latest protocol version
   */


  getLatestVersion() {
    return versions["a" /* ProtocolVersion */].V004;
  }

  hasAccount() {
    switch (this.keyMode) {
      case KeyMode.RootKeyNone:
      case KeyMode.WrapperOnly:
        return false;

      case KeyMode.RootKeyOnly:
      case KeyMode.RootKeyPlusWrapper:
        return true;

      default:
        throw Error("Unhandled keyMode value '".concat(this.keyMode, "'."));
    }
  }
  /**
   * Returns the protocol version associated with the user's account
   */


  async getUserVersion() {
    const keyParams = await this.getAccountKeyParams();
    return keyParams === null || keyParams === void 0 ? void 0 : keyParams.version;
  }
  /**
   * Returns true if there is an upgrade available for the account or passcode
   */


  async upgradeAvailable() {
    const accountUpgradeAvailable = await this.accountUpgradeAvailable();
    const passcodeUpgradeAvailable = await this.passcodeUpgradeAvailable();
    return accountUpgradeAvailable || passcodeUpgradeAvailable;
  }
  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */


  async accountUpgradeAvailable() {
    const userVersion = await this.getUserVersion();

    if (!userVersion) {
      return false;
    }

    return userVersion !== this.getLatestVersion();
  }
  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */


  async passcodeUpgradeAvailable() {
    const passcodeParams = await this.getRootKeyWrapperKeyParams();

    if (!passcodeParams) {
      return false;
    }

    return passcodeParams.version !== this.getLatestVersion();
  }
  /**
   * Determines whether the current environment is capable of supporting
   * key derivation.
   */


  platformSupportsKeyDerivation(keyParams) {
    /**
     * If the version is 003 or lower, key derivation is supported unless the browser is
     * IE or Edge (or generally, where WebCrypto is not available) or React Native environment is detected.
     *
     * Versions 004 and above are always supported.
     */
    if (Object(versions["b" /* compareVersions */])(keyParams.version, versions["a" /* ProtocolVersion */].V004) >= 0) {
      /* keyParams.version >= 004 */
      return true;
    } else {
      return !!Object(utils["t" /* isWebCryptoAvailable */])() || Object(utils["r" /* isReactNativeEnvironment */])();
    }
  }
  /**
   * @returns The versions that this library supports.
   */


  supportedVersions() {
    return [versions["a" /* ProtocolVersion */].V001, versions["a" /* ProtocolVersion */].V002, versions["a" /* ProtocolVersion */].V003, versions["a" /* ProtocolVersion */].V004];
  }
  /**
   * Determines whether the input version is greater than the latest supported library version.
   */


  isVersionNewerThanLibraryVersion(version) {
    const libraryVersion = this.getLatestVersion();
    return Object(versions["b" /* compareVersions */])(version, libraryVersion) === 1;
  }
  /**
   * Determines whether the input version is expired
   */


  isProtocolVersionOutdated(version) {
    const expirationDates = {
      [versions["a" /* ProtocolVersion */].V001]: Date.parse('2018-01-01'),
      [versions["a" /* ProtocolVersion */].V002]: Date.parse('2020-01-01')
    };
    const date = expirationDates[version];

    if (!date) {
      /* No expiration date, is active version */
      return false;
    }

    const expired = new Date().getTime() > date;
    return expired;
  }
  /**
   * Versions 001 and 002 of the protocol supported dynamic costs, as reported by the server.
   * This function returns the client-enforced minimum cost, to prevent the server from
   * overwhelmingly under-reporting the cost.
   */


  costMinimumForVersion(version) {
    if (Object(versions["b" /* compareVersions */])(version, versions["a" /* ProtocolVersion */].V003) >= 0) {
      throw 'Cost minimums only apply to versions <= 002';
    }

    if (version === versions["a" /* ProtocolVersion */].V001) {
      return V001Algorithm.PbkdfMinCost;
    } else if (version === versions["a" /* ProtocolVersion */].V002) {
      return V002Algorithm.PbkdfMinCost;
    } else {
      throw "Invalid version for cost minimum: ".concat(version);
    }
  }

  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.getLatestVersion());
  }

  createOperatorForVersion(version) {
    if (version === versions["a" /* ProtocolVersion */].V001) {
      return new operator_001_SNProtocolOperator001(this.crypto);
    } else if (version === versions["a" /* ProtocolVersion */].V002) {
      return new operator_002_SNProtocolOperator002(this.crypto);
    } else if (version === versions["a" /* ProtocolVersion */].V003) {
      return new operator_003_SNProtocolOperator003(this.crypto);
    } else if (version === versions["a" /* ProtocolVersion */].V004) {
      return new operator_004_SNProtocolOperator004(this.crypto);
    } else if (version === versions["a" /* ProtocolVersion */].V000Base64Decrypted) {
      return this.createOperatorForLatestVersion();
    } else {
      throw "Unable to find operator for version ".concat(version);
    }
  }

  operatorForVersion(version) {
    const operatorKey = version;
    let operator = this.operators[operatorKey];

    if (!operator) {
      operator = this.createOperatorForVersion(version);
      this.operators[operatorKey] = operator;
    }

    return operator;
  }
  /**
   * Returns the operator corresponding to the latest protocol version
   */


  defaultOperator() {
    return this.operatorForVersion(this.getLatestVersion());
  }
  /**
   * Computes a root key given a password and key params.
   * Delegates computation to respective protocol operator.
   */


  async computeRootKey(password, keyParams) {
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeRootKey(password, keyParams);
  }
  /**
   * Creates a root key using the latest protocol version
  */


  async createRootKey(identifier, password) {
    const operator = this.defaultOperator();
    return operator.createRootKey(identifier, password);
  }
  /**
   * Given a key and intent, returns the proper PayloadFormat,
   * or throws an exception if unsupported configuration of parameters.
   */


  payloadContentFormatForIntent(intent, key) {
    if (!key) {
      /** Decrypted */
      if (intent === intents["a" /* EncryptionIntent */].LocalStorageDecrypted || intent === intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted || intent === intents["a" /* EncryptionIntent */].FileDecrypted || intent === intents["a" /* EncryptionIntent */].FilePreferEncrypted) {
        return formats["a" /* PayloadFormat */].DecryptedBareObject;
      } else if (intent === intents["a" /* EncryptionIntent */].SyncDecrypted) {
        return formats["a" /* PayloadFormat */].DecryptedBase64String;
      } else {
        throw 'Unhandled decrypted case in protocolService.payloadContentFormatForIntent.';
      }
    } else {
      /** Encrypted */
      if (intent === intents["a" /* EncryptionIntent */].Sync || intent === intents["a" /* EncryptionIntent */].FileEncrypted || intent === intents["a" /* EncryptionIntent */].FilePreferEncrypted || intent === intents["a" /* EncryptionIntent */].LocalStorageEncrypted || intent === intents["a" /* EncryptionIntent */].LocalStoragePreferEncrypted) {
        return formats["a" /* PayloadFormat */].EncryptedString;
      } else {
        throw 'Unhandled encrypted case in protocolService.payloadContentFormatForIntent.';
      }
    }
  }
  /**
   * Generates parameters for a payload that are typically encrypted, and used for syncing
   * or saving locally. Parameters are non-typed objects that can later by converted to objects.
   * If the input payload is not properly decrypted in the first place, it will be returned
   * as-is. If the payload is deleted, it will be returned as-is (assuming that the content field is null)
   * @param payload - The payload to encrypt
   * @param key The key to use to encrypt the payload.
   *   Will be looked up if not supplied.
   * @param intent - The target of the encryption
   * @returns The encrypted payload
   */


  async payloadByEncryptingPayload(payload, intent, key) {
    if (payload.errorDecrypting) {
      return payload;
    }

    if (payload.deleted) {
      return payload;
    }

    if (Object(utils["p" /* isNullOrUndefined */])(intent)) {
      throw 'Attempting to encrypt payload with null intent';
    }

    if (!key && !Object(intents["c" /* isDecryptedIntent */])(intent)) {
      key = await this.keyToUseForEncryptionOfPayload(payload, intent);
    }

    if (!key && Object(intents["b" /* intentRequiresEncryption */])(intent)) {
      throw Error('Attempting to generate encrypted payload with no key.');
    }

    if (payload.format !== formats["a" /* PayloadFormat */].DecryptedBareObject) {
      throw 'Attempting to encrypt already encrypted payload.';
    }

    if (!payload.content) {
      throw 'Attempting to encrypt payload with no content.';
    }

    if (!payload.uuid) {
      throw 'Attempting to encrypt payload with no uuid.';
    }

    const version = key ? key.version : this.getLatestVersion();
    const format = this.payloadContentFormatForIntent(intent, key);
    const operator = this.operatorForVersion(version);
    const encryptionParameters = await operator.generateEncryptedParameters(payload, format, key);

    if (!encryptionParameters) {
      throw 'Unable to generate encryption parameters';
    }

    const result = Object(generator["d" /* CreateIntentPayloadFromObject */])(payload, intent, encryptionParameters);
    return result;
  }
  /**
   * Similar to `payloadByEncryptingPayload`, but operates on an array of payloads.
   * `intent` can also be a function of the current iteration payload.
   */


  async payloadsByEncryptingPayloads(payloads, intent) {
    const results = [];

    for (const payload of payloads) {
      const useIntent = Object(utils["o" /* isFunction */])(intent) ? intent(payload) : intent;
      const encryptedPayload = await this.payloadByEncryptingPayload(payload, useIntent);
      results.push(encryptedPayload);
    }

    return results;
  }
  /**
   * Generates a new payload by decrypting the input payload.
   * If the input payload is already decrypted, it will be returned as-is.
   * @param payload - The payload to decrypt.
   * @param key The key to use to decrypt the payload.
   * If none is supplied, it will be automatically looked up.
   */


  async payloadByDecryptingPayload(payload, key) {
    if (!payload.content) {
      throw Error('Attempting to decrypt payload that has no content.');
    }

    const format = payload.format;

    if (format === formats["a" /* PayloadFormat */].DecryptedBareObject) {
      return payload;
    }

    if (!key && format === formats["a" /* PayloadFormat */].EncryptedString) {
      key = await this.keyToUseForDecryptionOfPayload(payload);

      if (!key) {
        return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(payload, {
          waitingForKey: true,
          errorDecrypting: true
        });
      }
    }

    const version = payload.version;
    const source = payload.source;
    const operator = this.operatorForVersion(version);
    const encryptionParameters = Object(generator["c" /* CreateEncryptionParameters */])(payload, source);

    try {
      const decryptedParameters = await operator.generateDecryptedParameters(encryptionParameters, key);
      return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(payload, decryptedParameters, source);
    } catch (e) {
      console.error('Error decrypting payload', payload, e);
      return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(payload, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !payload.errorDecrypting
      });
    }
  }
  /**
   * Similar to `payloadByDecryptingPayload`, but operates on an array of payloads.
   */


  async payloadsByDecryptingPayloads(payloads, key) {
    const decryptItem = async encryptedPayload => {
      if (!encryptedPayload) {
        /** Keep in-counts similar to out-counts */
        return encryptedPayload;
      }
      /**
       * We still want to decrypt deleted payloads if they have content in case
       * they were marked as dirty but not yet synced.
       */


      if (encryptedPayload.deleted === true && Object(utils["p" /* isNullOrUndefined */])(encryptedPayload.content)) {
        return encryptedPayload;
      }

      const isDecryptable = Object(utils["s" /* isString */])(encryptedPayload.content);

      if (!isDecryptable) {
        return encryptedPayload;
      }

      return this.payloadByDecryptingPayload(encryptedPayload, key);
    };

    return Promise.all(payloads.map(payload => decryptItem(payload)));
  }
  /**
   * If an item was attempting to decrypt, but failed, either because the keys
   * for that item had not downloaded yet, or any other reason, it will be deferred
   * item.errorDecrypting = true and possibly item.waitingForKey = true.
   * Here we find such items, and attempt to decrypt them again.
   */


  async decryptErroredItems() {
    const items = this.itemManager.invalidItems;

    if (items.length === 0) {
      return;
    }

    const payloads = items.map(item => {
      return item.payloadRepresentation();
    });
    const decrypted = await this.payloadsByDecryptingPayloads(payloads);
    await this.modelManager.emitPayloads(decrypted, sources["a" /* PayloadSource */].LocalChanged);
  }
  /**
   * Decrypts a backup file using user-inputted password
   * @param password - The raw user password associated with this backup file
   */


  async payloadsByDecryptingBackupFile(data, password) {
    const keyParamsData = data.keyParams || data.auth_params;
    const rawItems = data.items;
    const encryptedPayloads = rawItems.map(rawItem => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawItem, sources["a" /* PayloadSource */].FileImport);
    });
    let decryptedPayloads = [];

    if (keyParamsData) {
      const keyParams = this.createKeyParams(keyParamsData);
      const key = await this.computeRootKey(password, keyParams);
      const itemsKeysPayloads = encryptedPayloads.filter(payload => {
        return payload.content_type === content_types["a" /* ContentType */].ItemsKey;
      });
      /**
       * First decrypt items keys, in case we need to reference these keys for the
       * decryption of other items below
       */

      const decryptedItemsKeysPayloads = await this.payloadsByDecryptingPayloads(itemsKeysPayloads, key);
      Object(utils["j" /* extendArray */])(decryptedPayloads, decryptedItemsKeysPayloads);

      for (const encryptedPayload of encryptedPayloads) {
        if (encryptedPayload.content_type === content_types["a" /* ContentType */].ItemsKey) {
          continue;
        }

        try {
          let itemsKey = await this.keyToUseForDecryptionOfPayload(encryptedPayload);

          if (!itemsKey) {
            const candidate = decryptedItemsKeysPayloads.find(itemsKeyPayload => {
              return encryptedPayload.items_key_id === itemsKeyPayload.uuid;
            });
            const payloadVersion = encryptedPayload.version;

            if (candidate) {
              itemsKey = CreateItemFromPayload(candidate);
            }
            /**
             * Payloads with versions <= 003 use root key directly for encryption.
             */
            else if (Object(versions["b" /* compareVersions */])(payloadVersion, versions["a" /* ProtocolVersion */].V003) <= 0) {
                itemsKey = key;
              }
          }

          const decryptedPayload = await this.payloadByDecryptingPayload(encryptedPayload, itemsKey);
          decryptedPayloads.push(decryptedPayload);
        } catch (e) {
          decryptedPayloads.push(Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(encryptedPayload, {
            errorDecrypting: true,
            errorDecryptingValueChanged: !encryptedPayload.errorDecrypting
          }));
          console.error('Error decrypting payload', encryptedPayload, e);
        }
      }
    } else {
      decryptedPayloads = encryptedPayloads;
    }

    return decryptedPayloads;
  }
  /**
   * Creates a key params object from a raw object
   * @param keyParams - The raw key params object to create a KeyParams object from
   */


  createKeyParams(keyParams) {
    /* 002 doesn't have version automatically, newer versions do. */
    if (!keyParams.version) {
      keyParams.version = versions["a" /* ProtocolVersion */].V002;
    }

    return CreateKeyParams(keyParams);
  }
  /**
   * Creates a JSON string representing the backup format of all items, or just subitems
   * if supplied.
   * @param subItems An optional array of items to create backup of.
   * If not supplied, all items are backed up.
   * @param returnIfEmpty Returns null if there are no items to make backup of.
   * @returns JSON stringified representation of data, including keyParams.
   */


  async createBackupFile(subItems) {
    let intent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : intents["a" /* EncryptionIntent */].FilePreferEncrypted;
    let returnIfEmpty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const items = subItems || this.itemManager.items;

    if (returnIfEmpty && items.length === 0) {
      return undefined;
    }

    const encryptedPayloads = [];

    for (const item of items) {
      if (item.errorDecrypting) {
        /** Keep payload as-is */
        encryptedPayloads.push(item.payload);
      } else {
        const payload = Object(generator["f" /* CreateSourcedPayloadFromObject */])(item.payload, sources["a" /* PayloadSource */].FileImport);
        const encrypted = await this.payloadByEncryptingPayload(payload, intent);
        encryptedPayloads.push(encrypted);
      }
    }

    const data = {
      version: this.getLatestVersion(),
      items: encryptedPayloads.map(p => p.ejected())
    };
    const keyParams = await this.getRootKeyParams();

    if (keyParams && intent !== intents["a" /* EncryptionIntent */].FileDecrypted) {
      data.keyParams = keyParams.getPortableValue();
    }

    const prettyPrint = 2;
    return JSON.stringify(data, null, prettyPrint);
  }
  /**
   * Register a callback to be notified when root key status changes.
   * @param callback  A function that takes in a content type to call back when root
   *                  key or wrapper status has changed.
   */


  onKeyStatusChange(callback) {
    this.keyObservers.push(callback);
    return () => {
      Object(utils["B" /* removeFromArray */])(this.keyObservers, callback);
    };
  }

  async notifyObserversOfKeyChange() {
    for (const observer of this.keyObservers) {
      await observer();
    }
  }

  async getRootKeyFromKeychain() {
    const rawKey = await this.deviceInterface.getNamespacedKeychainValue(this.identifier);

    if (Object(utils["p" /* isNullOrUndefined */])(rawKey)) {
      return undefined;
    }

    const rootKey = await root_key_SNRootKey.Create(rawKey);
    return rootKey;
  }

  async saveRootKeyToKeychain() {
    if (Object(utils["p" /* isNullOrUndefined */])(this.rootKey)) {
      throw 'Attempting to non-existent root key to the keychain.';
    }

    if (this.keyMode !== KeyMode.RootKeyOnly) {
      throw 'Should not be persisting wrapped key to keychain.';
    }

    const rawKey = this.rootKey.getPersistableValue();
    return this.executeCriticalFunction(() => {
      return this.deviceInterface.setNamespacedKeychainValue(rawKey, this.identifier);
    });
  }
  /**
   * @returns True if a root key wrapper (passcode) is configured.
   */


  async hasRootKeyWrapper() {
    const wrapper = await this.getRootKeyWrapperKeyParams();
    return !Object(utils["p" /* isNullOrUndefined */])(wrapper);
  }
  /**
   * A non-async alternative to `hasRootKeyWrapper` which uses pre-loaded state
   * to determine if a passcode is configured.
   */


  hasPasscode() {
    return this.keyMode === KeyMode.WrapperOnly || this.keyMode === KeyMode.RootKeyPlusWrapper;
  }
  /**
   * @returns True if the root key has not yet been unwrapped (passcode locked).
   */


  async rootKeyNeedsUnwrapping() {
    return (await this.hasRootKeyWrapper()) && Object(utils["p" /* isNullOrUndefined */])(this.rootKey);
  }
  /**
   * @returns Key params object containing root key wrapper key params
   */


  async getRootKeyWrapperKeyParams() {
    const rawKeyParams = await this.storageService.getValue(StorageKey.RootKeyWrapperKeyParams, StorageValueModes.Nonwrapped);

    if (!rawKeyParams) {
      return undefined;
    }

    return this.createKeyParams(rawKeyParams);
  }
  /**
   * @returns Object containing persisted wrapped (encrypted) root key
   */


  async getWrappedRootKey() {
    return this.storageService.getValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped);
  }
  /**
   * Returns rootKeyParams by reading from storage.
   */


  async getRootKeyParams() {
    if (this.keyMode === KeyMode.WrapperOnly) {
      return this.getRootKeyWrapperKeyParams();
    } else if (this.keyMode === KeyMode.RootKeyOnly || this.keyMode === KeyMode.RootKeyPlusWrapper) {
      return this.getAccountKeyParams();
    } else if (this.keyMode === KeyMode.RootKeyNone) {
      return undefined;
    } else {
      throw "Unhandled key mode for getRootKeyParams ".concat(this.keyMode);
    }
  }
  /**
   * @returns getRootKeyParams may return different params based on different
   *           keyMode. This function however strictly returns only account params.
   */


  async getAccountKeyParams() {
    const rawKeyParams = await this.storageService.getValue(StorageKey.RootKeyParams, StorageValueModes.Nonwrapped);

    if (!rawKeyParams) {
      return undefined;
    }

    return this.createKeyParams(rawKeyParams);
  }
  /**
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   */


  async validateWrappingKey(wrappingKey) {
    const wrappedRootKey = await this.getWrappedRootKey();
    /** If wrapper only, storage is encrypted directly with wrappingKey */

    if (this.keyMode === KeyMode.WrapperOnly) {
      return this.storageService.canDecryptWithKey(wrappingKey);
    } else if (this.keyMode === KeyMode.RootKeyOnly || this.keyMode === KeyMode.RootKeyPlusWrapper) {
      /**
      * In these modes, storage is encrypted with account keys, and
      * account keys are encrypted with wrappingKey. Here we validate
      * by attempting to decrypt account keys.
      */
      const wrappedKeyPayload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(wrappedRootKey);
      const decrypted = await this.payloadByDecryptingPayload(wrappedKeyPayload, wrappingKey);
      return !decrypted.errorDecrypting;
    } else {
      throw 'Unhandled case in validateWrappingKey';
    }
  }
  /**
   * Computes the root key wrapping key given a passcode.
   * Wrapping key params are read from disk.
   */


  async computeWrappingKey(passcode) {
    const keyParams = await this.getRootKeyWrapperKeyParams();
    const key = await this.computeRootKey(passcode, keyParams);
    return key;
  }
  /**
   * Unwraps the persisted root key value using the supplied wrappingKey.
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
   */


  async unwrapRootKey(wrappingKey) {
    if (this.keyMode === KeyMode.WrapperOnly) {
      this.rootKey = wrappingKey;
      return;
    }

    if (this.keyMode !== KeyMode.RootKeyPlusWrapper) {
      throw 'Invalid key mode condition for unwrapping.';
    }

    const wrappedKey = await this.getWrappedRootKey();
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(wrappedKey);
    const decrypted = await this.payloadByDecryptingPayload(payload, wrappingKey);

    if (decrypted.errorDecrypting) {
      throw Error('Unable to decrypt root key with provided wrapping key.');
    } else {
      this.rootKey = await root_key_SNRootKey.Create(decrypted.contentObject, decrypted.uuid);
      await this.notifyObserversOfKeyChange();
    }
  }
  /**
   * Encrypts rootKey and saves it in storage instead of keychain, and then
   * clears keychain. This is because we don't want to store large encrypted
   * payloads in the keychain. If the root key is not wrapped, it is stored
   * in plain form in the user's secure keychain.
  */


  async setNewRootKeyWrapper(wrappingKey, keyParams) {
    if (this.keyMode === KeyMode.RootKeyNone) {
      this.keyMode = KeyMode.WrapperOnly;
    } else if (this.keyMode === KeyMode.RootKeyOnly) {
      this.keyMode = KeyMode.RootKeyPlusWrapper;
    } else {
      throw Error('Attempting to set wrapper on already wrapped key.');
    }

    await this.deviceInterface.clearNamespacedKeychainValue(this.identifier);

    if (this.keyMode === KeyMode.WrapperOnly || this.keyMode === KeyMode.RootKeyPlusWrapper) {
      if (this.keyMode === KeyMode.WrapperOnly) {
        this.rootKey = wrappingKey;
        await this.reencryptItemsKeys();
      } else {
        await this.wrapAndPersistRootKey(wrappingKey);
      }

      await this.storageService.setValue(StorageKey.RootKeyWrapperKeyParams, keyParams.getPortableValue(), StorageValueModes.Nonwrapped);
      await this.notifyObserversOfKeyChange();
    } else {
      throw Error('Invalid keyMode on setNewRootKeyWrapper');
    }
  }
  /**
   * Wraps the current in-memory root key value using the wrappingKey,
   * then persists the wrapped value to disk.
   */


  async wrapAndPersistRootKey(wrappingKey) {
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(this.rootKey, {
      content: this.rootKey.getPersistableValue()
    });
    const wrappedKey = await this.payloadByEncryptingPayload(payload, intents["a" /* EncryptionIntent */].LocalStorageEncrypted, wrappingKey);
    await this.storageService.setValue(StorageKey.WrappedRootKey, wrappedKey.ejected(), StorageValueModes.Nonwrapped);
  }
  /**
   * Removes root key wrapper from local storage and stores root key bare in secure keychain.
   */


  async removeRootKeyWrapper() {
    if (this.keyMode !== KeyMode.WrapperOnly && this.keyMode !== KeyMode.RootKeyPlusWrapper) {
      throw Error('Attempting to remove root key wrapper on unwrapped key.');
    }

    if (this.keyMode === KeyMode.WrapperOnly) {
      this.keyMode = KeyMode.RootKeyNone;
      this.rootKey = undefined;
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      this.keyMode = KeyMode.RootKeyOnly;
    }

    await this.storageService.removeValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped);
    await this.storageService.removeValue(StorageKey.RootKeyWrapperKeyParams, StorageValueModes.Nonwrapped);

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain();
    }

    await this.notifyObserversOfKeyChange();
  }
  /**
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. Applications set root key on sign in, register, or password change.
   * @param key A SNRootKey object.
   * @param wrappingKey If a passcode is configured, the wrapping key
   * must be supplied, so that the new root key can be wrapped with the wrapping key.
   */


  async setNewRootKey(key, keyParams, wrappingKey) {
    if (!keyParams) {
      throw Error('keyParams must be supplied if setting root key.');
    }

    if (this.rootKey === key) {
      throw Error('Attempting to set root key as same current value.');
    }

    if (this.keyMode === KeyMode.WrapperOnly) {
      this.keyMode = KeyMode.RootKeyPlusWrapper;
    } else if (this.keyMode === KeyMode.RootKeyNone) {
      this.keyMode = KeyMode.RootKeyOnly;
    } else if (this.keyMode === KeyMode.RootKeyOnly || this.keyMode === KeyMode.RootKeyPlusWrapper) {
      /** Root key is simply changing, mode stays the same */

      /** this.keyMode = this.keyMode; */
    } else {
      throw Error("Unhandled key mode for setNewRootKey ".concat(this.keyMode));
    }

    this.rootKey = key;
    await this.storageService.setValue(StorageKey.RootKeyParams, keyParams.getPortableValue(), StorageValueModes.Nonwrapped);

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain();
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      if (!wrappingKey) {
        throw Error('wrappingKey must be supplied');
      }

      await this.wrapAndPersistRootKey(wrappingKey);
    }

    await this.notifyObserversOfKeyChange();
    await this.reencryptItemsKeys();
  }
  /**
   * Returns the in-memory root key value.
   */


  async getRootKey() {
    return this.rootKey;
  }
  /**
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */


  async clearLocalKeyState() {
    await this.deviceInterface.clearNamespacedKeychainValue(this.identifier);
    await this.storageService.removeValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped);
    await this.storageService.removeValue(StorageKey.RootKeyWrapperKeyParams, StorageValueModes.Nonwrapped);
    await this.storageService.removeValue(StorageKey.RootKeyParams, StorageValueModes.Nonwrapped);
    this.keyMode = KeyMode.RootKeyNone;
    this.rootKey = undefined;
    await this.notifyObserversOfKeyChange();
  }
  /**
   * @param password  The password string to generate a root key from.
   */


  async validateAccountPassword(password) {
    const keyParams = await this.getRootKeyParams();
    const key = await this.computeRootKey(password, keyParams);
    const valid = key.compare(this.rootKey);

    if (valid) {
      return {
        valid,
        artifacts: {
          rootKey: key
        }
      };
    } else {
      return {
        valid: false
      };
    }
  }
  /**
   * @param passcode  The passcode string to generate a root key from.
   */


  async validatePasscode(passcode) {
    const keyParams = await this.getRootKeyWrapperKeyParams();
    const key = await this.computeRootKey(passcode, keyParams);
    const valid = await this.validateWrappingKey(key);

    if (valid) {
      return {
        valid,
        artifacts: {
          wrappingKey: key
        }
      };
    } else {
      return {
        valid: false
      };
    }
  }
  /**
   * Only two types of items should be encrypted with a root key:
   * - An SNItemsKey object
   * - An encrypted storage object (local)
   */


  contentTypeUsesRootKeyEncryption(contentType) {
    return contentType === content_types["a" /* ContentType */].ItemsKey || contentType === content_types["a" /* ContentType */].EncryptedStorage;
  }
  /**
   * Determines which key to use for encryption of the payload
   * The key object to use for encrypting the payload.
  */


  async keyToUseForEncryptionOfPayload(payload, intent) {
    if (Object(utils["p" /* isNullOrUndefined */])(intent)) {
      throw 'Intent must be supplied when looking up key for encryption of item.';
    }

    if (this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      const rootKey = await this.getRootKey();

      if (!rootKey) {
        if (Object(intents["b" /* intentRequiresEncryption */])(intent)) {
          throw 'Root key encryption is required but no root key is available.';
        } else {
          return undefined;
        }
      }

      return rootKey;
    } else {
      const defaultKey = this.getDefaultItemsKey();
      const userVersion = await this.getUserVersion();

      if (userVersion && userVersion !== (defaultKey === null || defaultKey === void 0 ? void 0 : defaultKey.version)) {
        /**
         * The default key appears to be either newer or older than the user's account version
         * We could throw an exception here, but will instead fall back to a corrective action:
         * return any items key that corresponds to the user's version
         */
        console.warn("The user's default items key version is not equal to the account version.");
        const itemsKeys = this.latestItemsKeys();
        return itemsKeys.find(key => key.version === userVersion);
      } else {
        return defaultKey;
      }
    }
  }
  /**
   * Payloads could have been previously encrypted with any arbitrary SNItemsKey object.
   * If the payload is an items key object, it is always encrypted with the root key,
   * and so return that. Otherwise, we check to see if the payload has an
   * items_key_id and return that key. If it doesn't, this means the payload was
   * encrypted with legacy behavior. We return then the key object corresponding
   * to the version of this payload.
   * @returns The key object to use for decrypting this payload.
  */


  async keyToUseForDecryptionOfPayload(payload) {
    if (this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      return this.getRootKey();
    }

    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyForPayload(payload);
      return itemsKey;
    }

    const payloadVersion = payload.version;

    if (payloadVersion === this.getLatestVersion()) {
      throw Error('No associated key found for item encrypted with latest protocol version.');
    }

    return this.defaultItemsKeyForItemVersion(payloadVersion);
  }

  async onSyncEvent(eventName) {
    if (eventName === events["b" /* SyncEvent */].FullSyncCompleted) {
      await this.handleFullSyncCompletion();
    }

    if (eventName === events["b" /* SyncEvent */].DownloadFirstSyncCompleted) {
      await this.handleDownloadFirstSyncCompletion();
    }
  }
  /**
   * When a download-first sync completes, it means we've completed a (potentially multipage)
   * sync where we only downloaded what the server had before uploading anything. We will be
   * allowed to make local accomadations here before the server begins with the upload
   * part of the sync (automatically runs after download-first sync completes).
   * We use this to see if the server has any default itemsKeys, and if so, allows us to
   * delete any never-synced items keys we have here locally.
   */


  async handleDownloadFirstSyncCompletion() {
    /**
    * Find items keys with null or epoch updated_at value, indicating
    * that they haven't been synced yet.
    */
    const itemsKeys = this.latestItemsKeys();
    const neverSyncedKeys = itemsKeys.filter(key => {
      return key.neverSynced;
    });
    /**
    * Find isDefault items key that have been previously synced.
    * If we find one, this means we can delete any non-synced keys.
    */

    const defaultSyncedKey = itemsKeys.find(key => {
      return !key.neverSynced && key.isDefault;
    });
    const hasSyncedItemsKey = !Object(utils["p" /* isNullOrUndefined */])(defaultSyncedKey);

    if (hasSyncedItemsKey) {
      /** Delete all never synced keys */
      await this.itemManager.setItemsToBeDeleted(Object(functions["b" /* Uuids */])(neverSyncedKeys));
    } else {
      /**
       * No previous synced items key.
       * We can keep the one(s) we have, only if their version is equal to our root key version.
       * If their version is not equal to our root key version, delete them. If we end up with 0
       * items keys, create a new one.  */
      const rootKey = await this.getRootKey();

      if (rootKey) {
        /** If neverSynced.version != rootKey.version, delete. */
        const toDelete = neverSyncedKeys.filter(itemsKey => {
          return itemsKey.version !== rootKey.version;
        });

        if (toDelete.length > 0) {
          await this.itemManager.setItemsToBeDeleted(Object(functions["b" /* Uuids */])(toDelete));
        }

        if (this.latestItemsKeys().length === 0) {
          await this.createNewDefaultItemsKey();
        }
      }
    }
  }

  async handleFullSyncCompletion() {
    /** Always create a new items key after full sync, if no items key is found */
    const currentItemsKey = this.getDefaultItemsKey();

    if (!currentItemsKey) {
      await this.createNewDefaultItemsKey();

      if (this.keyMode === KeyMode.WrapperOnly) {
        return this.repersistAllItems();
      }
    }
  }
  /**
   * If encryption status changes (esp. on mobile, where local storage encryption
   * can be disabled), consumers may call this function to repersist all items to
   * disk using latest encryption status.
   * @access public
   */


  async repersistAllItems() {
    const items = this.itemManager.items;
    const payloads = items.map(item => Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(item));
    return this.storageService.savePayloads(payloads);
  }
  /**
   * @returns All SN|ItemsKey objects synced to the account.
   */


  latestItemsKeys() {
    return this.itemManager.itemsKeys();
  }
  /**
   * @returns The items key used to encrypt the payload
   */


  itemsKeyForPayload(payload) {
    return this.latestItemsKeys().find(key => key.uuid === payload.items_key_id);
  }
  /**
   * @returns The SNItemsKey object to use to encrypt new or updated items.
   */


  getDefaultItemsKey() {
    const itemsKeys = this.latestItemsKeys();

    if (itemsKeys.length === 1) {
      return itemsKeys[0];
    }

    return itemsKeys.find(key => {
      return key.isDefault;
    });
  }
  /**
   * When the root key changes (non-null only), we must re-encrypt all items
   * keys with this new root key (by simply re-syncing).
   */


  async reencryptItemsKeys() {
    const itemsKeys = this.latestItemsKeys();

    if (itemsKeys.length > 0) {
      /**
       * Do not call sync after marking dirty.
       * Re-encrypting items keys is called by consumers who have specific flows who
       * will sync on their own timing
        */
      await this.itemManager.setItemsDirty(Object(functions["b" /* Uuids */])(itemsKeys));
    }
  }
  /**
   * When migrating from non-SNItemsKey architecture, many items will not have a
   * relationship with any key object. For those items, we can be sure that only 1 key
   * object will correspond to that protocol version.
   * @returns The SNItemsKey object to decrypt items encrypted
   * with previous protocol version.
   */


  async defaultItemsKeyForItemVersion(version) {
    return this.latestItemsKeys().find(key => {
      return key.version === version;
    });
  }
  /**
   * Creates a new random SNItemsKey to use for item encryption, and adds it to model management.
   * Consumer must call sync. If the protocol version <= 003, only one items key should be created,
   * and its .itemsKey value should be equal to the root key masterKey value.
   */


  async createNewDefaultItemsKey() {
    const rootKey = await this.getRootKey();
    const operatorVersion = rootKey ? rootKey.version : this.getLatestVersion();
    let itemTemplate;

    if (Object(versions["b" /* compareVersions */])(operatorVersion, LAST_NONROOT_ITEMS_KEY_VERSION) <= 0) {
      /** Create root key based items key */
      const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
        uuid: await uuid_Uuid.GenerateUuid(),
        content_type: content_types["a" /* ContentType */].ItemsKey,
        content: Object(functions["a" /* FillItemContent */])({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: operatorVersion
        })
      });
      itemTemplate = CreateItemFromPayload(payload);
    } else {
      /** Create independent items key */
      itemTemplate = await this.operatorForVersion(operatorVersion).createItemsKey();
    }

    const currentDefault = this.getDefaultItemsKey();

    if (currentDefault) {
      await this.itemManager.changeItemsKey(currentDefault.uuid, mutator => {
        mutator.isDefault = false;
      });
    }

    const itemsKey = await this.itemManager.insertItem(itemTemplate);
    await this.itemManager.changeItemsKey(itemsKey.uuid, mutator => {
      mutator.isDefault = true;
    });
    return itemsKey;
  }

  async changePassword(email, currentPassword, newPassword, wrappingKey) {
    const [currentRootKey, currentKeyParams] = await Promise.all([this.getRootKey(), this.getRootKeyParams()]);
    const currentDefaultItemsKey = this.getDefaultItemsKey();
    const computedRootKey = await this.computeRootKey(currentPassword, currentKeyParams);

    if (!currentRootKey.compare(computedRootKey)) {
      /** Passwords do not match. */
      return [Error(INVALID_PASSWORD)];
    }

    const {
      key: newRootKey,
      keyParams: newKeyParams
    } = await this.createRootKey(email, newPassword);
    await this.setNewRootKey(newRootKey, newKeyParams, wrappingKey);
    const newDefaultItemsKey = await this.createNewDefaultItemsKey();
    return [null, {
      currentServerPassword: computedRootKey.serverPassword,
      newRootKey,
      newKeyParams,
      rollback: async () => {
        await this.setNewRootKey(currentRootKey, currentKeyParams, wrappingKey);
        await Promise.all([this.itemManager.setItemToBeDeleted(newDefaultItemsKey.uuid), this.itemManager.changeItem(currentDefaultItemsKey.uuid, mutator => {
          mutator.isDefault = true;
        })]);
      }
    }];
  }

}
// CONCATENATED MODULE: ./lib/services/history/entries/item_history_entry.ts



class item_history_entry_ItemHistoryEntry {
  constructor(payload) {
    /**
     * Whatever values `item` has will be persisted,
     * so be sure that the values are picked beforehand.
     */

    /**
     * We'll assume a `text` content value to diff on.
     * If it doesn't exist, no problem.
     */
    this.defaultContentKeyToDiffOn = 'text';
    this.textCharDiffLength = 0;
    this.hasPreviousEntry = false;
    let updated_at = payload.updated_at;

    if (Object(utils["s" /* isString */])(updated_at)) {
      updated_at = new Date(updated_at);
    }

    if (updated_at.getTime() === 0) {
      updated_at = new Date();
    }

    this.payload = Object(generator["b" /* CopyPayload */])(payload, {
      updated_at: updated_at
    });
  }

  setPreviousEntry(previousEntry) {
    this.hasPreviousEntry = previousEntry != null;
    /** We'll try to compute the delta based on an assumed
     * content property of `text`, if it exists.
     */

    if (this.payload.safeContent[this.defaultContentKeyToDiffOn]) {
      if (previousEntry) {
        this.textCharDiffLength = this.payload.contentObject[this.defaultContentKeyToDiffOn].length - previousEntry.payload.contentObject[this.defaultContentKeyToDiffOn].length;
      } else {
        this.textCharDiffLength = this.payload.contentObject[this.defaultContentKeyToDiffOn].length;
      }
    }
  }

  operationVector() {
    /**
     * We'll try to use the value of `textCharDiffLength`
     * to help determine this, if it's set
     */
    if (this.textCharDiffLength !== undefined) {
      if (!this.hasPreviousEntry || this.textCharDiffLength === 0) {
        return 0;
      } else if (this.textCharDiffLength < 0) {
        return -1;
      } else {
        return 1;
      }
    }
    /** Otherwise use a default value of 1 */


    return 1;
  }

  deltaSize() {
    /**
     * Up to the subclass to determine how large the delta was,
     * i.e number of characters changed.
     * But this general class won't be able to determine which property it
     * should diff on, or even its format.
     */

    /**
     * We can return the `textCharDiffLength` if it's set,
     * otherwise, just return 1;
     */
    if (this.textCharDiffLength !== undefined) {
      return Math.abs(this.textCharDiffLength);
    }
    /**
     * Otherwise return 1 here to constitute a basic positive delta.
     * The value returned should always be positive. Override `operationVector`
     * to return the direction of the delta.
     */


    return 1;
  }

  isSameAsEntry(entry) {
    if (!entry) {
      return false;
    }

    const lhs = CreateItemFromPayload(this.payload);
    const rhs = CreateItemFromPayload(entry.payload);
    return lhs.isItemContentEqualWith(rhs);
  }

}
// CONCATENATED MODULE: ./lib/services/history/entries/note_history_entry.ts

class note_history_entry_NoteHistoryEntry extends item_history_entry_ItemHistoryEntry {
  previewTitle() {
    return this.payload.updated_at.toLocaleString();
  }

  previewSubTitle() {
    if (!this.hasPreviousEntry) {
      return "".concat(this.textCharDiffLength, " characters loaded");
    } else if (this.textCharDiffLength < 0) {
      return "".concat(this.textCharDiffLength * -1, " characters removed");
    } else if (this.textCharDiffLength > 0) {
      return "".concat(this.textCharDiffLength, " characters added");
    } else {
      return 'Title or metadata changed';
    }
  }

}
// CONCATENATED MODULE: ./lib/services/history/functions.ts



function CreateHistoryEntryForPayload(payload) {
  const mapping = {
    [content_types["a" /* ContentType */].Note]: note_history_entry_NoteHistoryEntry
  };
  const type = payload[fields["a" /* PayloadField */].ContentType];
  const historyItemClass = mapping[type];

  if (!historyItemClass) {
    throw 'Invalid item history class';
  } // eslint-disable-next-line new-cap


  const entry = new historyItemClass(payload);
  return entry;
}
// CONCATENATED MODULE: ./lib/services/history/session/item_session_history.ts

/**
 * The amount of characters added or removed that
 * constitute a keepable entry after optimization.
 */

const LARGE_ENTRY_DELTA_THRESHOLD = 15;
class item_session_history_ItemSessionHistory {
  constructor(entries) {
    this.entries = [];
    /** Deserialize the entries into entry objects. */

    if (entries) {
      for (const entry of entries) {
        entry.setPreviousEntry(this.getMostRecentEntry());
        this.entries.unshift(entry);
      }
    }
  }

  static FromJson(entryJson) {
    const entries = entryJson.entries.map(rawHistoryEntry => {
      return CreateHistoryEntryForPayload(rawHistoryEntry.payload);
    });
    return new item_session_history_ItemSessionHistory(entries);
  }

  getMostRecentEntry() {
    /** First element in the array should be the last entry. */
    return this.entries[0];
  }

  addHistoryEntryForItem(payload) {
    const prospectiveEntry = CreateHistoryEntryForPayload(payload);
    const previousEntry = this.getMostRecentEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);

    if (prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }

    this.entries.unshift(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    const keepEntries = [];

    const isEntrySignificant = entry => {
      return entry.deltaSize() > LARGE_ENTRY_DELTA_THRESHOLD;
    };

    const processEntry = (entry, index, keep) => {
      /**
       * Entries may be processed retrospectively, meaning it can be
       * decided to be deleted, then an upcoming processing can change that.
       */
      if (keep) {
        keepEntries.unshift(entry);
      } else {
        /** Remove if in keep */
        const index = keepEntries.indexOf(entry);

        if (index !== -1) {
          keepEntries.splice(index, 1);
        }
      }

      if (keep && isEntrySignificant(entry) && entry.operationVector() === -1) {
        /** This is a large negative change. Hang on to the previous entry. */
        const previousEntry = this.entries[index + 1];

        if (previousEntry) {
          keepEntries.unshift(previousEntry);
        }
      }
    };

    for (let index = this.entries.length; index--;) {
      const entry = this.entries[index];

      if (index === 0 || index === this.entries.length - 1) {
        /** Keep the first and last */
        processEntry(entry, index, true);
      } else {
        const significant = isEntrySignificant(entry);
        processEntry(entry, index, significant);
      }
    }

    this.entries = this.entries.filter((entry, index) => {
      return keepEntries.indexOf(entry) !== -1;
    });
  }

}
// CONCATENATED MODULE: ./lib/services/history/session/session_history_map.ts

/** The amount of revisions which above, call for an optimization. */

const DEFAULT_ITEM_REVISIONS_THRESHOLD = 60;
class session_history_map_SessionHistoryMap {
  constructor(content) {
    this.itemRevisionThreshold = DEFAULT_ITEM_REVISIONS_THRESHOLD;
    this.content = content;

    if (!this.content) {
      this.content = {
        itemUUIDToItemHistoryMapping: {}
      };
    }
  }

  static FromJson(sessionHistoryJson) {
    if (sessionHistoryJson) {
      const content = sessionHistoryJson.content;
      const uuids = Object.keys(content.itemUUIDToItemHistoryMapping);
      uuids.forEach(itemUUID => {
        const rawItemHistory = content.itemUUIDToItemHistoryMapping[itemUUID];
        content.itemUUIDToItemHistoryMapping[itemUUID] = item_session_history_ItemSessionHistory.FromJson(rawItemHistory);
      });
      return new session_history_map_SessionHistoryMap(content);
    } else {
      return new session_history_map_SessionHistoryMap();
    }
  }

  addEntryForPayload(payload) {
    const itemHistory = this.historyForItem(payload.uuid);
    return itemHistory.addHistoryEntryForItem(payload);
  }

  historyForItem(uuid) {
    let history = this.content.itemUUIDToItemHistoryMapping[uuid];

    if (!history) {
      history = new item_session_history_ItemSessionHistory();
      this.content.itemUUIDToItemHistoryMapping[uuid] = history;
    }

    return history;
  }

  clearItemHistory(item) {
    this.historyForItem(item.uuid).clear();
  }

  clearAllHistory() {
    this.content.itemUUIDToItemHistoryMapping = {};
  }

  setItemRevisionThreshold(threshold) {
    this.itemRevisionThreshold = threshold;
  }

  optimizeHistoryForItem(uuid) {
    /**
     * Clean up if there are too many revisions. Note itemRevisionThreshold
     * is the amount of revisions which above, call for an optimization. An
     * optimization may not remove entries above this threshold. It will
     * determine what it should keep and what it shouldn't. So, it is possible
     * to have a threshold of 60 but have 600 entries, if the item history deems
     * those worth keeping.
     */
    const itemHistory = this.historyForItem(uuid);

    if (itemHistory.entries.length > this.itemRevisionThreshold) {
      itemHistory.optimize();
    }
  }

}
// CONCATENATED MODULE: ./lib/services/history/history_manager.ts







const PERSIST_TIMEOUT = 2000;
/**
 * The history manager is responsible for:
 * 1. Transient session history, which include keeping track of changes made in the
 *    current application session. These change logs (unless otherwise configured) are
 *    ephemeral and do not persist past application restart. Session history entries are
 *    added via change observers that trigger when an item changes.
 * 2. Remote server history. Entries are automatically added by the server and must be
 *    retrieved per item via an API call.
 */

class history_manager_SNHistoryManager extends pure_service["a" /* PureService */] {
  constructor(itemManager, storageService, apiService, protocolService, contentTypes, timeout) {
    super();
    this.contentTypes = [];
    this.persistable = false;
    this.autoOptimize = false;
    this.itemManager = itemManager;
    this.storageService = storageService;
    this.contentTypes = contentTypes;
    this.timeout = timeout;
    this.apiService = apiService;
    this.protocolService = protocolService;
  }

  deinit() {
    this.itemManager = undefined;
    this.storageService = undefined;
    this.contentTypes.length = 0;
    this.sessionHistory = undefined;
    this.timeout = null;

    if (this.removeChangeObserver) {
      this.removeChangeObserver();
      this.removeChangeObserver = null;
    }

    super.deinit();
  }
  /** For local session history */


  async initializeFromDisk() {
    this.persistable = await this.storageService.getValue(StorageKey.SessionHistoryPersistable);
    this.sessionHistory = await this.storageService.getValue(StorageKey.SessionHistoryRevisions).then(historyValue => {
      return session_history_map_SessionHistoryMap.FromJson(historyValue);
    });
    const autoOptimize = await this.storageService.getValue(StorageKey.SessionHistoryOptimize);

    if (Object(utils["p" /* isNullOrUndefined */])(autoOptimize)) {
      /** Default to true */
      this.autoOptimize = true;
    } else {
      this.autoOptimize = autoOptimize;
    }

    this.addChangeObserver();
  }

  addChangeObserver() {
    this.removeChangeObserver = this.itemManager.addObserver(this.contentTypes, (changed, inserted, discarded, source) => {
      const items = Object(utils["f" /* concatArrays */])(changed, inserted, discarded);

      if (source === sources["a" /* PayloadSource */].LocalChanged) {
        return;
      }

      for (const item of items) {
        try {
          if (!item.deleted && !item.errorDecrypting) {
            this.addHistoryEntryForItem(item);
          }
        } catch (e) {
          console.error('Unable to add item history entry:', e);
        }
      }
    });
  }
  /** For local session history */


  isDiskEnabled() {
    return this.persistable;
  }
  /** For local session history */


  isAutoOptimizeEnabled() {
    return this.autoOptimize;
  }
  /** For local session history */


  async saveToDisk() {
    if (!this.persistable) {
      return;
    }

    this.storageService.setValue(StorageKey.SessionHistoryRevisions, this.sessionHistory);
  }
  /** For local session history */


  setSessionItemRevisionThreshold(threshold) {
    this.sessionHistory.setItemRevisionThreshold(threshold);
  }

  async addHistoryEntryForItem(item) {
    const payload = Object(generator["f" /* CreateSourcedPayloadFromObject */])(item, sources["a" /* PayloadSource */].SessionHistory);
    const entry = this.sessionHistory.addEntryForPayload(payload);

    if (this.autoOptimize) {
      this.sessionHistory.optimizeHistoryForItem(item.uuid);
    }

    if (entry && this.persistable) {
      /** Debounce, clear existing timeout */
      if (this.saveTimeout) {
        if (this.timeout.hasOwnProperty('cancel')) {
          this.timeout.cancel(this.saveTimeout);
        } else {
          clearTimeout(this.saveTimeout);
        }
      }

      ;
      this.saveTimeout = this.timeout(() => {
        this.saveToDisk();
      }, PERSIST_TIMEOUT);
    }
  }

  sessionHistoryForItem(item) {
    return this.sessionHistory.historyForItem(item.uuid);
  }
  /** For local session history */


  async clearHistoryForItem(item) {
    this.sessionHistory.clearItemHistory(item);
    return this.saveToDisk();
  }
  /** For local session history */


  async clearAllHistory() {
    this.sessionHistory.clearAllHistory();
    return this.storageService.removeValue(StorageKey.SessionHistoryRevisions);
  }
  /** For local session history */


  async toggleDiskSaving() {
    this.persistable = !this.persistable;

    if (this.persistable) {
      this.storageService.setValue(StorageKey.SessionHistoryPersistable, true);
      this.saveToDisk();
    } else {
      this.storageService.setValue(StorageKey.SessionHistoryPersistable, false);
      return this.storageService.removeValue(StorageKey.SessionHistoryRevisions);
    }
  }
  /** For local session history */


  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;

    if (this.autoOptimize) {
      this.storageService.setValue(StorageKey.SessionHistoryOptimize, true);
    } else {
      this.storageService.setValue(StorageKey.SessionHistoryOptimize, false);
    }
  }
  /**
   * Fetches a list of revisions from the server for an item. These revisions do not
   * include the item's content. Instead, each revision's content must be fetched
   * individually upon selection via `fetchRemoteRevision`.
   */


  async remoteHistoryForItem(item) {
    const serverResponse = await this.apiService.getItemRevisions(item.uuid);

    if (serverResponse.error) {
      return undefined;
    }

    return serverResponse.object;
  }
  /**
   * Expands on a revision fetched via `remoteHistoryForItem` by getting a revision's
   * complete fields (including encrypted content).
   */


  async fetchRemoteRevision(itemUuid, revisionListEntry) {
    const serverResponse = await this.apiService.getRevisionForItem(itemUuid, revisionListEntry.uuid);

    if (serverResponse.error) {
      return undefined;
    }

    const payload = serverResponse.object;
    const encryptedPayload = Object(generator["f" /* CreateSourcedPayloadFromObject */])(payload, sources["a" /* PayloadSource */].RemoteHistory, {
      uuid: itemUuid
    });
    const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(encryptedPayload);
    return new item_history_entry_ItemHistoryEntry(decryptedPayload);
  }

}
// CONCATENATED MODULE: ./lib/services/privileges_service.ts






var PrivilegeSessionLength;

(function (PrivilegeSessionLength) {
  PrivilegeSessionLength[PrivilegeSessionLength["None"] = 0] = "None";
  PrivilegeSessionLength[PrivilegeSessionLength["FiveMinutes"] = 300] = "FiveMinutes";
  PrivilegeSessionLength[PrivilegeSessionLength["OneHour"] = 3600] = "OneHour";
  PrivilegeSessionLength[PrivilegeSessionLength["OneWeek"] = 604800] = "OneWeek";
})(PrivilegeSessionLength || (PrivilegeSessionLength = {}));

const CredentialsMetadata = {
  [PrivilegeCredential.AccountPassword]: {
    label: 'Account Password',
    prompt: 'Please enter your account password.'
  },
  [PrivilegeCredential.LocalPasscode]: {
    label: 'Local Passcode',
    prompt: 'Please enter your local passcode.'
  }
};
const ActionsMetadata = {
  [ProtectedAction.ManageExtensions]: {
    label: 'Manage Extensions'
  },
  [ProtectedAction.ManageBackups]: {
    label: 'Download/Import Backups'
  },
  [ProtectedAction.ViewProtectedNotes]: {
    label: 'View Protected Notes'
  },
  [ProtectedAction.ManagePrivileges]: {
    label: 'Manage Privileges'
  },
  [ProtectedAction.ManagePasscode]: {
    label: 'Manage Passcode'
  },
  [ProtectedAction.DeleteNote]: {
    label: 'Delete Notes'
  }
};
/**
 * Privileges allows certain actions within the application to require extra authentication.
 * For example, the privileges service exposes functions that allow the action of deleting
 * a note or viewing a note to require extra authentication.
 * Privileges are a superficial-level locking feature; they do not deal at all with underlying
 * data state. For example, viewing a protected note may require extra authentication,
 * but the underlying note data may already be decrypted in application memory, whether or not
 * the user has yet authenticated this action.
 */

class privileges_service_SNPrivilegesService extends pure_service["a" /* PureService */] {
  // private sessionLengths: PrivilegeSessionLength[] = []
  constructor(itemManager, syncService, singletonManager, protocolService, storageService, sessionManager) {
    super();
    this.availableActions = [];
    this.availableCredentials = [];
    this.itemManager = itemManager;
    this.syncService = syncService;
    this.singletonManager = singletonManager;
    this.protocolService = protocolService;
    this.storageService = storageService;
    this.sessionManager = sessionManager;
    this.loadDefaults();
  }

  deinit() {
    this.itemManager = undefined;
    this.syncService = undefined;
    this.singletonManager = undefined;
    this.protocolService = undefined;
    this.storageService = undefined;
    this.sessionManager = undefined;
    super.deinit();
  }

  loadDefaults() {
    this.availableActions = Object.keys(ProtectedAction).map(key => {
      return ProtectedAction[key];
    });
    this.availableCredentials = [PrivilegeCredential.AccountPassword, PrivilegeCredential.LocalPasscode];
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }
  /**
   * The credentials currently required to perform this action.
   */


  async netCredentialsForAction(action) {
    const privileges = await this.getPrivileges();
    const credentials = privileges.getCredentialsForAction(action);
    const netCredentials = [];

    for (const credential of credentials) {
      if (credential === PrivilegeCredential.AccountPassword) {
        const isOnline = await this.sessionManager.online();

        if (isOnline) {
          netCredentials.push(credential);
        }
      } else if (credential === PrivilegeCredential.LocalPasscode) {
        const hasPasscode = await this.protocolService.hasRootKeyWrapper();

        if (hasPasscode) {
          netCredentials.push(credential);
        }
      }
    }

    return netCredentials;
  }

  async getPrivileges() {
    const contentType = content_types["a" /* ContentType */].Privileges;
    const predicate = new core_predicate["a" /* SNPredicate */]('content_type', '=', contentType);
    return this.singletonManager.findOrCreateSingleton(predicate, contentType, Object(functions["a" /* FillItemContent */])({}));
  }

  async setSessionLength(length) {
    const addSecondsToNow = seconds => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    };

    const expiresAt = addSecondsToNow(length);
    await this.storageService.setValue(StorageKey.PrivilegesExpirey, expiresAt);
    await this.storageService.setValue(StorageKey.PrivilegesSessionLength, length);
  }

  async clearSession() {
    return this.setSessionLength(PrivilegeSessionLength.None);
  }

  async getSelectedSessionLength() {
    const length = await this.storageService.getValue(StorageKey.PrivilegesSessionLength);

    if (length) {
      return length;
    } else {
      return PrivilegeSessionLength.None;
    }
  }

  async getSessionExpirey() {
    const expiresAt = await this.storageService.getValue(StorageKey.PrivilegesExpirey);

    if (expiresAt) {
      return new Date(expiresAt);
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }
  /**
   * Whether the action requires present authentication.
   */


  async actionRequiresPrivilege(action) {
    const expiresAt = await this.getSessionExpirey();

    if (expiresAt > new Date()) {
      return false;
    }

    const netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async authenticateAction(action, credentialAuthMapping) {
    const requiredCredentials = await this.netCredentialsForAction(action);
    const successfulCredentials = [];
    const failedCredentials = [];

    for (const credential of requiredCredentials) {
      const passesAuth = await this.verifyAuthenticationParameters(credential, credentialAuthMapping[credential]);

      if (passesAuth) {
        successfulCredentials.push(credential);
      } else {
        failedCredentials.push(credential);
      }
    }

    return {
      success: failedCredentials.length === 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    };
  }

  async verifyAuthenticationParameters(credential, value) {
    if (credential === PrivilegeCredential.AccountPassword) {
      const {
        valid
      } = await this.protocolService.validateAccountPassword(value);
      return valid;
    } else if (credential === PrivilegeCredential.LocalPasscode) {
      const {
        valid
      } = await this.protocolService.validatePasscode(value);
      return valid;
    }
  }

  displayInfoForCredential(credential) {
    return CredentialsMetadata[credential];
  }

  displayInfoForAction(action) {
    return ActionsMetadata[action];
  }

  getSessionLengthOptions() {
    return [{
      value: PrivilegeSessionLength.None,
      label: "Don't Remember"
    }, {
      value: PrivilegeSessionLength.FiveMinutes,
      label: '5 Minutes'
    }, {
      value: PrivilegeSessionLength.OneHour,
      label: '1 Hour'
    }, {
      value: PrivilegeSessionLength.OneWeek,
      label: '1 Week'
    }];
  }

}
// CONCATENATED MODULE: ./lib/protocol/collection/item_collection.ts


var CollectionSort;

(function (CollectionSort) {
  CollectionSort["CreatedAt"] = "created_at";
  CollectionSort["UpdatedAt"] = "userModifiedDate";
  CollectionSort["Title"] = "title";
})(CollectionSort || (CollectionSort = {}));
/** The item collection class builds on mutable collection by providing an option to keep
 * items sorted and filtered. */


class item_collection_ItemCollection extends collection_MutableCollection {
  constructor() {
    super(...arguments);
    this.displaySortBy = {};
    this.displayFilter = {};
    /** A display ready map of uuids-to-position in sorted array. i.e filteredMap[contentType]
     * returns {uuid_123: 1, uuid_456: 2}, where 1 and 2 are the positions of the element
     * in the sorted array. We keep track of positions so that when we want to re-sort or remove
     * and element, we don't have to search the entire sorted array to do so. */

    this.filteredMap = {};
    /** A sorted representation of the filteredMap, where sortedMap[contentType] returns
     * an array of sorted elements, based on the current displaySortBy */

    this.sortedMap = {};
  }

  set(elements) {
    elements = Array.isArray(elements) ? elements : [elements];
    super.set(elements);
    this.filterSortElements(elements);
  }

  discard(elements) {
    elements = Array.isArray(elements) ? elements : [elements];
    super.discard(elements);
    this.filterSortElements(elements);
  }
  /**
   * Sets an optional sortBy and filter for a given content type. These options will be
   * applied against a separate "display-only" record and not the master record. Passing
   * null options removes any existing options. sortBy is always required, but a filter is
   * not always required.
   * Note that sorting and filtering only applies to collections of type SNItem, and not
   * payloads. This is because we access item properties such as `pinned` and `title`.
   * @param filter A function that receives an element and returns a boolean indicating
   * whether the element passes the filter and should be in displayable results.
   */


  setDisplayOptions(contentType, sortBy, direction, filter) {
    const existingSortBy = this.displaySortBy[contentType];
    const existingFilter = this.displayFilter[contentType];
    /** If the sort value is unchanged, and we are not setting a new filter,
     * we return, as to not rebuild and resort all elements */

    if (existingSortBy && existingSortBy.key === sortBy && existingSortBy.dir === direction && !existingFilter && !filter) {
      return;
    }

    this.displaySortBy[contentType] = sortBy ? {
      key: sortBy,
      dir: direction
    } : undefined;
    this.displayFilter[contentType] = filter;
    /** Reset existing maps */

    this.filteredMap[contentType] = {};
    this.sortedMap[contentType] = [];
    /** Re-process all elements */

    const elements = this.all(contentType);

    if (elements.length > 0) {
      this.filterSortElements(elements);
    }
  }
  /** Returns the filtered and sorted list of elements for this content type,
   * according to the options set via `setDisplayOptions` */


  displayElements(contentType) {
    const elements = this.sortedMap[contentType];

    if (!elements) {
      throw Error("Attempting to access display elements for\n        non-configured content type ".concat(contentType));
    }

    return elements.slice();
  }

  filterSortElements(elements) {
    if (Object.keys(this.displaySortBy).length === 0) {
      return;
    }
    /** If a content type is added to this set, we are indicating the entire sorted
     * array will need to be re-sorted. The reason for sorting the entire array and not
     * just inserting an element using binary search is that we need to keep track of the
     * sorted index of an item so that we can look up and change its value without having
     * to search the array for it. */


    const typesNeedingResort = new Set();

    for (const element of elements) {
      const contentType = element.content_type;
      const sortBy = this.displaySortBy[contentType];
      /** Sort by is required, but filter is not */

      if (!sortBy) {
        continue;
      }

      const filter = this.displayFilter[contentType];
      /** Filtered content type map */

      const filteredCTMap = this.filteredMap[contentType];
      const sortedElements = this.sortedMap[contentType];
      const previousIndex = filteredCTMap[element.uuid];
      const previousElement = !Object(utils["p" /* isNullOrUndefined */])(previousIndex) ? sortedElements[previousIndex] : undefined;
      /** If the element is deleted, or if it no longer exists in the primary map (because
       * it was discarded without neccessarily being marked as deleted), it does not pass
       * the filter. If no filter the element passes by default. */

      const passes = element.deleted || !this.map[element.uuid] ? false : filter ? filter(element) : true;

      if (passes) {
        if (!Object(utils["p" /* isNullOrUndefined */])(previousElement)) {
          /** Check to see if the element has changed its sort value. If so, we need to re-sort.
           * Previous element might be encrypted.
           */
          const previousValue = previousElement.errorDecrypting ? undefined : previousElement[sortBy.key];
          const newValue = element[sortBy.key];
          /** Replace the current element with the new one. */

          sortedElements[previousIndex] = element;
          /** If the pinned status of the element has changed, it needs to be resorted */

          const pinChanged = previousElement.pinned !== element.pinned;

          if (!Object(utils["e" /* compareValues */])(previousValue, newValue) || pinChanged) {
            /** Needs resort because its re-sort value has changed,
             * and thus its position might change */
            typesNeedingResort.add(contentType);
          }
        } else {
          /** Has not yet been inserted */
          sortedElements.push(element);
          /** Needs re-sort because we're just pushing the element to the end here */

          typesNeedingResort.add(contentType);
        }
      } else {
        /** Doesn't pass filter, remove from sorted and filtered */
        if (!Object(utils["p" /* isNullOrUndefined */])(previousIndex)) {
          delete filteredCTMap[element.uuid];
          /** We don't yet remove the element directly from the array, since mutating
           * the array inside a loop could render all other upcoming indexes invalid */

          sortedElements[previousIndex] = undefined;
          /** Since an element is being removed from the array, we need to recompute
           * the new positions for elements that are staying */

          typesNeedingResort.add(contentType);
        }
      }
    }

    for (const contentType of typesNeedingResort.values()) {
      this.resortContentType(contentType);
    }
  }

  resortContentType(contentType) {
    const sortedElements = this.sortedMap[contentType];
    const sortBy = this.displaySortBy[contentType];
    const filteredCTMap = this.filteredMap[contentType];
    /** Resort the elements array, and update the saved positions */

    /** @O(n * log(n)) */

    const sortFn = function sortFn(a, b) {
      let skipPinnedCheck = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      /** If the elements are undefined, move to beginning */
      if (!a) {
        return -1;
      }

      if (!b) {
        return 1;
      }

      if (!skipPinnedCheck) {
        if (a.pinned && b.pinned) {
          return sortFn(a, b, true);
        }

        if (a.pinned) {
          return -1;
        }

        if (b.pinned) {
          return 1;
        }
      }

      let aValue = a[sortBy.key] || '';
      let bValue = b[sortBy.key] || '';
      let vector = 1;

      if (sortBy.dir === 'asc') {
        vector *= -1;
      }

      if (sortBy.key === CollectionSort.Title) {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();

        if (aValue.length === 0 && bValue.length === 0) {
          return 0;
        } else if (aValue.length === 0 && bValue.length !== 0) {
          return 1 * vector;
        } else if (aValue.length !== 0 && bValue.length === 0) {
          return -1 * vector;
        } else {
          vector *= -1;
        }
      }

      if (aValue > bValue) {
        return -1 * vector;
      } else if (aValue < bValue) {
        return 1 * vector;
      }

      return 0;
    };

    const resorted = sortedElements.sort((a, b) => {
      return sortFn(a, b);
    });
    /** Now that resorted contains the sorted elements (but also can contain undefined element)
     * we create another array that filters out any of the undefinedes. We also keep track of the
     * current index while we loop and set that in the filteredCTMap. */

    const cleaned = [];
    let currentIndex = 0;
    /** @O(n) */

    for (const element of resorted) {
      if (!element) {
        continue;
      }

      cleaned.push(element);
      filteredCTMap[element.uuid] = currentIndex;
      currentIndex++;
    }

    this.sortedMap[contentType] = cleaned;
  }

}
// CONCATENATED MODULE: ./lib/protocol/collection/item_collection_notes_view.ts
function item_collection_notes_view_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function item_collection_notes_view_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { item_collection_notes_view_ownKeys(Object(source), true).forEach(function (key) { item_collection_notes_view_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { item_collection_notes_view_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function item_collection_notes_view_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */

class item_collection_notes_view_ItemCollectionNotesView {
  constructor(collection) {
    this.collection = collection;
    this.displayedList = [];
    this.needsRebuilding = true;
  }

  notesMatchingSmartTag(smartTag, notes) {
    const predicate = smartTag.predicate;
    /** Optimized special cases */

    if (smartTag.isArchiveTag) {
      return notes.filter(note => note.archived && !note.trashed && !note.deleted);
    } else if (smartTag.isTrashTag) {
      return notes.filter(note => note.trashed && !note.deleted);
    }

    const allNotes = notes.filter(note => !note.trashed && !note.deleted);

    if (smartTag.isAllTag) {
      return allNotes;
    }

    if (predicate.keypathIncludesVerb('tags')) {
      /**
       * A note object doesn't come with its tags, so we map the list to
       * flattened note-like objects that also contain
       * their tags. Having the payload properties on the same level as the note
       * properties is necessary because SNNote has many getters that are
       * proxies to its inner payload object.
       */
      return allNotes.map(note => item_collection_notes_view_objectSpread(item_collection_notes_view_objectSpread(item_collection_notes_view_objectSpread({}, note), note.payload), {}, {
        tags: this.collection.elementsReferencingElement(note)
      })).filter(note => core_predicate["a" /* SNPredicate */].ObjectSatisfiesPredicate(note, predicate))
      /** Map our special-case items back to notes */
      .map(note => this.collection.map[note.uuid]);
    } else {
      return allNotes.filter(note => core_predicate["a" /* SNPredicate */].ObjectSatisfiesPredicate(note, predicate));
    }
  }

  setDisplayOptions(tag, sortBy, direction, filter) {
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].Note, sortBy, direction, filter);
    this.tag = tag;
    this.needsRebuilding = true;
  }

  rebuildList() {
    const tag = this.tag;
    const notes = this.collection.displayElements(content_types["a" /* ContentType */].Note);

    if (tag === null || tag === void 0 ? void 0 : tag.isSmartTag()) {
      this.displayedList = this.notesMatchingSmartTag(tag, notes);
    } else if (tag) {
      this.displayedList = this.collection.referencesForElement(tag).filter(element => element.content_type === content_types["a" /* ContentType */].Note && !element.deleted && !element.trashed);
    } else {
      this.displayedList = notes;
    }
  }

  setNeedsRebuilding() {
    this.needsRebuilding = true;
  }

  displayElements() {
    if (this.needsRebuilding) {
      this.rebuildList();
      this.needsRebuilding = false;
    }

    return this.displayedList.slice();
  }

  all() {
    return this.collection.all(content_types["a" /* ContentType */].Note);
  }

}
// CONCATENATED MODULE: ./lib/services/item_manager.ts





















/**
 * The item manager is backed by the Payload Manager. Think of the item manager as a
 * more user-friendly or item-specific interface to creating and updating data.
 * The item manager listens for change events from the global payload manager, and
 * converts any payloads to SNItems, then propagates those items to listeners on the
 * item  manager. When the item manager makes a change to an item, it will modify items
 * using a  mutator, then emit those payloads to the payload manager. The payload manager
 * will then notify  its observers (which is us), we'll convert the payloads to items,
 * and then  we'll propagate them to our listeners.
 */

class item_manager_ItemManager extends pure_service["a" /* PureService */] {
  constructor(modelManager) {
    super();
    this.observers = [];
    this.modelManager = modelManager;
    this.systemSmartTags = BuildSmartTags();
    this.createCollection();
    this.unsubChangeObserver = this.modelManager.addObserver(content_types["a" /* ContentType */].Any, this.setPayloads.bind(this));
  }

  createCollection() {
    this.collection = new item_collection_ItemCollection();
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].Note, CollectionSort.CreatedAt, 'dsc');
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].Tag, CollectionSort.Title, 'asc');
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].ItemsKey, CollectionSort.CreatedAt, 'asc');
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].Component, CollectionSort.CreatedAt, 'asc');
    this.collection.setDisplayOptions(content_types["a" /* ContentType */].SmartTag, CollectionSort.Title, 'asc');
    this.notesView = new item_collection_notes_view_ItemCollectionNotesView(this.collection);
  }

  setDisplayOptions(contentType, sortBy, direction, filter) {
    if (contentType === content_types["a" /* ContentType */].Note) {
      console.warn("Called setDisplayOptions with ContentType.Note. " + "setNotesDisplayOptions should be used instead.");
    }

    this.collection.setDisplayOptions(contentType, sortBy, direction, filter);
  }

  setNotesDisplayOptions(tag, sortBy, direction, filter) {
    this.notesView.setDisplayOptions(tag, sortBy, direction, filter);
  }

  getDisplayableItems(contentType) {
    if (contentType === content_types["a" /* ContentType */].Note) {
      return this.notesView.displayElements();
    }

    return this.collection.displayElements(contentType);
  }

  deinit() {
    this.unsubChangeObserver();
    this.unsubChangeObserver = undefined;
    this.modelManager = undefined;
    this.collection = undefined;
    this.notesView = undefined;
  }

  resetState() {
    this.createCollection();
  }
  /**
   * Returns an item for a given id
   */


  findItem(uuid) {
    return this.collection.find(uuid);
  }
  /**
   * Returns all items matching given ids
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */


  findItems(uuids) {
    let includeBlanks = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return this.collection.findAll(uuids, includeBlanks);
  }
  /**
   * Returns a detached array of all items
   */


  get items() {
    return this.collection.all();
  }
  /**
   * Returns a detached array of all items which are not deleted
   */


  get nonDeletedItems() {
    return this.collection.nondeletedElements();
  }
  /**
   * Returns all items that have not been able to decrypt.
   */


  get invalidItems() {
    return this.collection.invalidElements();
  }
  /**
   * Returns all non-deleted items keys
   */


  itemsKeys() {
    return this.collection.displayElements(content_types["a" /* ContentType */].ItemsKey);
  }
  /**
  * Returns all non-deleted notes
  */


  get notes() {
    return this.notesView.displayElements();
  }
  /**
  * Returns all non-deleted tags
  */


  get tags() {
    return this.collection.displayElements(content_types["a" /* ContentType */].Tag);
  }
  /**
  * Returns all non-deleted components
  */


  get components() {
    return this.collection.displayElements(content_types["a" /* ContentType */].Component);
  }

  addObserver(contentType, callback) {
    if (!Array.isArray(contentType)) {
      contentType = [contentType];
    }

    const observer = {
      contentType,
      callback
    };
    this.observers.push(observer);
    return () => {
      Object(utils["B" /* removeFromArray */])(this.observers, observer);
    };
  }
  /**
   * Returns the items that reference the given item, or an empty array if no results.
   */


  itemsReferencingItem(uuid) {
    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid string');
    }

    const uuids = this.collection.uuidsThatReferenceUuid(uuid);
    return this.findItems(uuids);
  }
  /**
   * Returns all items that an item directly references
   */


  referencesForItem(uuid) {
    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid string');
    }

    const item = this.findItem(uuid);
    const uuids = item.references.map(ref => ref.uuid);
    return this.findItems(uuids);
  }

  async setPayloads(changed, inserted, discarded, source, sourceKey) {
    const changedItems = changed.map(p => CreateItemFromPayload(p));
    const insertedItems = inserted.map(p => CreateItemFromPayload(p));
    const changedOrInserted = changedItems.concat(insertedItems);

    if (changedOrInserted.length > 0) {
      this.collection.set(changedOrInserted);
    }

    const discardedItems = discarded.map(p => CreateItemFromPayload(p));

    for (const item of discardedItems) {
      this.collection.discard(item);
    }

    this.notesView.setNeedsRebuilding();
    await this.notifyObservers(changedItems, insertedItems, discardedItems, source, sourceKey);
  }

  async notifyObservers(changed, inserted, discarded, source, sourceKey) {
    const filter = (items, types) => {
      return items.filter(item => {
        return types.includes(content_types["a" /* ContentType */].Any) || types.includes(item.content_type);
      });
    };

    const observers = this.observers.slice();

    for (const observer of observers) {
      const filteredChanged = filter(changed, observer.contentType);
      const filteredInserted = filter(inserted, observer.contentType);
      const filteredDiscarded = filter(discarded, observer.contentType);

      if (filteredChanged.length === 0 && filteredInserted.length === 0 && filteredDiscarded.length === 0) {
        continue;
      }

      observer.callback(filteredChanged, filteredInserted, filteredDiscarded, source, sourceKey);
    }
  }
  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   * @param itemOrUuid If an item is passed, the values of that item will be directly used,
   * and the mutation will be applied on that item and propagated. This means that if you pass
   * an old item reference and mutate that, the new value will be outdated. In this case, always
   * pass the uuid of the item if you want to mutate the latest version of the item.
   */


  async changeItem(uuid, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;

    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Invalid uuid for changeItem');
    }

    const results = await this.changeItems([uuid], mutate, mutationType, payloadSource, payloadSourceKey);
    return results[0];
  }

  createMutatorForItem(item, type) {
    if (item.content_type === content_types["a" /* ContentType */].Note) {
      return new note_NoteMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].Tag) {
      return new tag_TagMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].Component) {
      return new component_ComponentMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].ActionsExtension) {
      return new extension_ActionsExtensionMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].ItemsKey) {
      return new items_key_ItemsKeyMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].Privileges) {
      return new privileges_PrivilegeMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].UserPrefs) {
      return new userPrefs_UserPrefsMutator(item, type);
    } else if (item.content_type === content_types["a" /* ContentType */].Theme) {
      return new theme_ThemeMutator(item, type);
    } else {
      return new core_item["b" /* ItemMutator */](item, type);
    }
  }
  /**
   * @param mutate If not supplied, the intention would simply be to mark the item as dirty.
   */


  async changeItems(uuids, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;
    const items = this.findItems(uuids, true);
    const payloads = [];

    for (const item of items) {
      if (!item) {
        throw Error('Attempting to change non-existant item');
      }

      const mutator = this.createMutatorForItem(item, mutationType);

      if (mutate) {
        mutate(mutator);
      }

      const payload = mutator.getResult();
      payloads.push(payload);
    }

    await this.modelManager.emitPayloads(payloads, payloadSource, payloadSourceKey);
    const results = this.findItems(payloads.map(p => p.uuid));
    return results;
  }

  async changeNote(uuid, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;
    const note = this.findItem(uuid);

    if (!note) {
      throw Error('Attempting to change non-existant note');
    }

    const mutator = new note_NoteMutator(note, mutationType);
    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
  }

  async changeComponent(uuid, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;
    const component = this.findItem(uuid);

    if (!component) {
      throw Error('Attempting to change non-existant component');
    }

    const mutator = new component_ComponentMutator(component, mutationType);
    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
  }

  async changeActionsExtension(uuid, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;
    const extension = this.findItem(uuid);

    if (!extension) {
      throw Error('Attempting to change non-existant extension');
    }

    const mutator = new extension_ActionsExtensionMutator(extension, mutationType);
    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
  }

  async changeItemsKey(uuid, mutate) {
    let mutationType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : core_item["c" /* MutationType */].UserInteraction;
    let payloadSource = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 4 ? arguments[4] : undefined;
    const itemsKey = this.findItem(uuid);

    if (!itemsKey) {
      throw Error('Attempting to change non-existant itemsKey');
    }

    const mutator = new items_key_ItemsKeyMutator(itemsKey, mutationType);
    return this.applyTransform(mutator, mutate, payloadSource, payloadSourceKey);
  }

  async applyTransform(mutator, mutate) {
    let payloadSource = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : sources["a" /* PayloadSource */].LocalChanged;
    let payloadSourceKey = arguments.length > 3 ? arguments[3] : undefined;
    mutate(mutator);
    const payload = mutator.getResult();
    return this.modelManager.emitPayload(payload, payloadSource, payloadSourceKey);
  }
  /**
    * Sets the item as needing sync. The item is then run through the mapping function,
    * and propagated to mapping observers.
    * @param updateClientDate - Whether to update the item's "user modified date"
    */


  async setItemDirty(uuid) {
    let isUserModified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid when setting item dirty');
    }

    const result = await this.setItemsDirty([uuid], isUserModified);
    return result[0];
  }
  /**
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */


  async setItemsDirty(uuids) {
    let isUserModified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!Object(utils["s" /* isString */])(uuids[0])) {
      throw Error('Must use uuid when setting item dirty');
    }

    return this.changeItems(uuids, undefined, isUserModified ? core_item["c" /* MutationType */].UserInteraction : core_item["c" /* MutationType */].Internal);
  }
  /**
   * Returns an array of items that need to be synced.
   */


  getDirtyItems() {
    const dirty = this.collection.dirtyElements();
    return dirty.filter(item => {
      /* An item that has an error decrypting can be synced only if it is being deleted.
        Otherwise, we don't want to send corrupt content up to the server. */
      return !item.errorDecrypting || item.deleted;
    });
  }
  /**
   * Inserts the item as-is by reading its payload value. This function will not
   * modify item in any way (such as marking it as dirty). It is up to the caller
   * to pass in a dirtied item if that is their intention.
   */


  async insertItem(item) {
    const payload = item.payload;
    const insertedItem = await this.emitItemFromPayload(payload);
    return insertedItem;
  }
  /**
   * Duplicates an item and maps it, thus propagating the item to observers.
   * @param isConflict - Whether to mark the duplicate as a conflict of the original.
   */


  async duplicateItem(uuid) {
    let isConflict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const item = this.findItem(uuid);
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(item);
    const resultingPayloads = await PayloadsByDuplicating(payload, this.modelManager.getMasterCollection(), isConflict);
    await this.modelManager.emitPayloads(resultingPayloads, sources["a" /* PayloadSource */].LocalChanged);
    const duplicate = this.findItem(resultingPayloads[0].uuid);
    return duplicate;
  }
  /**
   * Creates an item and conditionally maps it and marks it as dirty.
   * @param needsSync - Whether to mark the item as needing sync
   */


  async createItem(contentType, content) {
    let needsSync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let override = arguments.length > 3 ? arguments[3] : undefined;

    if (!contentType) {
      throw 'Attempting to create item with no contentType';
    }

    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
      uuid: await uuid_Uuid.GenerateUuid(),
      content_type: contentType,
      content: content ? Object(functions["a" /* FillItemContent */])(content) : undefined,
      dirty: needsSync
    }, override);
    await this.modelManager.emitPayload(payload, sources["a" /* PayloadSource */].Constructor);
    return this.findItem(payload.uuid);
  }

  async createTemplateItem(contentType, content) {
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
      uuid: await uuid_Uuid.GenerateUuid(),
      content_type: contentType,
      content: Object(functions["a" /* FillItemContent */])(content || {})
    });
    return CreateItemFromPayload(payload);
  }

  async emitItemFromPayload(payload) {
    let source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sources["a" /* PayloadSource */].Constructor;
    await this.modelManager.emitPayload(payload, source);
    return this.findItem(payload.uuid);
  }

  async emitItemsFromPayloads(payloads) {
    let source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : sources["a" /* PayloadSource */].Constructor;
    await this.modelManager.emitPayloads(payloads, source);
    const uuids = Object(functions["b" /* Uuids */])(payloads);
    return this.findItems(uuids);
  }
  /**
   * Marks the item as deleted and needing sync.
   */


  async setItemToBeDeleted(uuid) {
    /** Capture referencing ids before we delete the item below, otherwise
     * the index may be updated before we get a chance to act on it */
    const referencingIds = this.collection.uuidsThatReferenceUuid(uuid);
    const item = this.findItem(uuid);
    const changedItem = await this.changeItem(uuid, mutator => {
      mutator.setDeleted();
    });
    /** Handle indirect relationships.
     * (Direct relationships are cleared by clearing content above) */

    for (const referencingId of referencingIds) {
      const referencingItem = this.findItem(referencingId);

      if (referencingItem) {
        await this.changeItem(referencingItem.uuid, mutator => {
          mutator.removeItemAsRelationship(item);
        });
      }
    }

    return changedItem;
  }
  /**
   * Like `setItemToBeDeleted`, but acts on an array of items.
   */


  async setItemsToBeDeleted(uuids) {
    const changedItems = [];

    for (const uuid of uuids) {
      const changedItem = await this.setItemToBeDeleted(uuid);
      changedItems.push(changedItem);
    }

    return changedItems;
  }
  /**
   * Returns all items of a certain type
   * @param contentType - A string or array of strings representing
   *    content types.
   */


  getItems(contentType) {
    return this.collection.all(contentType);
  }
  /**
   * Returns all items which are properly decrypted
   */


  nonErroredItemsForContentType(contentType) {
    const items = this.collection.all(contentType);
    return items.filter(item => !item.errorDecrypting && !item.waitingForKey);
  }
  /**
   * Returns all items matching a given predicate
   */


  itemsMatchingPredicate(predicate) {
    return this.itemsMatchingPredicates([predicate]);
  }
  /**
  * Returns all items matching an array of predicates
  */


  itemsMatchingPredicates(predicates) {
    return this.subItemsMatchingPredicates(this.items, predicates);
  }
  /**
   * Performs actual predicate filtering for public methods above.
   * Does not return deleted items.
   */


  subItemsMatchingPredicates(items, predicates) {
    const results = items.filter(item => {
      if (item.deleted) {
        return false;
      }

      for (const predicate of predicates) {
        if (!item.satisfiesPredicate(predicate)) {
          return false;
        }
      }

      return true;
    });
    return results;
  }
  /**
   * Finds the first tag matching a given title
   */


  findTagByTitle(title) {
    return Object(utils["D" /* searchArray */])(this.tags, {
      title: title
    });
  }
  /**
  * Finds or creates a tag with a given title
  */


  async findOrCreateTagByTitle(title) {
    const tag = this.findTagByTitle(title);
    return tag || (await this.createItem(content_types["a" /* ContentType */].Tag, Object(functions["a" /* FillItemContent */])({
      title
    }), true));
  }
  /**
   * Returns all notes matching the smart tag
   */


  notesMatchingSmartTag(smartTag) {
    return this.notesView.notesMatchingSmartTag(smartTag, this.notesView.all());
  }
  /**
   * Returns the smart tag corresponding to the "Trash" tag.
   */


  get trashSmartTag() {
    return this.systemSmartTags.find(tag => tag.isTrashTag);
  }
  /**
   * Returns all items currently in the trash
   */


  get trashedItems() {
    return this.notesMatchingSmartTag(this.trashSmartTag);
  }
  /**
   * Permanently deletes any items currently in the trash. Consumer must manually call sync.
   */


  async emptyTrash() {
    const notes = this.trashedItems;
    return this.setItemsToBeDeleted(Object(functions["b" /* Uuids */])(notes));
  }
  /**
   * Returns all smart tags, sorted by title.
   */


  getSmartTags() {
    const userTags = this.collection.displayElements(content_types["a" /* ContentType */].SmartTag);
    return this.systemSmartTags.concat(userTags);
  }
  /**
   * The number of notes currently managed
   */


  get noteCount() {
    return this.collection.all(content_types["a" /* ContentType */].Note).length;
  }
  /**
   * Immediately removes all items from mapping state and notifies observers
   * Used primarily when signing into an account and wanting to discard any current
   * local data.
   */


  async removeAllItemsFromMemory() {
    const uuids = Object(functions["b" /* Uuids */])(this.items);
    /** We don't want to set as dirty, since we want to dispose of immediately. */

    await this.changeItems(uuids, mutator => {
      mutator.setDeleted();
    }, core_item["c" /* MutationType */].NonDirtying);
    this.resetState();
    this.modelManager.resetState();
  }

  removeItemLocally(item) {
    this.collection.discard(item);
    this.modelManager.removePayloadLocally(item.payload);
  }

}
const SYSTEM_TAG_ALL_NOTES = 'all-notes';
const SYSTEM_TAG_ARCHIVED_NOTES = 'archived-notes';
const SYSTEM_TAG_TRASHED_NOTES = 'trashed-notes';

function BuildSmartTags() {
  const allNotes = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
    uuid: SYSTEM_TAG_ALL_NOTES,
    content_type: content_types["a" /* ContentType */].SmartTag,
    content: Object(functions["a" /* FillItemContent */])({
      title: 'All notes',
      isSystemTag: true,
      isAllTag: true,
      predicate: core_predicate["a" /* SNPredicate */].FromArray(['content_type', '=', content_types["a" /* ContentType */].Note])
    })
  });
  const archived = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
    uuid: SYSTEM_TAG_ARCHIVED_NOTES,
    content_type: content_types["a" /* ContentType */].SmartTag,
    content: Object(functions["a" /* FillItemContent */])({
      title: 'Archived',
      isSystemTag: true,
      isArchiveTag: true,
      predicate: core_predicate["a" /* SNPredicate */].FromArray(['archived', '=', JSON.stringify(true)])
    })
  });
  const trash = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])({
    uuid: SYSTEM_TAG_TRASHED_NOTES,
    content_type: content_types["a" /* ContentType */].SmartTag,
    content: Object(functions["a" /* FillItemContent */])({
      title: 'Trash',
      isSystemTag: true,
      isTrashTag: true,
      predicate: core_predicate["a" /* SNPredicate */].FromArray(['trashed', '=', JSON.stringify(true)])
    })
  });
  return [CreateItemFromPayload(allNotes), CreateItemFromPayload(archived), CreateItemFromPayload(trash)];
}
// CONCATENATED MODULE: ./lib/services/sync/utils.ts
/**
  * Sorts payloads according by most recently modified first, according to the priority,
  * whereby the earlier a content_type appears in the priorityList,
  * the earlier it will appear in the resulting sorted array.
  */
function SortPayloadsByRecentAndContentPriority(payloads, priorityList) {
  return payloads.sort((a, b) => {
    const dateResult = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    let aPriority = 0;
    let bPriority = 0;

    if (priorityList) {
      aPriority = priorityList.indexOf(a.content_type);
      bPriority = priorityList.indexOf(b.content_type);

      if (aPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        aPriority = priorityList.length;
      }

      if (bPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        bPriority = priorityList.length;
      }
    }

    if (aPriority === bPriority) {
      return dateResult;
    }

    if (aPriority < bPriority) {
      return -1;
    } else {
      return 1;
    }
  });
}
// CONCATENATED MODULE: ./lib/services/sync/sync_op_status.ts

const HEALTHY_SYNC_DURATION_THRESHOLD_S = 5;
const TIMING_MONITOR_POLL_FREQUENCY_MS = 500;
class sync_op_status_SyncOpStatus {
  constructor(interval, receiver) {
    this.inProgress = false;
    this.completedUpload = 0;
    this.totalUpload = 0;
    this.downloaded = 0;
    this.databaseLoadCurrent = 0;
    this.databaseLoadTotal = 0;
    this.databaseLoadDone = false;
    this.syncing = false;
    this.interval = interval;
    this.receiver = receiver;
  }

  deinit() {
    this.stopTimingMonitor();
  }

  setSyncInProgress(inProgress) {
    this.inProgress = true;
  }

  setUploadStatus(completed, total) {
    this.completedUpload = completed;
    this.totalUpload = total;
    this.receiver(sync_events["a" /* SyncEvent */].StatusChanged);
  }

  setDownloadStatus(downloaded) {
    this.downloaded += downloaded;
    this.receiver(sync_events["a" /* SyncEvent */].StatusChanged);
  }

  setDatabaseLoadStatus(current, total, done) {
    this.databaseLoadCurrent = current;
    this.databaseLoadTotal = total;
    this.databaseLoadDone = done;

    if (done) {
      this.receiver(sync_events["a" /* SyncEvent */].LocalDataLoaded);
    } else {
      this.receiver(sync_events["a" /* SyncEvent */].LocalDataIncrementalLoad);
    }
  }

  getStats() {
    return {
      uploadCompletionCount: this.completedUpload,
      uploadTotalCount: this.totalUpload,
      downloadCount: this.downloaded,
      localDataDone: this.databaseLoadDone,
      localDataCurrent: this.databaseLoadCurrent,
      localDataTotal: this.databaseLoadTotal
    };
  }

  setDidBegin() {
    this.syncing = true;
    this.syncStart = new Date();
  }

  setDidEnd() {
    this.syncing = false;
    this.syncEnd = new Date();
  }

  get syncInProgress() {
    return this.syncing === true;
  }

  get secondsSinceSyncStart() {
    return (new Date().getTime() - this.syncStart.getTime()) / 1000;
  }
  /**
   * Notifies receiver if current sync request is taking too long to complete.
   */


  startTimingMonitor() {
    if (this.timingMonitor) {
      this.stopTimingMonitor();
    }

    this.timingMonitor = this.interval(() => {
      if (this.secondsSinceSyncStart > HEALTHY_SYNC_DURATION_THRESHOLD_S) {
        this.receiver(sync_events["a" /* SyncEvent */].SyncTakingTooLong);
        this.stopTimingMonitor();
      }
    }, TIMING_MONITOR_POLL_FREQUENCY_MS);
  }

  stopTimingMonitor() {
    if (Object.prototype.hasOwnProperty.call(this.interval, 'cancel')) {
      this.interval.cancel(this.timingMonitor);
    } else {
      clearInterval(this.timingMonitor);
    }

    this.timingMonitor = null;
  }

  hasError() {
    return !!this.error;
  }

  setError(error) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.downloaded = 0;
    this.completedUpload = 0;
    this.totalUpload = 0;
    this.inProgress = false;
    this.syncing = false;
    this.error = null;
    this.stopTimingMonitor();
    this.receiver(sync_events["a" /* SyncEvent */].StatusChanged);
  }

}
// CONCATENATED MODULE: ./lib/services/sync/sync_state.ts

class sync_state_SyncState {
  constructor(receiver, maxDiscordance) {
    this.discordance = 0;
    this.outOfSync = false;
    this.receiver = receiver;
    this.maxDiscordance = maxDiscordance;
    this.reset();
  }

  isOutOfSync() {
    return this.outOfSync;
  }

  reset() {
    this.lastPreSyncSave = undefined;
    this.lastSyncDate = undefined;
    this.discordance = 0;
    this.outOfSync = false;
  }

  get needsSync() {
    return this.discordance > 0 && this.discordance < this.maxDiscordance;
  }

  getLastClientIntegrityHash() {
    return this.lastClientHash;
  }

  clearIntegrityHashes() {
    this.lastClientHash = undefined;
    this.lastServerHash = undefined;
  }

  async setIntegrityHashes(clientHash, serverHash) {
    this.lastClientHash = clientHash;
    this.lastServerHash = serverHash;
    const isInSync = !serverHash || serverHash.length === 0 || !clientHash || clientHash === serverHash;

    if (isInSync) {
      if (this.outOfSync) {
        this.outOfSync = false;
        this.receiver(sync_events["a" /* SyncEvent */].ExitOutOfSync);
      }

      this.discordance = 0;
    } else {
      this.discordance++;

      if (this.discordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true;
        this.receiver(sync_events["a" /* SyncEvent */].EnterOutOfSync);
      }
    }
  }

}
// CONCATENATED MODULE: ./lib/services/sync/account/downloader.ts


class downloader_AccountDownloader {
  constructor(apiService, protocolService, contentType, customEvent, limit) {
    this.apiService = apiService;
    this.protocolService = protocolService;
    this.contentType = contentType;
    this.customEvent = customEvent;
    this.limit = limit;
    this.progress = {
      retrievedPayloads: []
    };
  }
  /**
   * Executes a sync request with a blank sync token and high download limit. It will download all items,
   * but won't do anything with them other than decrypting and creating respective objects.
   */


  async run() {
    const response = await this.apiService.sync([], this.progress.lastSyncToken, this.progress.paginationToken, this.limit || 500, false, this.contentType, this.customEvent);
    const encryptedPayloads = response.retrieved_items.map(rawPayload => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawPayload, sources["a" /* PayloadSource */].RemoteRetrieved);
    });
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingPayloads(encryptedPayloads);
    this.progress.retrievedPayloads = this.progress.retrievedPayloads.concat(decryptedPayloads);
    this.progress.lastSyncToken = response.sync_token;
    this.progress.paginationToken = response.cursor_token;

    if (response.cursor_token) {
      return this.run();
    } else {
      return this.progress.retrievedPayloads;
    }
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/remote_conflicts.ts






class remote_conflicts_DeltaRemoteConflicts extends PayloadsDelta {
  async resultingCollection() {
    if (this.applyCollection.source === sources["a" /* PayloadSource */].ConflictUuid) {
      return this.collectionsByHandlingUuidConflicts();
    } else if (this.applyCollection.source === sources["a" /* PayloadSource */].ConflictData) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw "Unhandled conflict type ".concat(this.applyCollection.source);
    }
  }

  async collectionsByHandlingDataConflicts() {
    const results = [];

    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid);
      /** Could be deleted */

      if (!current) {
        results.push(payload);
        continue;
      }

      const decrypted = this.findRelatedPayload(payload.uuid, sources["a" /* PayloadSource */].DecryptedTransient);

      if (!decrypted && !payload.deleted) {
        /** Decrypted should only be missing in case of deleted payload */
        throw 'Unable to find decrypted counterpart for data conflict.';
      }

      const delta = new conflict_ConflictDelta(this.baseCollection, current, decrypted || payload, sources["a" /* PayloadSource */].ConflictData);
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.all();
      Object(utils["j" /* extendArray */])(results, payloads);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(results, sources["a" /* PayloadSource */].RemoteRetrieved);
  }
  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */


  async collectionsByHandlingUuidConflicts() {
    const results = [];

    for (const payload of this.applyCollection.all()) {
      const decrypted = this.findRelatedPayload(payload.uuid, sources["a" /* PayloadSource */].DecryptedTransient);
      const alternateResults = await PayloadsByAlternatingUuid(decrypted, this.baseCollection);
      Object(utils["j" /* extendArray */])(results, alternateResults);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(results, sources["a" /* PayloadSource */].RemoteRetrieved);
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/remote_saved.ts




class remote_saved_DeltaRemoteSaved extends PayloadsDelta {
  async resultingCollection() {
    const processed = [];

    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid);
      /** If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old deleted value that was sent to server. */

      const deletedState = current ? current.deleted : payload.deleted;
      const result = Object(generator["f" /* CreateSourcedPayloadFromObject */])(payload, sources["a" /* PayloadSource */].RemoteSaved, {
        lastSyncEnd: new Date(),
        deleted: deletedState
      });
      processed.push(result);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(processed, sources["a" /* PayloadSource */].RemoteSaved);
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/remote_retrieved.ts





class remote_retrieved_DeltaRemoteRetrieved extends PayloadsDelta {
  async resultingCollection() {
    const filtered = [];
    const conflicted = [];
    /**
    * If we have retrieved an item that was saved as part of this ongoing sync operation,
    * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
    */

    for (const received of this.applyCollection.all()) {
      const savedOrSaving = this.findRelatedPayload(received.uuid, sources["a" /* PayloadSource */].SavedOrSaving);
      const decrypted = this.findRelatedPayload(received.uuid, sources["a" /* PayloadSource */].DecryptedTransient);

      if (!decrypted) {
        /** Decrypted should only be missing in case of deleted retrieved item */
        if (!received.deleted) {
          throw 'Cannot find decrypted for non-deleted payload.';
        }

        filtered.push(received);
        continue;
      }

      if (savedOrSaving) {
        conflicted.push(decrypted);
        continue;
      }

      const base = this.findBasePayload(received.uuid);

      if (base && base.dirty) {
        conflicted.push(decrypted);
        continue;
      }

      filtered.push(decrypted);
    }
    /**
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */


    const conflictResults = [];

    for (const conflict of conflicted) {
      const decrypted = this.findRelatedPayload(conflict.uuid, sources["a" /* PayloadSource */].DecryptedTransient);

      if (!decrypted) {
        continue;
      }

      const current = this.findBasePayload(conflict.uuid);

      if (!current) {
        continue;
      }

      const delta = new conflict_ConflictDelta(this.baseCollection, current, decrypted, sources["a" /* PayloadSource */].ConflictData);
      const deltaCollection = await delta.resultingCollection();
      const payloads = deltaCollection.all();
      Object(utils["j" /* extendArray */])(conflictResults, payloads);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(filtered.concat(conflictResults), sources["a" /* PayloadSource */].RemoteRetrieved);
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/generator.ts




function DeltaClassForSource(source) {
  if (source === sources["a" /* PayloadSource */].RemoteRetrieved) {
    return remote_retrieved_DeltaRemoteRetrieved;
  } else if (source === sources["a" /* PayloadSource */].RemoteSaved) {
    return remote_saved_DeltaRemoteSaved;
  } else if (source === sources["a" /* PayloadSource */].ConflictData || source === sources["a" /* PayloadSource */].ConflictUuid) {
    return remote_conflicts_DeltaRemoteConflicts;
  }
}
// CONCATENATED MODULE: ./lib/protocol/collection/collection_set.ts
class ImmutablePayloadCollectionSet {
  /**
   * @param collections An array of ImmutablePayloadCollection objects.
   */
  constructor(collections) {
    this.collections = collections;
    Object.freeze(this);
  }

  collectionForSource(source) {
    return this.collections.find(collection => {
      return collection.source === source;
    });
  }

}
// CONCATENATED MODULE: ./lib/services/sync/account/response_resolver.ts





/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */

class response_resolver_SyncResponseResolver {
  constructor(response, decryptedResponsePayloads, baseCollection, payloadsSavedOrSaving) {
    this.response = response;
    this.baseCollection = baseCollection;
    this.relatedCollectionSet = new ImmutablePayloadCollectionSet([payload_collection_ImmutablePayloadCollection.WithPayloads(decryptedResponsePayloads, sources["a" /* PayloadSource */].DecryptedTransient), payload_collection_ImmutablePayloadCollection.WithPayloads(payloadsSavedOrSaving, sources["a" /* PayloadSource */].SavedOrSaving)]);
  }

  async collectionsByProcessingResponse() {
    const collections = [];
    const collectionRetrieved = await this.collectionByProcessingPayloads(this.response.retrievedPayloads, sources["a" /* PayloadSource */].RemoteRetrieved);

    if (collectionRetrieved.all().length > 0) {
      collections.push(collectionRetrieved);
    }

    const collectionSaved = await this.collectionByProcessingPayloads(this.response.savedPayloads, sources["a" /* PayloadSource */].RemoteSaved);

    if (collectionSaved.all().length > 0) {
      collections.push(collectionSaved);
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.collectionByProcessingPayloads(this.response.uuidConflictPayloads, sources["a" /* PayloadSource */].ConflictUuid);

      if (collectionUuidConflicts.all().length > 0) {
        collections.push(collectionUuidConflicts);
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.collectionByProcessingPayloads(this.response.dataConflictPayloads, sources["a" /* PayloadSource */].ConflictData);

      if (collectionDataConflicts.all().length > 0) {
        collections.push(collectionDataConflicts);
      }
    }

    return collections;
  }

  async collectionByProcessingPayloads(payloads, source) {
    const collection = payload_collection_ImmutablePayloadCollection.WithPayloads(payloads, source);
    const deltaClass = DeltaClassForSource(source); // eslint-disable-next-line new-cap

    const delta = new deltaClass(this.baseCollection, collection, this.relatedCollectionSet);
    const resultCollection = await delta.resultingCollection();
    const updatedDirtyPayloads = resultCollection.all().map(payload => {
      const stillDirty = this.finalDirtyStateForPayload(payload);
      return Object(generator["b" /* CopyPayload */])(payload, {
        dirty: stillDirty,
        dirtiedDate: stillDirty ? new Date() : undefined
      });
    });
    return payload_collection_ImmutablePayloadCollection.WithPayloads(updatedDirtyPayloads, source);
  }

  finalDirtyStateForPayload(payload) {
    const current = this.baseCollection.find(payload.uuid);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */

    let stillDirty;

    if (current) {
      if (payload.dirtiedDate && payload.dirtiedDate > current.dirtiedDate) {
        /** The payload was dirtied as part of handling deltas, and not because it was
         * dirtied by a client. We keep the payload dirty state here. */
        stillDirty = payload.dirty;
      } else {
        /** Marking items dirty after lastSyncBegan will cause them to sync again. */
        stillDirty = current.dirtiedDate > current.lastSyncBegan;
      }
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty;
    }

    return stillDirty;
  }

}
// CONCATENATED MODULE: ./lib/services/sync/response.ts




var ConflictType;

(function (ConflictType) {
  ConflictType["ConflictingData"] = "sync_conflict";
  ConflictType["UuidConflict"] = "uuid_conflict";
})(ConflictType || (ConflictType = {}));

class response_SyncResponse {
  constructor(rawResponse) {
    this.rawResponse = rawResponse;
    this.savedPayloads = this.filterRawItemArray(rawResponse.saved_items).map(rawItem => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawItem, sources["a" /* PayloadSource */].RemoteSaved);
    });
    this.retrievedPayloads = this.filterRawItemArray(rawResponse.retrieved_items).map(rawItem => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawItem, sources["a" /* PayloadSource */].RemoteRetrieved);
    });
    this.dataConflictPayloads = this.filterRawItemArray(this.rawDataConflictItems).map(rawItem => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawItem, sources["a" /* PayloadSource */].ConflictData);
    });
    this.uuidConflictPayloads = this.filterRawItemArray(this.rawUuidConflictItems).map(rawItem => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(rawItem, sources["a" /* PayloadSource */].ConflictUuid);
    });
    /**
     * Items may be deleted from a combination of sources, such as from RemoteSaved,
     * or if a conflict handler decides to delete a payload.
     */

    this.deletedPayloads = this.allProcessedPayloads.filter(payload => {
      return payload.discardable;
    });
    Object(utils["g" /* deepFreeze */])(this);
  }
  /**
   * Filter out and exclude any items that do not have a uuid. These are useless to us.
   */


  filterRawItemArray() {
    let rawItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return rawItems.filter(rawItem => {
      if (!rawItem.uuid) {
        return false;
      } else {
        return true;
      }
    });
  }

  get error() {
    return this.rawResponse.error;
  }
  /**
   * Returns the HTTP status code for invalid requests
   */


  get status() {
    return this.rawResponse.status;
  }

  get lastSyncToken() {
    return this.rawResponse[ApiEndpointParam.LastSyncToken];
  }

  get paginationToken() {
    return this.rawResponse[ApiEndpointParam.PaginationToken];
  }

  get integrityHash() {
    return this.rawResponse[ApiEndpointParam.IntegrityResult];
  }

  get checkIntegrity() {
    return this.integrityHash && !this.paginationToken;
  }

  get numberOfItemsInvolved() {
    return this.allProcessedPayloads.length;
  }

  get allProcessedPayloads() {
    const allPayloads = this.savedPayloads.concat(this.retrievedPayloads).concat(this.dataConflictPayloads).concat(this.uuidConflictPayloads);
    return allPayloads;
  }

  get rawUuidConflictItems() {
    return this.rawConflictObjects.filter(conflict => {
      return conflict.type === ConflictType.UuidConflict;
    }).map(conflict => {
      return conflict.unsaved_item || conflict.item;
    });
  }

  get rawDataConflictItems() {
    return this.rawConflictObjects.filter(conflict => {
      return conflict.type === ConflictType.ConflictingData;
    }).map(conflict => {
      return conflict.server_item || conflict.item;
    });
  }

  get rawConflictObjects() {
    const conflicts = this.rawResponse.conflicts || [];
    const legacyConflicts = this.rawResponse.unsaved || [];
    return conflicts.concat(legacyConflicts);
  }

  get hasError() {
    return !Object(utils["p" /* isNullOrUndefined */])(this.rawResponse.error);
  }

}
// CONCATENATED MODULE: ./lib/services/sync/signals.ts
var SyncSignal;

(function (SyncSignal) {
  SyncSignal[SyncSignal["Response"] = 1] = "Response";
  SyncSignal[SyncSignal["StatusChanged"] = 2] = "StatusChanged";
})(SyncSignal || (SyncSignal = {}));
// CONCATENATED MODULE: ./lib/services/sync/account/operation.ts



const DEFAULT_UP_DOWN_LIMIT = 150;
/**
 * A long running operation that handles multiple roundtrips from a server,
 * emitting a stream of values that should be acted upon in real time.
 */

class operation_AccountSyncOperation {
  /**
   * @param payloads   An array of payloads to send to the server
   * @param receiver   A function that receives callback multiple times during the operation
   */
  constructor(payloads, receiver, lastSyncToken, paginationToken, checkIntegrity, apiService) {
    this.responses = [];
    this.payloads = payloads;
    this.lastSyncToken = lastSyncToken;
    this.paginationToken = paginationToken;
    this.checkIntegrity = checkIntegrity;
    this.apiService = apiService;
    this.receiver = receiver;
    this.pendingPayloads = payloads.slice();
  }
  /**
   * Read the payloads that have been saved, or are currently in flight.
   */


  get payloadsSavedOrSaving() {
    return Object(utils["c" /* arrayByDifference */])(this.payloads, this.pendingPayloads);
  }

  popPayloads(count) {
    const payloads = this.pendingPayloads.slice(0, count);
    Object(utils["G" /* subtractFromArray */])(this.pendingPayloads, payloads);
    return payloads;
  }

  async run() {
    await this.receiver(SyncSignal.StatusChanged, undefined, {
      completedUploadCount: this.totalUploadCount - this.pendingUploadCount,
      totalUploadCount: this.totalUploadCount
    });
    const payloads = this.popPayloads(this.upLimit);
    const rawResponse = await this.apiService.sync(payloads, this.lastSyncToken, this.paginationToken, this.downLimit, this.checkIntegrity, undefined, undefined);
    const response = new response_SyncResponse(rawResponse);
    this.responses.push(response);
    this.lastSyncToken = response.lastSyncToken;
    this.paginationToken = response.paginationToken;
    await this.receiver(SyncSignal.Response, response);

    if (!this.done) {
      return this.run();
    }
  }

  get done() {
    return this.pendingPayloads.length === 0 && !this.paginationToken;
  }

  get pendingUploadCount() {
    return this.pendingPayloads.length;
  }

  get totalUploadCount() {
    return this.payloads.length;
  }

  get upLimit() {
    return DEFAULT_UP_DOWN_LIMIT;
  }

  get downLimit() {
    return DEFAULT_UP_DOWN_LIMIT;
  }

  get numberOfItemsInvolved() {
    let total = 0;

    for (const response of this.responses) {
      total += response.numberOfItemsInvolved;
    }

    return total;
  }

}
// CONCATENATED MODULE: ./lib/services/sync/offline/operation.ts





class operation_OfflineSyncOperation {
  /**
   * @param payloads  An array of payloads to sync offline
   * @param receiver  A function that receives callback multiple times during the operation
   */
  constructor(payloads, receiver) {
    this.payloads = payloads;
    this.receiver = receiver;
  }

  async run() {
    const responsePayloads = this.payloads.map(payload => {
      return Object(generator["f" /* CreateSourcedPayloadFromObject */])(payload, sources["a" /* PayloadSource */].LocalSaved, {
        dirty: false,
        lastSyncEnd: new Date()
      });
    });
    /* Since we are simulating a server response, they should be pure JS objects */

    const savedItems = Object(utils["a" /* Copy */])(responsePayloads);
    const response = new response_SyncResponse({
      saved_items: savedItems
    });
    await this.receiver(SyncSignal.Response, response);
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/out_of_sync.ts





class out_of_sync_DeltaOutOfSync extends PayloadsDelta {
  async resultingCollection() {
    const results = [];

    for (const payload of this.applyCollection.all()) {
      /**
       * Map the server payload as authoritive content. If client copy differs,
       * we will create a duplicate of it below.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload);
      const current = this.findBasePayload(payload.uuid);

      if (!current) {
        continue;
      }

      const equal = PayloadContentsEqual(payload, current);

      if (equal) {
        continue;
      }
      /**
       * We create a copy of the local existing item and sync that up.
       * It will be a 'conflict' of itself
       */


      const copyResults = await PayloadsByDuplicating(current, this.baseCollection, true);
      Object(utils["j" /* extendArray */])(results, copyResults);
    }

    return payload_collection_ImmutablePayloadCollection.WithPayloads(results, sources["a" /* PayloadSource */].RemoteRetrieved);
  }

}
// CONCATENATED MODULE: ./lib/protocol/payloads/deltas/index.ts







// CONCATENATED MODULE: ./lib/services/sync/sync_service.ts
function sync_service_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function sync_service_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { sync_service_ownKeys(Object(source), true).forEach(function (key) { sync_service_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { sync_service_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function sync_service_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
























const DEFAULT_DATABASE_LOAD_BATCH_SIZE = 100;
const DEFAULT_MAX_DISCORDANCE = 5;
const DEFAULT_MAJOR_CHANGE_THRESHOLD = 15;
const INVALID_SESSION_RESPONSE_STATUS = 401;
var SyncQueueStrategy;

(function (SyncQueueStrategy) {
  /**
   * Promise will be resolved on the next sync request after the current one completes.
   * If there is no scheduled sync request, one will be scheduled.
   */
  SyncQueueStrategy[SyncQueueStrategy["ResolveOnNext"] = 1] = "ResolveOnNext";
  /**
   * A new sync request is guarenteed to be generated for your request, no matter how long it takes.
   * Promise will be resolved whenever this sync request is processed in the serial queue.
   */

  SyncQueueStrategy[SyncQueueStrategy["ForceSpawnNew"] = 2] = "ForceSpawnNew";
})(SyncQueueStrategy || (SyncQueueStrategy = {}));

var SyncModes;

(function (SyncModes) {
  /**
   * Performs a standard sync, uploading any dirty items and retrieving items.
   */
  SyncModes[SyncModes["Default"] = 1] = "Default";
  /**
   * The first sync for an account, where we first want to download all remote items first
   * before uploading any dirty items. This allows a consumer, for example, to download
   * all data to see if user has an items key, and if not, only then create a new one.
   */

  SyncModes[SyncModes["DownloadFirst"] = 2] = "DownloadFirst";
})(SyncModes || (SyncModes = {}));

;
var SyncSources;

(function (SyncSources) {
  SyncSources[SyncSources["External"] = 1] = "External";
  SyncSources[SyncSources["SpawnQueue"] = 2] = "SpawnQueue";
  SyncSources[SyncSources["ResolveQueue"] = 3] = "ResolveQueue";
  SyncSources[SyncSources["MoreDirtyItems"] = 4] = "MoreDirtyItems";
  SyncSources[SyncSources["AfterDownloadFirst"] = 5] = "AfterDownloadFirst";
  SyncSources[SyncSources["IntegrityCheck"] = 6] = "IntegrityCheck";
  SyncSources[SyncSources["ResolveOutOfSync"] = 7] = "ResolveOutOfSync";
})(SyncSources || (SyncSources = {}));

;
/**
 * The sync service orchestrates with the model manager, api service, and storage service
 * to ensure consistent state between the three. When a change is made to an item, consumers
 * call the sync service's sync function to first persist pending changes to local storage.
 * Then, the items are uploaded to the server. The sync service handles server responses,
 * including mapping any retrieved items to application state via model manager mapping.
 * After each sync request, any changes made or retrieved are also persisted locally.
 * The sync service largely does not perform any task unless it is called upon.
 */

class sync_service_SNSyncService extends pure_service["a" /* PureService */] {
  constructor(itemManager, sessionManager, protocolService, storageService, modelManager, apiService, interval) {
    super();
    this.resolveQueue = [];
    this.spawnQueue = [];
    /* A DownloadFirst sync must always be the first sync completed */

    this.completedOnlineDownloadFirstSync = false;
    this.majorChangeThreshold = DEFAULT_MAJOR_CHANGE_THRESHOLD;
    this.maxDiscordance = DEFAULT_MAX_DISCORDANCE;
    this.locked = false;
    this.databaseLoaded = false;
    /** Content types appearing first are always mapped first */

    this.localLoadPriorty = [content_types["a" /* ContentType */].ItemsKey, content_types["a" /* ContentType */].UserPrefs, content_types["a" /* ContentType */].Privileges, content_types["a" /* ContentType */].Component, content_types["a" /* ContentType */].Theme];
    /**
     * Non-encrypted types are items whose values a server must be able to read.
     * These include server extensions (such as a note history endpoint), and
     * multi-factor authentication items, which include a secret value that the server
     * needs to be able to read in order to enforce.
     */

    this.nonEncryptedTypes = [content_types["a" /* ContentType */].Mfa, content_types["a" /* ContentType */].ServerExtension];
    this.itemManager = itemManager;
    this.sessionManager = sessionManager;
    this.protocolService = protocolService;
    this.modelManager = modelManager;
    this.storageService = storageService;
    this.apiService = apiService;
    this.interval = interval;
    this.initializeStatus();
    this.initializeState();
  }
  /**
   * If the database has been newly created (because its new or was previously destroyed)
   * we want to reset any sync tokens we have.
   */


  async onNewDatabaseCreated() {
    if (await this.getLastSyncToken()) {
      await this.clearSyncPositionTokens();
    }
  }

  deinit() {
    this.sessionManager = undefined;
    this.itemManager = undefined;
    this.protocolService = undefined;
    this.modelManager = undefined;
    this.storageService = undefined;
    this.apiService = undefined;
    this.interval = undefined;
    this.state.reset();
    this.opStatus.reset();
    this.state = undefined;
    this.opStatus = undefined;
    this.resolveQueue.length = 0;
    this.spawnQueue.length = 0;
    super.deinit();
  }

  initializeStatus() {
    this.opStatus = new sync_op_status_SyncOpStatus(this.interval, event => {
      this.notifyEvent(event);
    });
  }

  initializeState() {
    this.state = new sync_state_SyncState(event => {
      if (event === sync_events["a" /* SyncEvent */].EnterOutOfSync) {
        this.notifyEvent(sync_events["a" /* SyncEvent */].EnterOutOfSync);
      } else if (event === sync_events["a" /* SyncEvent */].ExitOutOfSync) {
        this.notifyEvent(sync_events["a" /* SyncEvent */].ExitOutOfSync);
      }
    }, this.maxDiscordance);
  }

  lockSyncing() {
    this.locked = true;
  }

  unlockSyncing() {
    this.locked = false;
  }

  isOutOfSync() {
    return this.state.isOutOfSync();
  }

  getLastSyncDate() {
    return this.state.lastSyncDate;
  }

  getStatus() {
    return this.opStatus;
  }
  /**
   * Called by application when sign in or registration occurs.
   */


  resetSyncState() {
    this.state.reset();
  }

  isDatabaseLoaded() {
    return this.databaseLoaded;
  }
  /**
   * Used in tandem with `loadDatabasePayloads`
   */


  async getDatabasePayloads() {
    return this.storageService.getAllRawPayloads().catch(error => {
      this.notifyEvent(sync_events["a" /* SyncEvent */].DatabaseReadError, error);
      throw error;
    });
  }
  /**
   * @param rawPayloads - use `getDatabasePayloads` to get these payloads.
   * They are fed as a parameter so that callers don't have to await the loading, but can
   * await getting the raw payloads from storage
   */


  async loadDatabasePayloads(rawPayloads) {
    if (this.databaseLoaded) {
      throw 'Attempting to initialize already initialized local database.';
    }

    if (rawPayloads.length === 0) {
      this.databaseLoaded = true;
      this.opStatus.setDatabaseLoadStatus(0, 0, true);
      return;
    }

    const unsortedPayloads = rawPayloads.map(rawPayload => {
      return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(rawPayload);
    });
    const payloads = SortPayloadsByRecentAndContentPriority(unsortedPayloads, this.localLoadPriorty);
    /** Decrypt and map items keys first */

    const itemsKeysPayloads = payloads.filter(payload => {
      return payload.content_type === content_types["a" /* ContentType */].ItemsKey;
    });
    Object(utils["G" /* subtractFromArray */])(payloads, itemsKeysPayloads);
    const decryptedItemsKeys = await this.protocolService.payloadsByDecryptingPayloads(itemsKeysPayloads);
    await this.modelManager.emitPayloads(decryptedItemsKeys, sources["a" /* PayloadSource */].LocalRetrieved);
    /** Map in batches to give interface a chance to update */

    const payloadCount = payloads.length;
    const batchSize = DEFAULT_DATABASE_LOAD_BATCH_SIZE;
    const numBatches = Math.ceil(payloadCount / batchSize);

    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentPosition = batchIndex * batchSize;
      const batch = payloads.slice(currentPosition, currentPosition + batchSize);
      const decrypted = await this.protocolService.payloadsByDecryptingPayloads(batch);
      await this.modelManager.emitPayloads(decrypted, sources["a" /* PayloadSource */].LocalRetrieved);
      this.notifyEvent(sync_events["a" /* SyncEvent */].LocalDataIncrementalLoad);
      this.opStatus.setDatabaseLoadStatus(currentPosition, payloadCount, false);
    }

    this.databaseLoaded = true;
    this.opStatus.setDatabaseLoadStatus(0, 0, true);
  }

  async setLastSyncToken(token) {
    this.syncToken = token;
    return this.storageService.setValue(StorageKey.LastSyncToken, token);
  }

  async setPaginationToken(token) {
    this.cursorToken = token;

    if (token) {
      return this.storageService.setValue(StorageKey.PaginationToken, token);
    } else {
      return this.storageService.removeValue(StorageKey.PaginationToken);
    }
  }

  async getLastSyncToken() {
    if (!this.syncToken) {
      this.syncToken = await this.storageService.getValue(StorageKey.LastSyncToken);
    }

    return this.syncToken;
  }

  async getPaginationToken() {
    if (!this.cursorToken) {
      this.cursorToken = await this.storageService.getValue(StorageKey.PaginationToken);
    }

    return this.cursorToken;
  }

  async clearSyncPositionTokens() {
    this.syncToken = undefined;
    this.cursorToken = undefined;
    await this.storageService.removeValue(StorageKey.LastSyncToken);
    await this.storageService.removeValue(StorageKey.PaginationToken);
  }

  async itemsNeedingSync() {
    const items = this.itemManager.getDirtyItems();
    return items;
  }

  async alternateUuidForItem(uuid) {
    const item = this.itemManager.findItem(uuid);
    const payload = Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(item);
    const results = await PayloadsByAlternatingUuid(payload, this.modelManager.getMasterCollection());
    await this.modelManager.emitPayloads(results, sources["a" /* PayloadSource */].LocalChanged);
    await this.persistPayloads(results);
    return this.itemManager.findItem(results[0].uuid);
  }
  /**
   * Mark all items as dirty and needing sync, then persist to storage.
   * @param alternateUuids
   * In the case of signing in and merging local data, we alternate UUIDs
   * to avoid overwriting data a user may retrieve that has the same UUID.
   * Alternating here forces us to to create duplicates of the items instead.
   */


  async markAllItemsAsNeedingSync(alternateUuids) {
    this.log('Marking all items as needing sync');

    if (alternateUuids) {
      /** Make a copy of the array, as alternating uuid will affect array */
      const items = this.itemManager.items.filter(item => {
        return !item.errorDecrypting;
      }).slice();

      for (const item of items) {
        await this.alternateUuidForItem(item.uuid);
      }
    }

    const items = this.itemManager.items;
    const payloads = items.map(item => {
      return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(item, {
        dirty: true,
        dirtiedDate: new Date()
      });
    });
    await this.modelManager.emitPayloads(payloads, sources["a" /* PayloadSource */].LocalChanged);
    await this.persistPayloads(payloads);
  }
  /**
   * Return the payloads that need local persistence, before beginning a sync.
   * This way, if the application is closed before a sync request completes,
   * pending data will be saved to disk, and synced the next time the app opens.
   */


  async popPayloadsNeedingPreSyncSave(from) {
    const lastPreSyncSave = this.state.lastPreSyncSave;

    if (!lastPreSyncSave) {
      return from;
    }
    /** dirtiedDate can be null if the payload was created as dirty */


    const payloads = from.filter(candidate => {
      return !candidate.dirtiedDate || candidate.dirtiedDate > lastPreSyncSave;
    });
    this.state.lastPreSyncSave = new Date();
    return payloads;
  }

  queueStrategyResolveOnNext() {
    return new Promise((resolve, reject) => {
      this.resolveQueue.push({
        resolve,
        reject
      });
    });
  }

  queueStrategyForceSpawnNew(options) {
    return new Promise((resolve, reject) => {
      this.spawnQueue.push({
        resolve,
        reject,
        options
      });
    });
  }
  /**
   * For timing strategy SyncQueueStrategy.ForceSpawnNew, we will execute a whole sync request
   * and pop it from the queue.
   */


  popSpawnQueue() {
    if (this.spawnQueue.length === 0) {
      return null;
    }

    const promise = this.spawnQueue[0];
    Object(utils["C" /* removeFromIndex */])(this.spawnQueue, 0);
    this.log('Syncing again from spawn queue');
    return this.sync(sync_service_objectSpread({
      queueStrategy: SyncQueueStrategy.ForceSpawnNew,
      source: SyncSources.SpawnQueue
    }, promise.options)).then(() => {
      promise.resolve();
    }).catch(() => {
      promise.reject();
    });
  }
  /**
   * Certain content types should not be encrypted when sending to server,
   * such as server extensions
   */


  async payloadsByPreparingForServer(payloads) {
    return this.protocolService.payloadsByEncryptingPayloads(payloads, payload => {
      return this.nonEncryptedTypes.includes(payload.content_type) ? intents["a" /* EncryptionIntent */].SyncDecrypted : intents["a" /* EncryptionIntent */].Sync;
    });
  }

  async downloadFirstSync(waitTimeOnFailureMs, otherSyncOptions) {
    const maxTries = 5;

    for (let i = 0; i < maxTries; i++) {
      await this.sync(sync_service_objectSpread({
        mode: SyncModes.DownloadFirst,
        queueStrategy: SyncQueueStrategy.ForceSpawnNew
      }, otherSyncOptions)).catch(console.error);

      if (this.completedOnlineDownloadFirstSync) {
        return;
      } else {
        await Object(utils["E" /* sleep */])(waitTimeOnFailureMs);
      }
    }

    console.error("Failed downloadFirstSync after ".concat(maxTries, " tries"));
  }

  async sync() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /** Hard locking, does not apply to locking modes below */
    if (this.locked) {
      this.log('Sync Locked');
      return;
    }
    /**
     * Allows us to lock this function from triggering duplicate network requests.
     * There are two types of locking checks:
     * 1. syncLocked(): If a call to sync() call has begun preparing to be sent to the server.
     *                  but not yet completed all the code below before reaching that point.
     *                  (before reaching opStatus.setDidBegin).
     * 2. syncOpInProgress: If a sync() call is in flight to the server.
     */


    const syncLocked = () => {
      return this.syncLock;
    };

    const captureLock = () => {
      this.syncLock = true;
    };

    const releaseLock = () => {
      this.syncLock = false;
    };

    const syncInProgress = this.opStatus.syncInProgress;
    const databaseLoaded = this.databaseLoaded;
    const canExecuteSync = !syncLocked();

    if (canExecuteSync && databaseLoaded && !syncInProgress) {
      captureLock();
    }

    if (!options.source) {
      options.source = SyncSources.External;
    }

    const items = await this.itemsNeedingSync();
    /** Items that have never been synced and marked as deleted should not be
     * uploaded to server, and instead deleted directly after sync completion. */

    const neverSyncedDeleted = items.filter(item => {
      return item.neverSynced && item.deleted;
    });
    Object(utils["G" /* subtractFromArray */])(items, neverSyncedDeleted);
    const decryptedPayloads = items.map(item => {
      return item.payloadRepresentation();
    });
    const payloadsNeedingSave = await this.popPayloadsNeedingPreSyncSave(decryptedPayloads);
    await this.persistPayloads(payloadsNeedingSave);
    /** The in time resolve queue refers to any sync requests that were made while we still
     * have not sent out the current request. So, anything in the in time resolve queue
     * will have made it in time to piggyback on the current request. Anything that comes
     * _after_ in-time will schedule a new sync request. */

    const inTimeResolveQueue = this.resolveQueue.slice();
    const useStrategy = !Object(utils["p" /* isNullOrUndefined */])(options.queueStrategy) ? options.queueStrategy : SyncQueueStrategy.ResolveOnNext;

    if (syncInProgress || !databaseLoaded || !canExecuteSync) {
      this.log(!canExecuteSync ? 'Another function call has begun preparing for sync.' : syncInProgress ? 'Attempting to sync while existing sync in progress.' : 'Attempting to sync before local database has loaded.');

      if (useStrategy === SyncQueueStrategy.ResolveOnNext) {
        return this.queueStrategyResolveOnNext();
      } else if (useStrategy === SyncQueueStrategy.ForceSpawnNew) {
        return this.queueStrategyForceSpawnNew({
          mode: options.mode,
          checkIntegrity: options.checkIntegrity,
          source: options.source
        });
      } else {
        throw "Unhandled timing strategy ".concat(useStrategy);
      }
    }
    /** Lock syncing immediately after checking in progress above */


    this.opStatus.setDidBegin();
    this.notifyEvent(sync_events["a" /* SyncEvent */].SyncWillBegin);
    /* Subtract from array as soon as we're sure they'll be called.
    resolves are triggered at the end of this function call */

    Object(utils["G" /* subtractFromArray */])(this.resolveQueue, inTimeResolveQueue);
    /** lastSyncBegan must be set *after* any point we may have returned above.
     * Setting this value means the item was 100% sent to the server. */

    const beginDate = new Date();

    if (items.length > 0) {
      await this.itemManager.changeItems(Object(functions["b" /* Uuids */])(items), mutator => {
        mutator.lastSyncBegan = beginDate;
      }, core_item["c" /* MutationType */].NonDirtying, sources["a" /* PayloadSource */].PreSyncSave);
    }

    const online = this.sessionManager.online();

    const useMode = (tryMode => {
      if (online && !this.completedOnlineDownloadFirstSync) {
        return SyncModes.DownloadFirst;
      } else if (!Object(utils["p" /* isNullOrUndefined */])(tryMode)) {
        return tryMode;
      } else {
        return SyncModes.Default;
      }
    })(options.mode);

    let uploadPayloads = [];

    if (useMode === SyncModes.Default) {
      if (online && !this.completedOnlineDownloadFirstSync) {
        throw Error('Attempting to default mode sync without having completed initial.');
      }

      if (online) {
        uploadPayloads = await this.payloadsByPreparingForServer(decryptedPayloads);
      } else {
        uploadPayloads = decryptedPayloads;
      }
    } else if (useMode === SyncModes.DownloadFirst) {
      uploadPayloads = [];
    }

    let operation;

    if (online) {
      operation = await this.syncOnlineOperation(uploadPayloads, options.checkIntegrity, options.source, useMode);
    } else {
      operation = await this.syncOfflineOperation(uploadPayloads, options.source, useMode);
    }

    await operation.run();
    this.opStatus.setDidEnd();
    releaseLock();

    if (this.opStatus.hasError()) {
      return;
    }

    this.opStatus.reset();
    this.state.lastSyncDate = new Date();

    if (operation instanceof operation_AccountSyncOperation && operation.numberOfItemsInvolved >= this.majorChangeThreshold) {
      this.notifyEvent(sync_events["a" /* SyncEvent */].MajorDataChange);
    }

    if (neverSyncedDeleted.length > 0) {
      await this.handleNeverSyncedDeleted(neverSyncedDeleted);
    }

    if (useMode !== SyncModes.DownloadFirst) {
      await this.notifyEvent(sync_events["a" /* SyncEvent */].FullSyncCompleted, {
        source: options.source
      });
    }

    if (useMode === SyncModes.DownloadFirst) {
      if (online) {
        this.completedOnlineDownloadFirstSync = true;
      }

      await this.notifyEvent(sync_events["a" /* SyncEvent */].DownloadFirstSyncCompleted);
      /** Perform regular sync now that we've finished download first sync */

      await this.sync({
        source: SyncSources.AfterDownloadFirst,
        checkIntegrity: true,
        awaitAll: options.awaitAll
      });
    } else if (!this.popSpawnQueue() && this.resolveQueue.length > 0) {
      this.log('Syncing again from resolve queue');
      /** No need to await. */

      const promise = this.sync({
        source: SyncSources.ResolveQueue,
        checkIntegrity: options.checkIntegrity
      });

      if (options.awaitAll) {
        await promise;
      }
    } else if ((await this.itemsNeedingSync()).length > 0) {
      /**
       * As part of the just concluded sync operation, more items may have
       * been dirtied (like conflicts), and the caller may want to await the
       * full resolution of these items.
       */
      await this.sync({
        source: SyncSources.MoreDirtyItems,
        checkIntegrity: options.checkIntegrity,
        awaitAll: options.awaitAll
      });
    } else if (operation instanceof operation_AccountSyncOperation && operation.checkIntegrity) {
      if (this.state.needsSync && operation.done) {
        this.log('Syncing again from integrity check');
        const promise = this.sync({
          checkIntegrity: true,
          queueStrategy: SyncQueueStrategy.ForceSpawnNew,
          source: SyncSources.IntegrityCheck,
          awaitAll: options.awaitAll
        });

        if (options.awaitAll) {
          await promise;
        }
      }
    } else {
      this.state.clearIntegrityHashes();
    }
    /**
     * For timing strategy SyncQueueStrategy.ResolveOnNext.
     * Execute any callbacks pulled before this sync request began.
     * Calling resolve on the callbacks should be the last thing we do in this function,
     * to simulate calling .sync as if it went through straight to the end without having
     * to be queued.
     */


    for (const callback of inTimeResolveQueue) {
      callback.resolve();
    }
  }

  async syncOnlineOperation(payloads, checkIntegrity, source, mode) {
    this.log('Syncing online user', 'source:', source, "integrity check", checkIntegrity, 'mode:', mode, 'payloads:', payloads);
    const operation = new operation_AccountSyncOperation(payloads, async (type, response, stats) => {
      switch (type) {
        case SyncSignal.Response:
          if (response.hasError) {
            await this.handleErrorServerResponse(response);
          } else {
            await this.handleSuccessServerResponse(operation, response);
          }

          break;

        case SyncSignal.StatusChanged:
          this.opStatus.setUploadStatus(stats.completedUploadCount, stats.totalUploadCount);
          break;
      }
    }, await this.getLastSyncToken(), await this.getPaginationToken(), checkIntegrity, this.apiService);
    return operation;
  }

  async syncOfflineOperation(payloads, source, mode) {
    this.log('Syncing offline user', 'source:', source, 'mode:', mode, 'payloads:', payloads);
    const operation = new operation_OfflineSyncOperation(payloads, async (type, response) => {
      if (type === SyncSignal.Response) {
        await this.handleOfflineResponse(response);
      }
    });
    return operation;
  }

  async handleOfflineResponse(response) {
    this.log('Offline Sync Response', response.rawResponse);
    const payloadsToEmit = response.savedPayloads;

    if (payloadsToEmit.length > 0) {
      await this.modelManager.emitPayloads(payloadsToEmit, sources["a" /* PayloadSource */].LocalSaved);
      const payloadsToPersist = this.modelManager.find(Object(functions["b" /* Uuids */])(payloadsToEmit));
      await this.persistPayloads(payloadsToPersist);
    }

    const deletedPayloads = response.deletedPayloads;

    if (deletedPayloads.length > 0) {
      await this.deletePayloads(deletedPayloads);
    }

    this.opStatus.clearError();
    this.opStatus.setDownloadStatus(response.retrievedPayloads.length);
    await this.notifyEvent(sync_events["a" /* SyncEvent */].SingleSyncCompleted, response);
  }

  async handleErrorServerResponse(response) {
    this.log('Sync Error', response);

    if (response.status === INVALID_SESSION_RESPONSE_STATUS) {
      this.notifyEvent(sync_events["a" /* SyncEvent */].InvalidSession);
    }

    this.opStatus.setError(response.error);
    this.notifyEvent(sync_events["a" /* SyncEvent */].SyncError, response.error);
  }

  async handleSuccessServerResponse(operation, response) {
    if (this._simulate_latency) {
      await Object(utils["E" /* sleep */])(this._simulate_latency.latency);
    }

    this.log('Online Sync Response', response.rawResponse);
    this.setLastSyncToken(response.lastSyncToken);
    this.setPaginationToken(response.paginationToken);
    this.opStatus.clearError();
    this.opStatus.setDownloadStatus(response.retrievedPayloads.length);
    const decryptedPayloads = [];

    for (const payload of response.allProcessedPayloads) {
      if (payload.deleted || !payload.fields.includes(fields["a" /* PayloadField */].Content)) {
        /* Deleted payloads, and some payload types
          do not contiain content (like remote saved) */
        continue;
      }

      const decrypted = await this.protocolService.payloadByDecryptingPayload(payload);
      decryptedPayloads.push(decrypted);
    }

    const masterCollection = this.modelManager.getMasterCollection();
    const resolver = new response_resolver_SyncResponseResolver(response, decryptedPayloads, masterCollection, operation.payloadsSavedOrSaving);
    const collections = await resolver.collectionsByProcessingResponse();

    for (const collection of collections) {
      const payloadsToPersist = await this.modelManager.emitCollection(collection);
      await this.persistPayloads(payloadsToPersist);
    }

    const deletedPayloads = response.deletedPayloads;

    if (deletedPayloads.length > 0) {
      await this.deletePayloads(deletedPayloads);
    }

    await this.notifyEvent(sync_events["a" /* SyncEvent */].SingleSyncCompleted, response);

    if (response.checkIntegrity) {
      const clientHash = await this.computeDataIntegrityHash();
      await this.state.setIntegrityHashes(clientHash, response.integrityHash);
    }
  }
  /**
   * Items that have never been synced and marked as deleted should be cleared
   * as dirty, mapped, then removed from storage.
   */


  async handleNeverSyncedDeleted(items) {
    const payloads = items.map(item => {
      return item.payloadRepresentation({
        dirty: false
      });
    });
    await this.modelManager.emitPayloads(payloads, sources["a" /* PayloadSource */].LocalChanged);
    await this.persistPayloads(payloads);
  }
  /**
   * @param payloads The decrypted payloads to persist
   */


  async persistPayloads(payloads) {
    if (payloads.length === 0) {
      return;
    }

    return this.storageService.savePayloads(payloads).catch(error => {
      this.notifyEvent(sync_events["a" /* SyncEvent */].DatabaseWriteError, error);
      throw error;
    });
  }

  async deletePayloads(payloads) {
    return this.persistPayloads(payloads);
  }
  /**
   * Computes a hash of all items updated_at strings joined with a comma.
   * The server will also do the same, to determine whether the client values match server values.
   * @returns A SHA256 digest string (hex).
   */


  async computeDataIntegrityHash() {
    try {
      const items = this.itemManager.nonDeletedItems.sort((a, b) => {
        return b.updated_at.getTime() - a.updated_at.getTime();
      });
      const dates = items.map(item => item.updatedAtTimestamp());
      const string = dates.join(',');
      return this.protocolService.crypto.sha256(string);
    } catch (e) {
      console.error('Error computing data integrity hash', e);
      return undefined;
    }
  }
  /**
   * Downloads all items and maps to lcoal items to attempt resolve out-of-sync state
   */


  async resolveOutOfSync() {
    const downloader = new downloader_AccountDownloader(this.apiService, this.protocolService, undefined, 'resolve-out-of-sync');
    const payloads = await downloader.run();
    const delta = new out_of_sync_DeltaOutOfSync(this.modelManager.getMasterCollection(), payload_collection_ImmutablePayloadCollection.WithPayloads(payloads, sources["a" /* PayloadSource */].RemoteRetrieved));
    const collection = await delta.resultingCollection();
    await this.modelManager.emitCollection(collection);
    await this.persistPayloads(collection.payloads);
    return this.sync({
      checkIntegrity: true,
      source: SyncSources.ResolveOutOfSync
    });
  }

  async statelessDownloadAllItems(contentType, customEvent) {
    const downloader = new downloader_AccountDownloader(this.apiService, this.protocolService, contentType, customEvent);
    const payloads = await downloader.run();
    return payloads.map(payload => {
      return CreateItemFromPayload(payload);
    });
  }
  /** @unit_testing */
  // eslint-disable-next-line camelcase


  ut_setDatabaseLoaded(loaded) {
    this.databaseLoaded = loaded;
  }
  /** @unit_testing */
  // eslint-disable-next-line camelcase


  ut_clearLastSyncDate() {
    this.state.lastSyncDate = undefined;
  }
  /** @unit_testing */
  // eslint-disable-next-line camelcase


  ut_beginLatencySimulator(latency) {
    this._simulate_latency = {
      latency: latency || 1000,
      enabled: true
    };
  }
  /** @unit_testing */
  // eslint-disable-next-line camelcase


  ut_endLatencySimulator() {
    this._simulate_latency = null;
  }

}
// CONCATENATED MODULE: ./lib/services/challenge/challenge_operation.ts


/**
 * A challenge operation stores user-submitted values and callbacks.
 * When its values are updated, it will trigger the associated callbacks (valid/invalid/complete)
 */

class challenge_operation_ChallengeOperation {
  /**
   * @param resolve the promise resolve function to be called
   * when this challenge completes or cancels
   */
  constructor(challenge, resolve) {
    this.challenge = challenge;
    this.resolve = resolve;
    this.validValues = [];
    this.invalidValues = [];
    this.artifacts = {};
  }
  /**
   * Mark this challenge as complete, triggering the resolve function,
   * as well as notifying the client
   */


  complete(response) {
    var _this$resolve, _this$onComplete;

    if (!response) {
      response = new ChallengeResponse(this.challenge, this.validValues, this.artifacts);
    }

    (_this$resolve = this.resolve) === null || _this$resolve === void 0 ? void 0 : _this$resolve.call(this, response);
    (_this$onComplete = this.onComplete) === null || _this$onComplete === void 0 ? void 0 : _this$onComplete.call(this);
  }

  cancel() {
    var _this$resolve2, _this$onCancel;

    (_this$resolve2 = this.resolve) === null || _this$resolve2 === void 0 ? void 0 : _this$resolve2.call(this, null);
    (_this$onCancel = this.onCancel) === null || _this$onCancel === void 0 ? void 0 : _this$onCancel.call(this);
  }
  /**
   * @returns Returns true if the challenge has received all valid responses
   */


  isFinished() {
    return this.validValues.length === this.challenge.types.length;
  }
  /**
   * Sets the values validation status, as well as handles subsequent actions,
   * such as completing the operation if all valid values are supplied, as well as
   * notifying the client of this new value's validation status.
   */


  setValueStatus(value, valid, artifacts) {
    const valuesArray = valid ? this.validValues : this.invalidValues;
    const matching = valuesArray.find(v => v.type === value.type);

    if (matching) {
      Object(utils["B" /* removeFromArray */])(valuesArray, matching);
    }

    valuesArray.push(value);
    Object.assign(this.artifacts, artifacts);

    if (this.isFinished()) {
      this.complete();
    } else {
      if (valid) {
        var _this$onValidValue;

        (_this$onValidValue = this.onValidValue) === null || _this$onValidValue === void 0 ? void 0 : _this$onValidValue.call(this, value);
      } else {
        var _this$onInvalidValue;

        (_this$onInvalidValue = this.onInvalidValue) === null || _this$onInvalidValue === void 0 ? void 0 : _this$onInvalidValue.call(this, value);
      }
    }
  }

}
// CONCATENATED MODULE: ./lib/services/challenge/challenge_service.ts





/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */

class challenge_service_ChallengeService extends pure_service["a" /* PureService */] {
  constructor(storageService, protocolService) {
    super();
    this.challengeOperations = {};
    this.storageService = storageService;
    this.protocolService = protocolService;
  }
  /** @override */


  deinit() {
    this.storageService = undefined;
    this.protocolService = undefined;
    this.sendChallenge = undefined;
    super.deinit();
  }
  /**
   * Resolves when the challenge has been completed.
   */


  promptForChallengeResponse(challenge) {
    return new Promise(resolve => {
      this.createOrGetChallengeOperation(challenge, resolve);
    });
  }
  /**
   * Resolves when the user has submitted values which the caller can use
   * to run custom validations.
   */


  promptForChallengeResponseWithCustomValidation(challenge) {
    const operation = this.createOrGetChallengeOperation(challenge);
    return new Promise(resolve => {
      operation.customValidator = resolve;
    });
  }

  validateChallengeValue(value) {
    switch (value.type) {
      case ChallengeType.LocalPasscode:
        return this.protocolService.validatePasscode(value.value);

      case ChallengeType.AccountPassword:
        return this.protocolService.validateAccountPassword(value.value);

      case ChallengeType.Biometric:
        return Promise.resolve({
          valid: value.value === true
        });
    }
  }

  async getLaunchChallenge() {
    const types = [];
    const hasPasscode = this.protocolService.hasPasscode();

    if (hasPasscode) {
      types.push(ChallengeType.LocalPasscode);
    }

    const biometricEnabled = await this.hasBiometricsEnabled();

    if (biometricEnabled) {
      types.push(ChallengeType.Biometric);
    }

    if (types.length > 0) {
      return new Challenge(types, ChallengeReason.ApplicationUnlock);
    } else {
      return null;
    }
  }

  isPasscodeLocked() {
    return this.protocolService.rootKeyNeedsUnwrapping();
  }

  async hasBiometricsEnabled() {
    const biometricsState = await this.storageService.getValue(StorageKey.BiometricsState, StorageValueModes.Nonwrapped);
    return Boolean(biometricsState);
  }

  async enableBiometrics() {
    await this.storageService.setValue(StorageKey.BiometricsState, true, StorageValueModes.Nonwrapped);
  }

  async disableBiometrics() {
    await this.storageService.setValue(StorageKey.BiometricsState, false, StorageValueModes.Nonwrapped);
  }

  setChallengeCallbacks(challenge, onValidValue, onInvalidValue, onComplete, onCancel) {
    const operation = this.getChallengeOperation(challenge);
    operation.onValidValue = onValidValue;
    operation.onInvalidValue = onInvalidValue;
    operation.onComplete = onComplete;
    operation.onCancel = onCancel;
  }

  createOrGetChallengeOperation(challenge, resolve) {
    let operation = this.getChallengeOperation(challenge);

    if (!operation) {
      operation = new challenge_operation_ChallengeOperation(challenge, resolve);
      this.challengeOperations[challenge.id] = operation;
      this.sendChallenge(challenge);
    }

    operation.resolve = resolve;
    return operation;
  }

  getChallengeOperation(challenge) {
    return this.challengeOperations[challenge.id];
  }

  deleteChallengeOperation(operation) {
    delete this.challengeOperations[operation.challenge.id];
  }

  cancelChallenge(challenge) {
    const operation = this.challengeOperations[challenge.id];
    operation.cancel();
    this.deleteChallengeOperation(operation);
  }

  async submitValuesForChallenge(challenge, values) {
    if (values.length === 0) {
      throw Error("Attempting to submit 0 values for challenge");
    }

    const operation = this.getChallengeOperation(challenge);

    if (operation.customValidator) {
      operation.customValidator(values);
    } else {
      for (const value of values) {
        const {
          valid,
          artifacts
        } = await this.validateChallengeValue(value);
        this.setValidationStatusForChallenge(challenge, value, valid, artifacts);
      }
    }
  }

  setValidationStatusForChallenge(challenge, value, valid, artifacts) {
    const operation = this.getChallengeOperation(challenge);
    operation.setValueStatus(value, valid, artifacts);

    if (operation.isFinished()) {
      this.deleteChallengeOperation(operation);
    }
  }

}
// CONCATENATED MODULE: ./lib/services/index.ts

















// CONCATENATED MODULE: ./lib/application.ts
function application_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function application_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { application_ownKeys(Object(source), true).forEach(function (key) { application_defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { application_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function application_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


















/** How often to automatically sync, in milliseconds */

const DEFAULT_AUTO_SYNC_INTERVAL = 30000;
/** The main entrypoint of an application. */

class application_SNApplication {
  /**
   * @param environment The Environment that identifies your application.
   * @param platform The Platform that identifies your application.
   * @param deviceInterface The device interface that provides platform specific
   * utilities that are used to read/write raw values from/to the database or value storage.
   * @param crypto The platform-dependent implementation of SNPureCrypto to use.
   * Web uses SNWebCrypto, mobile uses SNReactNativeCrypto.
   * @param alertService The platform-dependent implementation of alert service.
   * @param identifier A unique identifier to namespace storage and other
   * persistent properties. This parameter is kept for backward compatibility and/or in case
   * you don't want SNNamespaceService to assign a dynamic namespace for you.
   * @param swapClasses Gives consumers the ability to provide their own custom
   * subclass for a service. swapClasses should be an array of key/value pairs
   * consisting of keys 'swap' and 'with'. 'swap' is the base class you wish to replace,
   * and 'with' is the custom subclass to use.
   * @param skipClasses An array of classes to skip making services for.
   * @param defaultHost Default host to use in ApiService.
   */
  constructor(environment, platform, deviceInterface, crypto, alertService, identifier, swapClasses, skipClasses, defaultHost) {
    this.eventHandlers = [];
    this.services = [];
    this.streamRemovers = [];
    this.serviceObservers = [];
    this.managedSubscribers = [];
    /** True if the result of deviceInterface.openDatabase yields a new database being created */

    this.createdNewDatabase = false;
    /** True if the application has started (but not necessarily launched) */

    this.started = false;
    /** True if the application has launched */

    this.launched = false;
    /** Whether the application has been destroyed via .deinit() */

    this.dealloced = false;

    if (!deviceInterface) {
      throw Error('Device Interface must be supplied.');
    }

    if (!environment) {
      throw Error('Environment must be supplied when creating an application.');
    }

    if (!platform) {
      throw Error('Platform must be supplied when creating an application.');
    }

    if (!crypto) {
      throw Error('Crypto has to be supplied when creating an application.');
    }

    if (!alertService) {
      throw Error('AlertService must be supplied when creating an application.');
    }

    this.environment = environment;
    this.platform = platform;
    this.identifier = identifier;
    this.deviceInterface = deviceInterface;
    this.crypto = crypto;
    this.alertService = alertService;
    this.swapClasses = swapClasses;
    this.skipClasses = skipClasses;
    this.defaultHost = defaultHost;
    this.constructServices();
  }
  /**
   * The first thing consumers should call when starting their app.
   * This function will load all services in their correct order.
   */


  async prepareForLaunch(callback) {
    this.setLaunchCallback(callback);
    const databaseResult = await this.deviceInterface.openDatabase(this.identifier).catch(error => {
      this.notifyEvent(events["a" /* ApplicationEvent */].LocalDatabaseReadError, error);
      return undefined;
    });
    this.createdNewDatabase = (databaseResult === null || databaseResult === void 0 ? void 0 : databaseResult.isNewDatabase) || false;
    await this.migrationService.initialize();
    await this.handleStage(ApplicationStage.PreparingForLaunch_0);
    await this.notifyEvent(events["a" /* ApplicationEvent */].PreparingForLaunch);
    await this.storageService.initializeFromDisk();
    await this.protocolService.initialize();
    await this.handleStage(ApplicationStage.ReadyForLaunch_05);
    this.started = true;
    await this.notifyEvent(events["a" /* ApplicationEvent */].Started);
  }

  setLaunchCallback(callback) {
    this.challengeService.sendChallenge = callback.receiveChallenge;
  }
  /**
   * Runs migrations, handles device authentication, unlocks application, and
   * issues a callback if a device activation requires user input
   * (i.e local passcode or fingerprint).
   * @param awaitDatabaseLoad
   * Option to await database load before marking the app as ready.
   */


  async launch() {
    let awaitDatabaseLoad = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    this.launched = false;
    const launchChallenge = await this.challengeService.getLaunchChallenge();

    if (launchChallenge) {
      const response = await this.challengeService.promptForChallengeResponse(launchChallenge);

      if (!response) {
        throw Error('Launch challenge was cancelled.');
      }

      await this.handleLaunchChallengeResponse(response);
    }

    if (this.storageService.isStorageWrapped()) {
      await this.storageService.decryptStorage();
    }

    await this.handleStage(ApplicationStage.StorageDecrypted_09);
    await this.apiService.loadHost();
    await this.sessionManager.initializeFromDisk();
    this.historyManager.initializeFromDisk();
    this.launched = true;
    await this.notifyEvent(events["a" /* ApplicationEvent */].Launched);
    await this.handleStage(ApplicationStage.Launched_10);
    const databasePayloads = await this.syncService.getDatabasePayloads();
    await this.handleStage(ApplicationStage.LoadingDatabase_11);

    if (this.createdNewDatabase) {
      await this.syncService.onNewDatabaseCreated();
    }
    /**
    * We don't want to await this, as we want to begin allowing the app to function
    * before local data has been loaded fully. We await only initial
    * `getDatabasePayloads` to lock in on database state.
    */


    const loadPromise = this.syncService.loadDatabasePayloads(databasePayloads).then(async () => {
      if (this.dealloced) {
        throw 'Application has been destroyed.';
      }

      await this.handleStage(ApplicationStage.LoadedDatabase_12);
      this.beginAutoSyncTimer();
      return this.syncService.sync({
        mode: SyncModes.DownloadFirst
      });
    });

    if (awaitDatabaseLoad) {
      await loadPromise;
    }
  }

  async handleLaunchChallengeResponse(response) {
    if (response.challenge.types.includes(ChallengeType.LocalPasscode)) {
      let wrappingKey = response.artifacts.wrappingKey;

      if (!wrappingKey) {
        const value = response.getValueForType(ChallengeType.LocalPasscode);
        wrappingKey = await this.protocolService.computeWrappingKey(value.value);
      }

      await this.protocolService.unwrapRootKey(wrappingKey);
    }
  }

  beginAutoSyncTimer() {
    this.autoSyncInterval = this.deviceInterface.interval(() => {
      this.syncService.log('Syncing from autosync');
      this.sync();
    }, DEFAULT_AUTO_SYNC_INTERVAL);
  }

  async handleStage(stage) {
    for (const service of this.services) {
      await service.handleApplicationStage(stage);
    }
  }
  /**
   * @param singleEvent Whether to only listen for a particular event.
   */


  addEventObserver(callback, singleEvent) {
    const observer = {
      callback,
      singleEvent
    };
    this.eventHandlers.push(observer);
    return () => {
      Object(utils["B" /* removeFromArray */])(this.eventHandlers, observer);
    };
  }

  addSingleEventObserver(event, callback) {
    const filteredCallback = async firedEvent => {
      if (firedEvent === event) {
        callback(event);
      }
    };

    return this.addEventObserver(filteredCallback, event);
  }

  async notifyEvent(event, data) {
    for (const observer of this.eventHandlers.slice()) {
      if (observer.singleEvent && observer.singleEvent === event) {
        await observer.callback(event, data || {});
      } else if (!observer.singleEvent) {
        await observer.callback(event, data || {});
      }
    }

    this.migrationService.handleApplicationEvent(event);
  }
  /**
   * Whether the local database has completed loading local items.
   */


  isDatabaseLoaded() {
    return this.syncService.isDatabaseLoaded();
  }

  async savePayload(payload) {
    const dirtied = Object(generator["b" /* CopyPayload */])(payload, {
      dirty: true,
      dirtiedDate: new Date()
    });
    await this.modelManager.emitPayload(dirtied, sources["a" /* PayloadSource */].LocalChanged);
    await this.syncService.sync();
  }
  /**
   * Finds an item by UUID.
   */


  findItem(uuid) {
    return this.itemManager.findItem(uuid);
  }
  /**
   * Returns all items.
   */


  allItems() {
    return this.itemManager.items;
  }
  /**
   * Finds an item by predicate.
  */


  findItems(predicate) {
    return this.itemManager.itemsMatchingPredicate(predicate);
  }
  /**
   * Finds an item by predicate.
   */


  getAll(uuids) {
    return this.itemManager.findItems(uuids);
  }
  /**
   * Takes the values of the input item and emits it onto global state.
   */


  async mergeItem(item, source) {
    return this.itemManager.emitItemFromPayload(item.payloadRepresentation(), source);
  }
  /**
   * Creates a managed item.
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */


  async createManagedItem(contentType, content) {
    let needsSync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let override = arguments.length > 3 ? arguments[3] : undefined;
    const item = await this.itemManager.createItem(contentType, content, needsSync, override);
    return item;
  }
  /**
   * Creates an unmanaged item that can be added later.
   * @param needsSync  Whether to mark the item as needing sync. `add` must also be true.
   */


  async createTemplateItem(contentType, content) {
    const item = await this.itemManager.createTemplateItem(contentType, content);
    return item;
  }
  /**
   * Creates an unmanaged item from a payload.
   */


  createItemFromPayload(payload) {
    return CreateItemFromPayload(payload);
  }
  /**
   * Creates an unmanaged payload from any object, where the raw object
   * represents the same data a payload would.
   */


  createPayloadFromObject(object) {
    return Object(generator["e" /* CreateMaxPayloadFromAnyObject */])(object);
  }
  /**
   * @returns The date of last sync
   */


  getLastSyncDate() {
    return this.syncService.getLastSyncDate();
  }

  getSyncStatus() {
    return this.syncService.getStatus();
  }
  /**
   * @param isUserModified  Whether to change the modified date the user
   * sees of the item.
   */


  async setItemNeedsSync(item) {
    let isUserModified = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return this.itemManager.setItemDirty(item.uuid, isUserModified);
  }

  async setItemsNeedsSync(items) {
    return this.itemManager.setItemsDirty(Object(functions["b" /* Uuids */])(items));
  }

  async deleteItem(item) {
    await this.itemManager.setItemToBeDeleted(item.uuid);
    return this.sync();
  }

  async deleteItemLocally(item) {
    this.itemManager.removeItemLocally(item);
  }

  async emptyTrash() {
    await this.itemManager.emptyTrash();
    return this.sync();
  }

  getTrashedItems() {
    return this.itemManager.trashedItems;
  }

  setDisplayOptions(contentType, sortBy, direction, filter) {
    this.itemManager.setDisplayOptions(contentType, sortBy, direction, filter);
  }

  setNotesDisplayOptions(tag, sortBy, direction, filter) {
    this.itemManager.setNotesDisplayOptions(tag, sortBy, direction, filter);
  }

  getDisplayableItems(contentType) {
    return this.itemManager.getDisplayableItems(contentType);
  }
  /**
   * Inserts the input item by its payload properties, and marks the item as dirty.
   * A sync is not performed after an item is inserted. This must be handled by the caller.
   */


  async insertItem(item) {
    /* First insert the item */
    const insertedItem = await this.itemManager.insertItem(item);
    /* Now change the item so that it's marked as dirty */

    await this.itemManager.changeItems([insertedItem.uuid]);
    return this.findItem(item.uuid);
  }
  /**
   * Saves the item by uuid by finding it, setting it as dirty if its not already,
   * and performing a sync request.
   */


  async saveItem(uuid) {
    const item = this.itemManager.findItem(uuid);

    if (!item) {
      throw Error('Attempting to save non-inserted item');
    }

    if (!item.dirty) {
      await this.itemManager.changeItem(uuid);
    }

    await this.syncService.sync();
  }
  /**
   * Mutates a pre-existing item, marks it as dirty, and syncs it
   */


  async changeAndSaveItem(uuid, mutate) {
    let isUserModified = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let payloadSource = arguments.length > 3 ? arguments[3] : undefined;
    let syncOptions = arguments.length > 4 ? arguments[4] : undefined;

    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid to change item');
    }

    await this.itemManager.changeItems([uuid], mutate, isUserModified ? core_item["c" /* MutationType */].UserInteraction : undefined, payloadSource);
    await this.syncService.sync(syncOptions);
    return this.findItem(uuid);
  }
  /**
  * Mutates pre-existing items, marks them as dirty, and syncs
  */


  async changeAndSaveItems(uuids, mutate) {
    let isUserModified = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let payloadSource = arguments.length > 3 ? arguments[3] : undefined;
    let syncOptions = arguments.length > 4 ? arguments[4] : undefined;
    await this.itemManager.changeItems(uuids, mutate, isUserModified ? core_item["c" /* MutationType */].UserInteraction : undefined, payloadSource);
    await this.syncService.sync(syncOptions);
  }
  /**
  * Mutates a pre-existing item and marks it as dirty. Does not sync changes.
  */


  async changeItem(uuid, mutate) {
    let isUserModified = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (!Object(utils["s" /* isString */])(uuid)) {
      throw Error('Must use uuid to change item');
    }

    await this.itemManager.changeItems([uuid], mutate, isUserModified ? core_item["c" /* MutationType */].UserInteraction : undefined);
    return this.findItem(uuid);
  }
  /**
   * Mutates a pre-existing items and marks them as dirty. Does not sync changes.
   */


  async changeItems(uuids, mutate) {
    let isUserModified = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return this.itemManager.changeItems(uuids, mutate, isUserModified ? core_item["c" /* MutationType */].UserInteraction : undefined);
  }

  getItems(contentType) {
    return this.itemManager.getItems(contentType);
  }

  notesMatchingSmartTag(smartTag) {
    return this.itemManager.notesMatchingSmartTag(smartTag);
  }
  /** Returns an item's direct references */


  referencesForItem(item, contentType) {
    let references = this.itemManager.referencesForItem(item.uuid);

    if (contentType) {
      references = references.filter(ref => {
        return (ref === null || ref === void 0 ? void 0 : ref.content_type) === contentType;
      });
    }

    return references;
  }
  /** Returns items referencing an item */


  referencingForItem(item, contentType) {
    let references = this.itemManager.itemsReferencingItem(item.uuid);

    if (contentType) {
      references = references.filter(ref => {
        return (ref === null || ref === void 0 ? void 0 : ref.content_type) === contentType;
      });
    }

    return references;
  }

  findTagByTitle(title) {
    return this.itemManager.findTagByTitle(title);
  }

  async findOrCreateTag(title) {
    return this.itemManager.findOrCreateTagByTitle(title);
  }

  getSmartTags() {
    return this.itemManager.getSmartTags();
  }

  getNoteCount() {
    return this.itemManager.noteCount;
  }
  /**
   * Begin streaming items to display in the UI. The stream callback will be called
   * immediately with the present items that match the constraint, and over time whenever
   * items matching the constraint are added, changed, or deleted.
   */


  streamItems(contentType, stream) {
    const observer = this.itemManager.addObserver(contentType, (changed, inserted, discarded, source) => {
      const all = changed.concat(inserted).concat(discarded);
      stream(all, source);
    });
    /** Push current values now */

    const matches = this.itemManager.getItems(contentType);

    if (matches.length > 0) {
      stream(matches);
    }

    this.streamRemovers.push(observer);
    return () => {
      observer();
      Object(utils["B" /* removeFromArray */])(this.streamRemovers, observer);
    };
  }
  /**
   * Activates or deactivates a component, depending on its
   * current state, and syncs.
   */


  async toggleComponent(component) {
    await this.componentManager.toggleComponent(component);
    return this.syncService.sync();
  }
  /**
   * Set the server's URL
   */


  async setHost(host) {
    return this.apiService.setHost(host);
  }

  async getHost() {
    return this.apiService.getHost();
  }

  getUser() {
    if (!this.launched) {
      throw 'Attempting to access user before application unlocked';
    }

    return this.sessionManager.getUser();
  }

  getProtocolEncryptionDisplayName() {
    return this.protocolService.getDefaultOperatorEncryptionDisplayName();
  }

  getUserVersion() {
    return this.protocolService.getUserVersion();
  }
  /**
   * Returns true if there is an upgrade available for the account or passcode
   */


  async protocolUpgradeAvailable() {
    return this.protocolService.upgradeAvailable();
  }
  /**
   * Returns true if there is an encryption source available
   */


  isEncryptionAvailable() {
    return this.hasAccount() || this.hasPasscode();
  }

  async upgradeProtocolVersion() {
    const hasPasscode = this.hasPasscode();
    const hasAccount = this.hasAccount();
    const types = [];

    if (hasPasscode) {
      types.push(ChallengeType.LocalPasscode);
    }

    if (hasAccount) {
      types.push(ChallengeType.AccountPassword);
    }

    const challenge = new Challenge(types, ChallengeReason.ProtocolUpgrade);
    const response = await this.challengeService.promptForChallengeResponse(challenge);

    if (!response) {
      return {
        canceled: true
      };
    }

    const dismissBlockingDialog = await this.alertService.blockingDialog(DO_NOT_CLOSE_APPLICATION, UPGRADING_ENCRYPTION);

    try {
      let passcode;

      if (hasPasscode) {
        /* Upgrade passcode version */
        const value = response.getValueForType(ChallengeType.LocalPasscode);
        passcode = value.value;
      }

      if (hasAccount) {
        /* Upgrade account version */
        const value = response.getValueForType(ChallengeType.AccountPassword);
        const password = value.value;
        const changeResponse = await this.changePassword(password, password, passcode, {
          validatePasswordStrength: false
        });

        if (changeResponse === null || changeResponse === void 0 ? void 0 : changeResponse.error) {
          return {
            error: changeResponse.error
          };
        }
      }

      if (passcode) {
        await this.changePasscode(passcode);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        error
      };
    } finally {
      dismissBlockingDialog();
    }
  }

  noAccount() {
    return !this.hasAccount();
  }

  hasAccount() {
    return this.protocolService.hasAccount();
  }
  /**
   * @returns
   * .affectedItems: Items that were either created or dirtied by this import
   * .errorCount: The number of items that were not imported due to failure to decrypt.
   */


  async importData(data, password) {
    let awaitSync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (data.version) {
      /**
       * Prior to 003 backup files did not have a version field so we cannot
       * stop importing if there is no backup file version, only if there is
       * an unsupported version.
       */
      const version = data.version;
      const supportedVersions = this.protocolService.supportedVersions();

      if (!supportedVersions.includes(version)) {
        return {
          error: UNSUPPORTED_BACKUP_FILE_VERSION
        };
      }

      const userVersion = await this.getUserVersion();

      if (userVersion && Object(versions["b" /* compareVersions */])(version, userVersion) === 1) {
        /** File was made with a greater version than the user's account */
        return {
          error: BACKUP_FILE_MORE_RECENT_THAN_ACCOUNT
        };
      }
    }

    const decryptedPayloads = await this.protocolService.payloadsByDecryptingBackupFile(data, password);
    const validPayloads = decryptedPayloads.filter(payload => {
      return !payload.errorDecrypting;
    }).map(payload => {
      /* Don't want to activate any components during import process in
       * case of exceptions breaking up the import proccess */
      if (payload.content_type === content_types["a" /* ContentType */].Component && payload.safeContent.active) {
        return Object(generator["b" /* CopyPayload */])(payload, {
          content: application_objectSpread(application_objectSpread({}, payload.safeContent), {}, {
            active: false
          })
        });
      } else {
        return payload;
      }
    });
    const affectedUuids = await this.modelManager.importPayloads(validPayloads);
    const promise = this.sync();

    if (awaitSync) {
      await promise;
    }

    const affectedItems = this.getAll(affectedUuids);
    return {
      affectedItems: affectedItems,
      errorCount: decryptedPayloads.length - validPayloads.length
    };
  }
  /**
   * Creates a JSON string representing the backup format of all items, or just subItems
   * if supplied.
   */


  async createBackupFile(subItems, intent) {
    let returnIfEmpty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return this.protocolService.createBackupFile(subItems, intent, returnIfEmpty);
  }

  isEphemeralSession() {
    return this.storageService.isEphemeralSession();
  }

  lockSyncing() {
    this.syncService.lockSyncing();
  }

  unlockSyncing() {
    this.syncService.unlockSyncing();
  }

  async sync(options) {
    return this.syncService.sync(options);
  }

  async isOutOfSync() {
    return this.syncService.isOutOfSync();
  }

  async resolveOutOfSync() {
    return this.syncService.resolveOutOfSync();
  }

  async setValue(key, value, mode) {
    return this.storageService.setValue(key, value, mode);
  }

  async getValue(key, mode) {
    return this.storageService.getValue(key, mode);
  }

  async removeValue(key, mode) {
    return this.storageService.removeValue(key, mode);
  }
  /**
   * Deletes all payloads from storage.
   */


  async clearDatabase() {
    return this.storageService.clearAllPayloads();
  }
  /**
   * Allows items keys to be rewritten to local db on local credential status change,
   * such as if passcode is added, changed, or removed.
   * This allows IndexedDB unencrypted logs to be deleted
   * `deletePayloads` will remove data from backing store,
   * but not from working memory See:
   * https://github.com/standardnotes/desktop/issues/131
   */


  async rewriteItemsKeys() {
    const itemsKeys = this.itemManager.itemsKeys();
    const payloads = itemsKeys.map(key => key.payloadRepresentation());
    await this.storageService.deletePayloads(payloads);
    await this.syncService.persistPayloads(payloads);
  }
  /**
   * Gives services a chance to complete any sensitive operations before yielding
   * @param maxWait The maximum number of milliseconds to wait for services
   * to finish tasks. 0 means no limit.
   */


  async prepareForDeinit() {
    let maxWait = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    const promise = Promise.all(this.services.map(service => service.blockDeinit()));

    if (maxWait === 0) {
      await promise;
    } else {
      /** Await up to maxWait. If not resolved by then, return. */
      await Promise.race([promise, Object(utils["E" /* sleep */])(maxWait)]);
    }
  }

  promptForCustomChallenge(challenge) {
    var _this$challengeServic;

    return (_this$challengeServic = this.challengeService) === null || _this$challengeServic === void 0 ? void 0 : _this$challengeServic.promptForChallengeResponse(challenge);
  }

  setChallengeCallbacks(_ref) {
    let {
      challenge,
      onValidValue,
      onInvalidValue,
      onComplete,
      onCancel
    } = _ref;
    return this.challengeService.setChallengeCallbacks(challenge, onValidValue, onInvalidValue, onComplete, onCancel);
  }

  submitValuesForChallenge(challenge, values) {
    return this.challengeService.submitValuesForChallenge(challenge, values);
  }

  cancelChallenge(challenge) {
    this.challengeService.cancelChallenge(challenge);
  }
  /** Set a function to be called when this application deinits */


  setOnDeinit(onDeinit) {
    this.onDeinit = onDeinit;
  }
  /**
   * Destroys the application instance.
   */


  deinit(source) {
    clearInterval(this.autoSyncInterval);

    for (const uninstallObserver of this.serviceObservers) {
      uninstallObserver();
    }

    for (const uninstallSubscriber of this.managedSubscribers) {
      uninstallSubscriber();
    }

    for (const service of this.services) {
      service.deinit();
    }

    this.onDeinit && this.onDeinit(this, source);
    this.onDeinit = undefined;
    this.crypto = undefined;
    this.createdNewDatabase = false;
    this.services.length = 0;
    this.serviceObservers.length = 0;
    this.managedSubscribers.length = 0;
    this.streamRemovers.length = 0;
    this.clearServices();
    this.dealloced = true;
    this.started = false;
  }
  /**
   * Returns the wrapping key for operations that require resaving the root key
   * (changing the account password, signing in, registering, or upgrading protocol)
   * Returns empty object if no passcode is configured.
   * Otherwise returns {cancled: true} if the operation is canceled, or
   * {wrappingKey} with the result.
   * @param passcode - If the consumer already has access to the passcode,
   * they can pass it here so that the user is not prompted again.
   */


  async getWrappingKeyIfNecessary(passcode) {
    if (!this.hasPasscode()) {
      return {};
    }

    if (!passcode) {
      const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.ResaveRootKey);
      const response = await this.challengeService.promptForChallengeResponse(challenge);

      if (!response) {
        return {
          canceled: true
        };
      }

      const value = response.getValueForType(ChallengeType.LocalPasscode);
      passcode = value.value;
    }

    const wrappingKey = await this.protocolService.computeWrappingKey(passcode);
    return {
      wrappingKey
    };
  }
  /**
   *  @param mergeLocal  Whether to merge existing offline data into account. If false,
   *                     any pre-existing data will be fully deleted upon success.
   */


  async register(email, password) {
    let ephemeral = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let mergeLocal = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    const {
      wrappingKey,
      canceled
    } = await this.getWrappingKeyIfNecessary();

    if (canceled) {
      return;
    }

    this.lockSyncing();
    const result = await this.sessionManager.register(email, password);

    if (!result.response.error) {
      await this.protocolService.setNewRootKey(result.rootKey, result.keyParams, wrappingKey);
      this.syncService.resetSyncState();
      await this.storageService.setPersistencePolicy(ephemeral ? StoragePersistencePolicies.Ephemeral : StoragePersistencePolicies.Default);

      if (mergeLocal) {
        await this.syncService.markAllItemsAsNeedingSync(true);
      } else {
        this.itemManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }

      await this.notifyEvent(events["a" /* ApplicationEvent */].SignedIn);
      this.unlockSyncing();
      await this.syncService.downloadFirstSync(300);
      this.protocolService.decryptErroredItems();
    } else {
      this.unlockSyncing();
    }

    return result.response;
  }
  /**
   * @param mergeLocal  Whether to merge existing offline data into account.
   * If false, any pre-existing data will be fully deleted upon success.
   */


  async signIn(email, password) {
    let strict = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let ephemeral = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let mfaKeyPath = arguments.length > 4 ? arguments[4] : undefined;
    let mfaCode = arguments.length > 5 ? arguments[5] : undefined;
    let mergeLocal = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : true;
    let awaitSync = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
    const {
      wrappingKey,
      canceled
    } = await this.getWrappingKeyIfNecessary();

    if (canceled) {
      return;
    }
    /** Prevent a timed sync from occuring while signing in. */


    this.lockSyncing();
    const result = await this.sessionManager.signIn(email, password, strict, mfaKeyPath, mfaCode);

    if (!result.response.error) {
      await this.protocolService.setNewRootKey(result.rootKey, result.keyParams, wrappingKey);
      this.syncService.resetSyncState();
      await this.storageService.setPersistencePolicy(ephemeral ? StoragePersistencePolicies.Ephemeral : StoragePersistencePolicies.Default);

      if (mergeLocal) {
        await this.syncService.markAllItemsAsNeedingSync(true);
      } else {
        this.itemManager.removeAllItemsFromMemory();
        await this.clearDatabase();
      }

      await this.notifyEvent(events["a" /* ApplicationEvent */].SignedIn);
      this.unlockSyncing();
      const syncPromise = this.syncService.downloadFirstSync(1000, {
        checkIntegrity: true,
        awaitAll: awaitSync
      });

      if (awaitSync) {
        await syncPromise;
        await this.protocolService.decryptErroredItems();
      } else {
        this.protocolService.decryptErroredItems();
      }
    } else {
      this.unlockSyncing();
    }

    return result.response;
  }
  /**
   * @param passcode - Changing the account password requires the local
   * passcode if configured (to rewrap the account key with passcode). If the passcode
   * is not passed in, the user will be prompted for the passcode. However if the consumer
   * already has referene to the passcode, they can pass it in here so that the user
   * is not prompted again.
   */


  async changePassword(currentPassword, newPassword, passcode) {
    let {
      validatePasswordStrength = true
    } = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if (validatePasswordStrength) {
      if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
        return {
          error: Error(InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH))
        };
      }
    }

    const {
      wrappingKey,
      canceled
    } = await this.getWrappingKeyIfNecessary(passcode);

    if (canceled) {
      return {};
    }
    /** Change the password locally */


    const [error, changePasswordResult] = await this.protocolService.changePassword(this.getUser().email, currentPassword, newPassword, wrappingKey);
    if (error) return {
      error
    };
    const {
      currentServerPassword,
      newRootKey,
      newKeyParams,
      rollback: rollbackPasswordChange
    } = changePasswordResult;
    /** Sync the newly created items key. Roll back on failure */

    await this.syncService.sync({
      awaitAll: true
    });
    const itemsKeyWasSynced = this.protocolService.getDefaultItemsKey().updated_at.getTime() > 0;

    if (!itemsKeyWasSynced) {
      await rollbackPasswordChange();
      await this.syncService.sync({
        awaitAll: true
      });
      return {
        error: Error(API_MESSAGE_GENERIC_SYNC_FAIL)
      };
    }

    this.lockSyncing();
    /** Now, change the password on the server. Roll back on failure */

    const response = await this.sessionManager.changePassword(currentServerPassword, newRootKey.serverPassword, newKeyParams);

    if (response.error) {
      await rollbackPasswordChange();
      await this.syncService.sync({
        awaitAll: true
      });
    }

    this.unlockSyncing();
    return response;
  }

  async signOut() {
    await this.sessionManager.signOut();
    await this.protocolService.clearLocalKeyState();
    await this.storageService.clearAllData();
    await this.notifyEvent(events["a" /* ApplicationEvent */].SignedOut);
    await this.prepareForDeinit();
    this.deinit(DeinitSource.SignOut);
  }

  async validateAccountPassword(password) {
    const {
      valid
    } = await this.protocolService.validateAccountPassword(password);
    return valid;
  }

  isStarted() {
    return this.started;
  }

  isLaunched() {
    return this.launched;
  }

  async hasBiometrics() {
    return this.challengeService.hasBiometricsEnabled();
  }

  async enableBiometrics() {
    return this.challengeService.enableBiometrics();
  }

  async disableBiometrics() {
    return this.challengeService.disableBiometrics();
  }

  hasPasscode() {
    return this.protocolService.hasPasscode();
  }

  async isLocked() {
    if (!this.started) {
      return true;
    }

    return this.challengeService.isPasscodeLocked();
  }

  async lock() {
    /** Because locking is a critical operation, we want to try to do it safely,
     * but only up to a certain limit. */
    const MaximumWaitTime = 500;
    await this.prepareForDeinit(MaximumWaitTime);
    return this.deinit(DeinitSource.Lock);
  }

  async setPasscode(passcode) {
    const dismissBlockingDialog = await this.alertService.blockingDialog(DO_NOT_CLOSE_APPLICATION, SETTING_PASSCODE);

    try {
      await this.setPasscodeWithoutWarning(passcode);
    } finally {
      dismissBlockingDialog();
    }
  }

  async removePasscode() {
    const dismissBlockingDialog = await this.alertService.blockingDialog(DO_NOT_CLOSE_APPLICATION, REMOVING_PASSCODE);

    try {
      await this.removePasscodeWithoutWarning();
    } finally {
      dismissBlockingDialog();
    }
  }

  async changePasscode(passcode) {
    const dismissBlockingDialog = await this.alertService.blockingDialog(DO_NOT_CLOSE_APPLICATION, CHANGING_PASSCODE);

    try {
      await this.removePasscodeWithoutWarning();
      await this.setPasscodeWithoutWarning(passcode);
    } finally {
      dismissBlockingDialog();
    }
  }

  async setPasscodeWithoutWarning(passcode) {
    const identifier = await this.generateUuid();
    const {
      key,
      keyParams
    } = await this.protocolService.createRootKey(identifier, passcode);
    await this.protocolService.setNewRootKeyWrapper(key, keyParams);
    await this.rewriteItemsKeys();
    await this.syncService.sync();
  }

  async removePasscodeWithoutWarning() {
    await this.protocolService.removeRootKeyWrapper();
    await this.rewriteItemsKeys();
  }

  getStorageEncryptionPolicy() {
    return this.storageService.getStorageEncryptionPolicy();
  }

  async setStorageEncryptionPolicy(encryptionPolicy) {
    await this.storageService.setEncryptionPolicy(encryptionPolicy);
    return this.protocolService.repersistAllItems();
  }

  hasPendingMigrations() {
    return this.migrationService.hasPendingMigrations();
  }

  generateUuid() {
    return uuid_Uuid.GenerateUuid();
  }
  /**
   * Dynamically change the device interface, i.e when Desktop wants to override
   * default web interface.
   */


  async changeDeviceInterface(deviceInterface) {
    this.deviceInterface = deviceInterface;

    for (const service of this.services) {
      if (service.deviceInterface) {
        service.deviceInterface = deviceInterface;
      }
    }
  }

  constructServices() {
    this.createModelManager();
    this.createItemManager();
    this.createStorageManager();
    this.createProtocolService();
    const encryptionDelegate = {
      payloadByEncryptingPayload: this.protocolService.payloadByEncryptingPayload.bind(this.protocolService),
      payloadByDecryptingPayload: this.protocolService.payloadByDecryptingPayload.bind(this.protocolService)
    };
    this.storageService.encryptionDelegate = encryptionDelegate;
    this.createChallengeService();
    this.createMigrationService();
    this.createHttpManager();
    this.createApiService();
    this.createSessionManager();
    this.createSyncManager();
    this.createSingletonManager();
    this.createComponentManager();
    this.createPrivilegesService();
    this.createHistoryManager();
    this.createActionsManager();
  }

  clearServices() {
    this.migrationService = undefined;
    this.alertService = undefined;
    this.httpService = undefined;
    this.modelManager = undefined;
    this.protocolService = undefined;
    this.storageService = undefined;
    this.apiService = undefined;
    this.sessionManager = undefined;
    this.syncService = undefined;
    this.challengeService = undefined;
    this.singletonManager = undefined;
    this.componentManager = undefined;
    this.privilegesService = undefined;
    this.actionsManager = undefined;
    this.historyManager = undefined;
    this.itemManager = undefined;
    this.services = [];
  }

  createMigrationService() {
    this.migrationService = new migration_service_SNMigrationService({
      protocolService: this.protocolService,
      deviceInterface: this.deviceInterface,
      storageService: this.storageService,
      challengeService: this.challengeService,
      itemManager: this.itemManager,
      environment: this.environment,
      identifier: this.identifier
    });
    this.services.push(this.migrationService);
  }

  createApiService() {
    this.apiService = new api_service_SNApiService(this.httpService, this.storageService, this.defaultHost);
    this.services.push(this.apiService);
  }

  createItemManager() {
    this.itemManager = new item_manager_ItemManager(this.modelManager);
    this.services.push(this.itemManager);
  }

  createComponentManager() {
    if (this.shouldSkipClass(component_manager_SNComponentManager)) {
      return;
    }

    const MaybeSwappedComponentManager = this.getClass(component_manager_SNComponentManager);
    this.componentManager = new MaybeSwappedComponentManager(this.itemManager, this.syncService, this.alertService, this.environment, this.platform, this.deviceInterface.timeout);
    this.services.push(this.componentManager);
  }

  createHttpManager() {
    this.httpService = new http_service_SNHttpService();
    this.services.push(this.httpService);
  }

  createModelManager() {
    this.modelManager = new model_manager_PayloadManager();
    this.services.push(this.modelManager);
  }

  createSingletonManager() {
    this.singletonManager = new singleton_manager_SNSingletonManager(this.itemManager, this.syncService);
    this.services.push(this.singletonManager);
  }

  createStorageManager() {
    this.storageService = new storage_service_SNStorageService(this.deviceInterface, this.identifier);
    this.services.push(this.storageService);
  }

  createProtocolService() {
    this.protocolService = new protocol_service_SNProtocolService(this.itemManager, this.modelManager, this.deviceInterface, this.storageService, this.identifier, this.crypto);
    this.protocolService.onKeyStatusChange(async () => {
      await this.notifyEvent(events["a" /* ApplicationEvent */].KeyStatusChanged);
    });
    this.services.push(this.protocolService);
  }

  createSessionManager() {
    this.sessionManager = new session_manager_SNSessionManager(this.storageService, this.apiService, this.alertService, this.protocolService);
    this.services.push(this.sessionManager);
  }

  createSyncManager() {
    this.syncService = new sync_service_SNSyncService(this.itemManager, this.sessionManager, this.protocolService, this.storageService, this.modelManager, this.apiService, this.deviceInterface.interval);

    const syncEventCallback = async eventName => {
      const appEvent = Object(events["c" /* applicationEventForSyncEvent */])(eventName);

      if (appEvent) {
        await this.notifyEvent(appEvent);
      }

      await this.protocolService.onSyncEvent(eventName);
    };

    const uninstall = this.syncService.addEventObserver(syncEventCallback);
    this.serviceObservers.push(uninstall);
    this.services.push(this.syncService);
  }

  createChallengeService() {
    this.challengeService = new challenge_service_ChallengeService(this.storageService, this.protocolService);
    this.services.push(this.challengeService);
  }

  createPrivilegesService() {
    this.privilegesService = new privileges_service_SNPrivilegesService(this.itemManager, this.syncService, this.singletonManager, this.protocolService, this.storageService, this.sessionManager);
    this.services.push(this.privilegesService);
  }

  createHistoryManager() {
    this.historyManager = new history_manager_SNHistoryManager(this.itemManager, this.storageService, this.apiService, this.protocolService, [content_types["a" /* ContentType */].Note], this.deviceInterface.timeout);
    this.services.push(this.historyManager);
  }

  createActionsManager() {
    this.actionsManager = new actions_service_SNActionsService(this.itemManager, this.alertService, this.deviceInterface, this.httpService, this.modelManager, this.protocolService, this.syncService);
    this.services.push(this.actionsManager);
  }

  shouldSkipClass(classCandidate) {
    return this.skipClasses && this.skipClasses.includes(classCandidate);
  }

  getClass(base) {
    const swapClass = this.swapClasses && this.swapClasses.find(candidate => candidate.swap === base);

    if (swapClass) {
      return swapClass.with;
    } else {
      return base;
    }
  }

}
// CONCATENATED MODULE: ./lib/device_interface.ts

/**
 * Platforms must override this class to provide platform specific utilities
 * and access to the migration service, such as exposing an interface to read
 * raw values from the database or value storage.
 * This avoids the need for platforms to override migrations directly.
 */

class device_interface_DeviceInterface {
  /**
    * @param {function} timeout
       A platform-specific function that is fed functions to run
       when other operations have completed. This is similar to
       setImmediate on the web, or setTimeout(fn, 0).
    * @param {function} interval
       A platform-specific function that is fed functions to
       perform repeatedly. Similar to setInterval.
  */
  constructor(timeout, interval) {
    this.timeout = timeout || setTimeout.bind(Object(utils["m" /* getGlobalScope */])());
    this.interval = interval || setInterval.bind(Object(utils["m" /* getGlobalScope */])());
  }

  deinit() {
    this.timeout = null;
    this.interval = null;
  }
  /**
   * Gets the parsed raw storage value.
   * The return value from getRawStorageValue could be an object.
   * This is most likely the case for legacy values.
   * So we return the value as-is if JSON.parse throws an exception.
   */


  async getJsonParsedRawStorageValue(key) {
    const value = await this.getRawStorageValue(key);

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }

}
// CONCATENATED MODULE: ./lib/models/live_item.ts
/** Keeps an item reference up to date with changes */
class LiveItem {
  constructor(uuid, application, onChange) {
    this.item = application.findItem(uuid);
    onChange && onChange(this.item);
    this.removeObserver = application.streamItems(this.item.content_type, async items => {
      const matchingItem = items.find(item => {
        return item.uuid === uuid;
      });

      if (matchingItem) {
        this.item = matchingItem;
        onChange && onChange(this.item);
      }
    });
  }

  deinit() {
    this.removeObserver();
    this.removeObserver = undefined;
  }

}
// EXTERNAL MODULE: ./lib/services/application_service.ts
var application_service = __webpack_require__(77);

// EXTERNAL MODULE: ./lib/protocol/payloads/pure_payload.ts
var pure_payload = __webpack_require__(27);

// CONCATENATED MODULE: ./lib/index.ts













































/** Payloads */











/** Migrations */


/** Privileges */



/***/ })
/******/ ]);
});