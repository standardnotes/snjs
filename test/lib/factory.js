import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';

import LocalStorageManager from './persist/storage/localStorageManager.js';
import MemoryStorageManager from './persist/storage/memoryStorageManager.js';

import LocalStorageDatabaseManager from './persist/database/localStorageDatabaseManager.js';
import MemoryDatabaseManager from './persist/database/memoryDatabaseManager.js';

var _globalStorageManager = null;
var _globalDatabaseManager = null;
var _globalHttpManager = null;
var _globalAuthManager = null;
var _globalModelManager = null;
var _globalProtocolManager = null;
var _globalKeyManager = null;

export default class Factory {

  static async createInitAppWithRandNamespace() {
    const namespace = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return this.createAndInitializeApplication(namespace);
  }

  static createApplication(namespace) {
    return new SNApplication({namespace});
  }

  static async createAndInitializeApplication(namespace) {
    const application = new SNApplication({namespace});
    await this.initializeApplication(application);
    return application;
  }

  static async initializeApplication(application) {
    let keychainValue;
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

    await application.initialize({
      keychainDelegate,
      swapClasses: [
        {
          swap: SNStorageManager,
          with: LocalStorageManager
        },
        {
          swap: SNDatabaseManager,
          with: LocalStorageDatabaseManager
        }
      ],
      skipClasses: [
        SNComponentManager
      ],
      callbacks: {
        onRequiresAuthentication: (sources, handleResponses) => {

        }
      },
      timeout: setTimeout.bind(window),
      interval: setInterval.bind(window)
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

  static createNoteParams() {
    const params = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: "Note",
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  static createRelatedNoteTagPairParams() {
    let noteParams = this.createNoteParams();
    let tagParams = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: "Tag",
      content: { title: "thoughts" }
    };
    tagParams.content.references = [{
        uuid: noteParams.uuid,
        content_type: noteParams.content_type
    }]
    noteParams.content.references = []
    return [noteParams, tagParams];
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

  static async registerUserToApplication({application, email, password}) {
    const url = this.serverURL();
    if(!email) email = SFItem.GenerateUuidSynchronously();
    if(!password) password = SFItem.GenerateUuidSynchronously();
    return application.authManager.register({url, email, password});
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
