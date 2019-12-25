import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';

import LocalStorageManager from './localStorageManager.js';
const sf_default = new SNProtocolManager();
SFItem.AppDomain = "org.standardnotes.sn";

var _globalStorageManager = null;
var _globalHttpManager = null;
var _globalAuthManager = null;
var _globalModelManager = null;
var _globalProtocolManager = null;
var _globalKeyManager = null;

export default class Factory {

  static initialize() {
    this.globalStorageManager();
    this.globalHttpManager();
    this.globalModelManager();
    this.globalKeyManager();
    this.globalAuthManager();
  }

  static globalStorageManager() {
    if(_globalStorageManager == null) { _globalStorageManager = new LocalStorageManager(); }
    return _globalStorageManager;
  }

  static globalHttpManager() {
    if(_globalHttpManager == null) {
      _globalHttpManager = new SFHttpManager();
      _globalHttpManager.setJWTRequestHandler(async () => {
        return this.globalStorageManager().getItem("jwt");;
      })
    }
    return _globalHttpManager;
  }

  static globalAuthManager() {
    if(_globalAuthManager == null) {
       _globalAuthManager = new SFAuthManager({
        storageManager: _globalStorageManager,
        httpManager: _globalHttpManager,
        keyManager: _globalKeyManager
      });
    }
    return _globalAuthManager;
  }

  static globalModelManager() {
    if(_globalModelManager == null) { _globalModelManager = new SFModelManager(); }
    return _globalModelManager;
  }

  static globalKeyManager() {
    if(_globalKeyManager == null) {
      _globalKeyManager = new SNKeyManager({
        modelManager: _globalModelManager,
        storageManager: _globalStorageManager
      });

      let keychainValue = null;
      _globalKeyManager.setKeychainDelegate({
         setKeyChainValue: async (value) => {
           keychainValue = value;
         },
         getKeyChainValue: async () => {
           return keychainValue;
         },
         deleteKeyChainValue: async () => {
           keychainValue = null;
         }
      });
    }
    return _globalKeyManager;
  }

  static globalProtocolManager() {
    if(_globalProtocolManager == null) { _globalProtocolManager = new SNProtocolManager(); }
    return _globalProtocolManager;
  }

  static createModelManager() {
    return new SFModelManager();
  }

  static createStorageManager() {
    return new LocalStorageManager();
  }

  static createItemParams(contentType) {
    var params = {
      uuid: protocolManager.crypto.generateUUIDSync(),
      content_type: contentType || "Note",
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  static createItem(contentType) {
    if(!contentType) {
      return new SNNote(this.createItemParams());
    } else {
      return new SFItem(this.createItemParams(contentType));
    }
  }

  static serverURL() {
    return "http://localhost:3000";
  }

  static yesterday() {
    return new Date(new Date().setDate(new Date().getDate() - 1));
  }

  static async sleep(seconds) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, seconds * 1000);
    })
  }

  static async newRegisteredUser(email, password, authManager) {
    let url = this.serverURL();
    if(!email) email = sf_default.crypto.generateUUIDSync();
    if(!password) password = sf_default.crypto.generateUUIDSync();
    return (authManager ? authManager : this.globalAuthManager()).register(url, email, password, false);
  }

  static shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  static randomArrayValue(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

Factory.initialize();
