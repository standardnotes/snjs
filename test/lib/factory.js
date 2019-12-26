import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';

import LocalStorageManager from './localStorageManager.js';
import LocalDatabaseManager from './databaseManager.js';
import MemoryStorageManager from './memoryStorageManager.js';
SFItem.AppDomain = "org.standardnotes.sn";

var _globalStorageManager = null;
var _globalDatabaseManager = null;
var _globalHttpManager = null;
var _globalAuthManager = null;
var _globalModelManager = null;
var _globalProtocolManager = null;
var _globalKeyManager = null;

export default class Factory {

  static initialize() {
    this.globalModelManager();
    this.globalProtocolManager();
    this.globalStorageManager();
    this.globalHttpManager();
    this.globalKeyManager();
    this.globalAuthManager();
  }

  static globalStorageManager() {
    if(_globalStorageManager == null) {
      _globalStorageManager = new LocalStorageManager({
        protocolManager: _globalProtocolManager,
        databaseManager: new LocalDatabaseManager()
      });
      _globalStorageManager.initializeFromDisk();
    }
    return _globalStorageManager;
  }

  static createMemoryStorageManager() {
    const storageManager = new MemoryStorageManager({
      protocolManager: _globalProtocolManager,
      databaseManager: new LocalDatabaseManager()
    });
    storageManager.initializeFromDisk();
    return storageManager;
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
        protocolManager: _globalProtocolManager,
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
        protocolManager: _globalProtocolManager,
        modelManager: _globalModelManager,
        storageManager: this.globalStorageManager()
      });

      let keychainValue = null;
      _globalKeyManager.setKeychainDelegate({
        setKeyChainValue: async (value) => {
          keychainValue = value;
        },
        getKeyChainValue: async () => {
          return keychainValue;
        },
        clearKeyChainValue: async () => {
          keychainValue = null;
        }
      });

    }
    return _globalKeyManager;
  }

  static globalProtocolManager() {
    if(_globalProtocolManager == null) {
      _globalProtocolManager = new SNProtocolManager({
        modelManager: _globalModelManager,
        keyManager: _globalKeyManager
      });

      _globalKeyManager = this.globalKeyManager();
      _globalProtocolManager.setKeyManager(_globalKeyManager);
    }
    return _globalProtocolManager;
  }

  static createModelManager() {
    return new SFModelManager();
  }

  static createItemParams(contentType) {
    var params = {
      uuid: SFItem.GenerateUuidSynchronously(),
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
    if(!email) email = SFItem.GenerateUuidSynchronously();
    if(!password) password = SFItem.GenerateUuidSynchronously();
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
