/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import WebDeviceInterface from './web_device_interface.js';
import { Environments } from '../../lib/platforms.js';

export default class Factory {
  static createApplication(namespace, platform) {
    const url = this.serverURL();
    const deviceInterface = new WebDeviceInterface({
      namespace,
      timeout: setTimeout.bind(window),
      interval: setInterval.bind(window)
    });
    return new SNApplication({
      namespace: namespace,
      deviceInterface: deviceInterface,
      platform: platform || Environments.Web,
      host: url,
      skipClasses: [
        SNComponentManager
      ]
    });
  }

  static async createAppWithRandNamespace(platform) {
    const namespace = Math.random().toString(36).substring(2, 15);
    return this.createApplication(namespace, platform);
  }

  static async createInitAppWithRandNamespace(platform) {
    const namespace = Math.random().toString(36).substring(2, 15);
    return this.createAndInitializeApplication(namespace, platform);
  }

  static async createAndInitializeApplication(namespace, platform) {
    const application = this.createApplication(namespace, platform);
    await this.initializeApplication(application);
    return application;
  }

  static async initializeApplication(application) {
    await application.prepareForLaunch({
      callbacks: {
        authChallengeResponses: (handleChallengeResponses) => {
          throw 'Factory application shouldnt have challenges';
        }
      },
    });
    await application.launch({ut_awaitDatabaseLoad: true});
  }

  static async registerUserToApplication({application, email, password, ephemeral}) {
    if(!email) email = this.generateUuid();
    if(!password) password = this.generateUuid();
    return application.register({email, password, ephemeral});
  }

  static createStorageItemPayload(contentType) {
    return CreateMaxPayloadFromAnyObject({
      object: this.createItemParams(contentType)
    });
  }

  static createNotePayload() {
    return CreateMaxPayloadFromAnyObject({object: this.createNoteParams()});
  }

  static createStorageItemTagPayload() {
    return CreateMaxPayloadFromAnyObject({object: this.createTagParams()});
  }

  static itemToStoragePayload(item) {
    return CreateMaxPayloadFromAnyObject({object: item});
  }

  static createMappedNote(application) {
    const payload = this.createNotePayload();
    return application.modelManager.mapPayloadToLocalItem({payload});
  }

  static createMappedTag(application) {
    const payload = this.createStorageItemTagPayload();
    return application.modelManager.mapPayloadToLocalItem({payload});
  }

  static async createSyncedNote(application) {
    const payload = this.createNotePayload();
    const note = await application.modelManager.mapPayloadToLocalItem({payload});
    await application.modelManager.setItemDirty(note, true);
    await application.syncManager.sync();
    return note;
  }

  static async getStoragePayloadsOfType(application, type) {
    const rawPayloads = await application.storageManager.getAllRawPayloads();
    return rawPayloads.filter((rp) => rp.content_type === type).map((rp) => {
      return CreateMaxPayloadFromAnyObject({
        object: rp
      })
    })
  }

  static async createManyMappedNotes(application, count) {
    for(let i = 0; i < count; i++) {
      const note = await Factory.createMappedNote(application);
      await application.modelManager.setItemDirty(note, true);
    }
  }

  static async loginToApplication({application, email, password, ephemeral}) {
    return application.signIn({
      url: Factory.serverURL(),
      email: email,
      password: password,
      ephemeral: ephemeral
    });
  }

  static createNotePayload() {
    return CreateMaxPayloadFromAnyObject({
      object: this.createNoteParams()
    });
  }

  static createItemParams(contentType) {
    const params = {
      uuid: this.generateUuid(),
      content_type: contentType,
      content: {
        title: "hello",
        text: "world"
      }
    };
    return params;
  }

  static generateUuid() {
    const crypto = new SNWebCrypto();
    return crypto.generateUUIDSync();
  }

  static createNoteParams({title, text, dirty = true} = {}) {
    const params = {
      uuid: this.generateUuid(),
      content_type: "Note",
      dirty: dirty,
      content: {
        title: title || "hello",
        text: text || "world",
        references: []
      }
    };
    return params;
  }

  static createTagParams({dirty = true} = {}) {
    const params = {
      uuid: this.generateUuid(),
      content_type: "Tag",
      content: {
        title: "thoughts",
        references: []
      }
    };
    return params;
  }

  static createRelatedNoteTagPairPayload({dirty = true} = {}) {
    const noteParams = this.createNoteParams({dirty});
    const tagParams = this.createTagParams({dirty});
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
