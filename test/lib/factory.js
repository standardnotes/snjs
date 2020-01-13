import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import LocalStorageManager from './persist/storage/localStorageManager.js';
import MemoryStorageManager from './persist/storage/memoryStorageManager.js';
import LocalStorageDatabaseManager from './persist/database/localStorageDatabaseManager.js';
import MemoryDatabaseManager from './persist/database/memoryDatabaseManager.js';

export default class Factory {
  static createApplication(namespace) {
    const url = this.serverURL();
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
    return new SNApplication({
      namespace: namespace,
      host: url,
      keychainDelegate: keychainDelegate,
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
      timeout: setTimeout.bind(window),
      interval: setInterval.bind(window)
    });
  }

  static async createInitAppWithRandNamespace() {
    const namespace = Math.random().toString(36).substring(2, 15);
    return this.createAndInitializeApplication(namespace);
  }

  static async createAndInitializeApplication(namespace) {
    const application = this.createApplication(namespace);
    await this.initializeApplication(application);
    return application;
  }

  static async initializeApplication(application) {
    await application.prepareForLaunch();
    await application.launch({
      callbacks: {
        authChallengeResponses: (handleChallengeResponses) => {
          throw 'Factory application shouldnt have challenges';
        }
      },
    });
  }

  static async registerUserToApplication({application, email, password}) {
    if(!email) email = SFItem.GenerateUuidSynchronously();
    if(!password) password = SFItem.GenerateUuidSynchronously();
    return application.register({email, password});
  }

  static createStorageItemPayload(contentType) {
    return CreateMaxPayloadFromAnyObject({
      object: this.createItemParams(contentType)
    });
  }

  static createStorageItemNotePayload() {
    return CreateMaxPayloadFromAnyObject({object: this.createNoteParams()});
  }

  static createStorageItemTagPayload() {
    return CreateMaxPayloadFromAnyObject({object: this.createTagParams()});
  }

  static async mapPayloadToItem(payload, modelManager) {
    const items = await modelManager.mapPayloadsToLocalItems({payloads: [payload]})
    return items[0];
  }

  static itemToStoragePayload(item) {
    return CreateMaxPayloadFromAnyObject({object: item});
  }

  static createMappedNote(application) {
    const payload = this.createStorageItemNotePayload();
    return this.mapPayloadToItem(payload, application.modelManager);
  }

  static createMappedTag(application) {
    const payload = this.createStorageItemTagPayload();
    return this.mapPayloadToItem(payload, application.modelManager);
  }

  static async createSyncedNote(application) {
    const payload = this.createStorageItemNotePayload();
    const note = await this.mapPayloadToItem(payload, application.modelManager);
    await application.modelManager.setItemDirty(note, true);
    await application.syncManager.sync();
    return note;
  }

  static async createManyMappedNotes(application, count) {
    for(let i = 0; i < count; i++) {
      const note = await Factory.createMappedNote(application);
      await application.modelManager.setItemDirty(note, true);
    }
  }

  static async loginToApplication({application, email, password}) {
    return application.signIn({
      url: Factory.serverURL(),
      email: email,
      password: password
    });
  }

  static createNotePayload() {
    return CreateMaxPayloadFromAnyObject({object: this.createNoteParams()});
  }

  static createItemParams(contentType) {
    const params = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: contentType,
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  static createNoteParams() {
    const params = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: "Note",
      content: {
        title: "hello",
        text: "world",
        references: []
      }
    };
    return params;
  }

  static createTagParams() {
    const params = {
      uuid: SFItem.GenerateUuidSynchronously(),
      content_type: "Tag",
      content: {
        title: "thoughts",
        references: []
      }
    };
    return params;
  }

  static createRelatedNoteTagPairPayload() {
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
    return [
      CreateMaxPayloadFromAnyObject({object: noteParams}),
      CreateMaxPayloadFromAnyObject({object: tagParams})
    ];
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

  static shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  static randomString(length = 10) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for(let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static randomArrayValue(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}
