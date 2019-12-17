import '../../dist/regenerator.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';

import LocalStorageManager from './localStorageManager.js';
const sf_default = new SNCryptoManager();
SFItem.AppDomain = "org.standardnotes.sn";

var _globalStorageManager = null;
var _globalHttpManager = null;
var _globalAuthManager = null;
var _globalModelManager = null;
var _globalCryptoManager = null;

export default class Factory {

  static initialize() {
    this.globalStorageManager();
    this.globalHttpManager();
    this.globalAuthManager();
    this.globalModelManager();
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
    if(_globalAuthManager == null) { _globalAuthManager = new SFAuthManager(_globalStorageManager, _globalHttpManager); }
    return _globalAuthManager;
  }

  static globalModelManager() {
    if(_globalModelManager == null) { _globalModelManager = new SFModelManager(); }
    return _globalModelManager;
  }

  static globalCryptoManager() {
    if(_globalCryptoManager == null) { _globalCryptoManager = new SNCryptoManager(); }
    return _globalCryptoManager;
  }

  static createModelManager() {
    return new SFModelManager();
  }

  static createStorageManager() {
    return new LocalStorageManager();
  }

  static createItemParams() {
    var params = {
      uuid: cryptoManager.crypto.generateUUIDSync(),
      content_type: "Note",
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  static createItem() {
    return new SFItem(this.createItemParams());
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
