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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/main.js":
/*!*********************!*\
  !*** ./lib/main.js ***!
  \*********************/
/*! exports provided: SNApplication, SNProtocolManager, SNProtocolOperator001, SNProtocolOperator002, SNProtocolOperator003, SNProtocolOperator004, SNPureItemPayload, SNStorageItemPayload, CreatePayloadFromAnyObject, SNKeychainDelegate, SFItem, SNItemsKey, SFPredicate, SNNote, SNTag, SNSmartTag, SNMfa, SNServerExtension, SNComponent, SNEditor, SNExtension, Action, SNTheme, SNEncryptedStorage, SNComponentManager, SFHistorySession, SFItemHistory, SFItemHistoryEntry, SFPrivileges, SNWebCrypto, SNReactNativeCrypto, SNDatabaseManager, SNModelManager, SNHttpManager, SNStorageManager, SNSyncManager, SNSessionManager, SNMigrationManager, SNAlertManager, SFSessionHistoryManager, SFPrivilegesManager, SNSingletonManager, SNKeyManager, findInArray, isNullOrUndefined, deepMerge, ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED, ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED, ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED, ENCRYPTION_INTENT_FILE_DECRYPTED, ENCRYPTION_INTENT_FILE_ENCRYPTED, ENCRYPTION_INTENT_SYNC, isLocalStorageIntent, isFileIntent, isDecryptedIntent, intentRequiresEncryption, SN_ROOT_KEY_CONTENT_TYPE, SN_ITEMS_KEY_CONTENT_TYPE, ENCRYPTED_STORAGE_CONTENT_TYPE, MAPPING_SOURCE_REMOTE_RETRIEVED, MAPPING_SOURCE_REMOTE_SAVED, MAPPING_SOURCE_LOCAL_SAVED, MAPPING_SOURCE_LOCAL_RETRIEVED, MAPPING_SOURCE_LOCAL_DIRTIED, MAPPING_SOURCE_COMPONENT_RETRIEVED, MAPPING_SOURCE_DESKTOP_INSTALLED, MAPPING_SOURCE_REMOTE_ACTION_RETRIEVED, MAPPING_SOURCE_FILE_IMPORT, APPLICATION_EVENT_WILL_SIGN_IN, APPLICATION_EVENT_DID_SIGN_IN, APPLICATION_EVENT_DID_SIGN_OUT, SYNC_EVENT_ENTER_OUT_OF_SYNC, SYNC_EVENT_EXIT_OUT_OF_SYNC */
/***/ (function(module, exports) {

throw new Error("Module build failed (from ./node_modules/babel-loader/lib/index.js):\nSyntaxError: /Users/mo/Desktop/sn/dev/snjs/lib/main.js: Unterminated string constant (35:33)\n\n\u001b[0m \u001b[90m 33 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSNStorageManager\u001b[39m } from \u001b[32m'./services/storageManager'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 34 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSNSyncManager\u001b[39m } from \u001b[32m'./services/sync/sync_manager'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m\u001b[31m\u001b[1m>\u001b[22m\u001b[39m\u001b[90m 35 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSNSessionManager\u001b[39m } from \u001b[32m'./services/session_manager;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m    | \u001b[39m                                 \u001b[31m\u001b[1m^\u001b[22m\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 36 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSNMigrationManager\u001b[39m } from \u001b[32m'./services/migrationManager'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 37 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSNAlertManager\u001b[39m } from \u001b[32m'./services/alertManager'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n\u001b[0m \u001b[90m 38 | \u001b[39m\u001b[36mexport\u001b[39m { \u001b[33mSFSessionHistoryManager\u001b[39m } from \u001b[32m'./services/session_history/sessionHistoryManager'\u001b[39m\u001b[33m;\u001b[39m\u001b[0m\n    at Object.raise (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:6983:17)\n    at Object.readString (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:7978:20)\n    at Object.getTokenFromCode (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:7630:14)\n    at Object.getTokenFromCode (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:4129:18)\n    at Object.nextToken (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:7203:12)\n    at Object.next (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:7132:10)\n    at Object.eat (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:7137:12)\n    at Object.eatContextual (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:8338:44)\n    at Object.parseExportFrom (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:11870:14)\n    at Object.parseExport (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:11737:12)\n    at Object.parseStatementContent (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:10770:27)\n    at Object.parseStatement (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:10666:17)\n    at Object.parseBlockOrModuleBlockBody (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:11242:25)\n    at Object.parseBlockBody (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:11229:10)\n    at Object.parseTopLevel (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:10597:10)\n    at Object.parse (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:12107:10)\n    at parse (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/parser/lib/index.js:12158:38)\n    at parser (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/core/lib/transformation/normalize-file.js:168:34)\n    at normalizeFile (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/core/lib/transformation/normalize-file.js:102:11)\n    at runSync (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/core/lib/transformation/index.js:44:43)\n    at runAsync (/Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/core/lib/transformation/index.js:35:14)\n    at /Users/mo/Desktop/sn/dev/snjs/node_modules/@babel/core/lib/transform.js:34:34\n    at processTicksAndRejections (internal/process/task_queues.js:75:11)");

/***/ })

/******/ });
});
//# sourceMappingURL=snjs.js.map