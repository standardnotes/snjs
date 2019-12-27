import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';

import LocalStorageManager from './localStorageManager.js';
import LocalDatabaseManager from './databaseManager.js';
import MemoryStorageManager from './memoryStorageManager.js';

var _globalStorageManager = null;
var _globalDatabaseManager = null;
var _globalHttpManager = null;
var _globalAuthManager = null;
var _globalModelManager = null;
var _globalProtocolManager = null;
var _globalKeyManager = null;

export default class Factory {

  static async createApplication() {
    const keychainDelegate = new SNKeychainDelegate({
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

    const application = new SNApplication();
    application.initialize({
      keychainDelegate,
      swapClasses: [
        {
          swap: SNStorageManager,
          with: LocalStorageManager
        },
        {
          swap: SNDatabaseManager,
          with: LocalDatabaseManager
        }
      ],
      callbacks: {
        onRequiresAuthentication: (sources, handleResponses) => {

        }
      },
      timeout: this.timeout,
      interval: this.setInterval
    });
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
