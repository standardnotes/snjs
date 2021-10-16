/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('actions service', () => {
  const errorProcessingActionMessage =
    'An issue occurred while processing this action. Please try again.';
  const errorDecryptingRevisionMessage =
    'We were unable to decrypt this revision using your current keys, ' +
    'and this revision is missing metadata that would allow us to try different ' +
    'keys to decrypt it. This can likely be fixed with some manual intervention. ' +
    'Please email hello@standardnotes.org for assistance.';

  before(async function () {
    // Set timeout for all tests.
    this.timeout(20000);

    localStorage.clear();

    this.application = await Factory.createInitAppWithRandNamespace();
    this.itemManager = this.application.itemManager;
    this.actionsManager = this.application.actionsManager;
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();

    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });

    const rootKey = await this.application.protocolService.createRootKey(
      this.email,
      this.password,
      KeyParamsOrigination.Registration
    );
    this.authParams = rootKey.keyParams.content;

    this.fakeServer = sinon.fakeServer.create();
    this.fakeServer.respondImmediately = true;

    this.actionsExtension = {
      identifier: 'org.standardnotes.testing',
      name: 'Test extension',
      content_type: 'Extension',
      url: 'http://my-extension.sn.org/get_actions/',
      description: 'For testing purposes.',
      supported_types: ['Note'],
      actions: [
        {
          label: 'Action #1',
          url: 'http://my-extension.sn.org/action_1/',
          verb: 'get',
          context: '*',
          content_types: ['Note'],
        },
        {
          label: 'Action #2',
          url: 'http://my-extension.sn.org/action_2/',
          verb: 'render',
          context: 'Note',
          content_types: ['Note'],
        },
        {
          label: 'Action #3',
          url: 'http://my-extension.sn.org/action_3/',
          verb: 'show',
          context: 'Tag',
          content_types: ['Note'],
        },
        {
          label: 'Action #5',
          url: 'http://my-extension.sn.org/action_5/',
          verb: 'render',
          context: 'Note',
          content_types: ['Note'],
        },
        {
          label: 'Action #7',
          url: 'http://my-extension.sn.org/action_7/',
          verb: 'nested',
          context: 'Note',
          content_types: ['Note'],
        },
      ],
    };

    this.fakeServer.respondWith(
      'GET',
      /http:\/\/my-extension.sn.org\/get_actions\/(.*)/,
      (request, params) => {
        const urlParams = new URLSearchParams(params);
        const extension = this.actionsExtension;

        if (urlParams.has('item_uuid')) {
          extension.actions.push({
            label: 'Action #4',
            url: `http://my-extension.sn.org/action_4/?item_uuid=${urlParams.get(
              'item_uuid'
            )}`,
            verb: 'post',
            context: 'Item',
            content_types: ['Note'],
            access_type: 'decrypted',
          });

          extension.actions.push({
            label: 'Action #6',
            url: `http://my-extension.sn.org/action_6/?item_uuid=${urlParams.get(
              'item_uuid'
            )}`,
            verb: 'post',
            context: 'Item',
            content_types: ['Note'],
            access_type: 'encrypted',
          });
        }

        request.respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(extension)
        );
      }
    );

    const payload = new PurePayload({
      uuid: Factory.generateUuid(),
      content_type: ContentType.Note,
      content: {
        title: 'Testing',
      },
    });

    const encryptedPayload = await this.application.protocolService.payloadByEncryptingPayload(
      payload,
      EncryptionIntent.Sync
    );

    this.fakeServer.respondWith(
      'GET',
      /http:\/\/my-extension.sn.org\/action_[1,2]\/(.*)/,
      (request, params) => {
        request.respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            item: encryptedPayload,
            auth_params: this.authParams,
          })
        );
      }
    );

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_3/', [
      200,
      { 'Content-Type': 'text/html; charset=utf-8' },
      '<h2>Action #3</h2>',
    ]);

    this.fakeServer.respondWith(
      'POST',
      /http:\/\/my-extension.sn.org\/action_[4,6]\/(.*)/,
      (request, params) => {
        const requestBody = JSON.parse(request.requestBody);

        const response = {
          uuid: requestBody.items[0].uuid,
          result: 'Action POSTed successfully.',
        };

        request.respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify(response)
        );
      }
    );

    this.fakeServer.respondWith(
      'GET',
      'http://my-extension.sn.org/action_5/',
      (request, params) => {
        const encryptedPayloadClone = JSON.parse(
          JSON.stringify(encryptedPayload)
        );

        encryptedPayloadClone.items_key_id = undefined;
        encryptedPayloadClone.content = '003:somenonsense';
        encryptedPayloadClone.enc_item_key = '003:anothernonsense';
        encryptedPayloadClone.version = '003';
        encryptedPayloadClone.uuid = 'fake-uuid';

        request.respond(
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            item: encryptedPayloadClone,
            auth_params: this.authParams,
          })
        );
      }
    );

    // Extension item
    const extensionItem = await this.application.itemManager.createItem(
      ContentType.ActionsExtension,
      this.actionsExtension
    );
    this.extensionItemUuid = extensionItem.uuid;
  });

  after(async function () {
    this.fakeServer.restore();
    await Factory.safeDeinit(this.application);
    this.application = null;
    localStorage.clear();
  });

  it('should get extension items', async function () {
    await this.itemManager.createItem(ContentType.Note, {
      title: 'A simple note',
      text: 'Standard Notes rocks! lml.',
    });
    const extensions = this.actionsManager.getExtensions();
    expect(extensions.length).to.eq(1);
  });

  it('should get extensions in context of item', async function () {
    const noteItem = await this.itemManager.createItem(ContentType.Note, {
      title: 'Another note',
      text: 'Whiskey In The Jar',
    });

    const noteItemExtensions = this.actionsManager.extensionsInContextOfItem(
      noteItem
    );
    expect(noteItemExtensions.length).to.eq(1);
    expect(noteItemExtensions[0].supported_types).to.include(
      noteItem.content_type
    );
  });

  it('should get actions based on item context', async function () {
    const tagItem = await this.itemManager.createItem(ContentType.Tag, {
      title: 'Music',
    });

    const extensionItem = await this.itemManager.findItem(
      this.extensionItemUuid
    );
    const tagActions = extensionItem.actionsWithContextForItem(tagItem);

    expect(tagActions.length).to.eq(1);
    expect(tagActions.map((action) => action.label)).to.have.members([
      'Action #3',
    ]);
  });

  it('should load extension in context of item', async function () {
    const noteItem = await this.itemManager.createItem(ContentType.Note, {
      title: 'Yet another note',
      text: 'And all things will end ♫',
    });

    const extensionItem = await this.itemManager.findItem(
      this.extensionItemUuid
    );

    const extensionWithItem = await this.actionsManager.loadExtensionInContextOfItem(
      extensionItem,
      noteItem
    );
    const updatedExtensionItem = await this.itemManager.findItem(
      this.extensionItemUuid
    );

    expect(extensionWithItem).to.eq(updatedExtensionItem);
    const extensions = this.actionsManager.getExtensions();
    expect(extensions[0].actions.map((action) => action.label)).to.include(
      'Action #4'
    );
  });

  describe('get action', async function () {
    const sandbox = sinon.createSandbox();
    const confirmMessage =
      'Are you sure you want to replace the current note ' +
      "contents with this action's results?";

    before(async function () {
      this.noteItem = await this.itemManager.createItem(ContentType.Note, {
        title: 'Know what?',
        text: 'To Live is to Die',
      });
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.getAction = extensionItem.actions.filter(
        (action) => action.verb === 'get'
      )[0];
    });

    beforeEach(async function () {
      this.passwordRequestHandler = sandbox.spy();
      this.confirmAlertService = sandbox
        .stub(this.actionsManager.alertService, 'confirm')
        .callsFake((message) => true);
      this.syncServiceSync = sandbox.spy(
        this.actionsManager.syncService,
        'sync'
      );
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should be canceled if requested', async function () {
      this.confirmAlertService.callsFake((message) => false);

      const actionResponse = await this.actionsManager.runAction(
        this.getAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.calledOnceWithExactly(
        this.confirmAlertService,
        confirmMessage
      );
      expect(actionResponse.error.message).to.eq('Action canceled by user.');
      sinon.assert.notCalled(this.syncServiceSync);
    });

    it('should show a confirmation message', async function () {
      await this.actionsManager.runAction(
        this.getAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.calledOnceWithExactly(
        this.confirmAlertService,
        confirmMessage
      );
    });

    it('should return response and item keys', async function () {
      const actionResponse = await this.actionsManager.runAction(
        this.getAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      expect(Object.keys(actionResponse)).to.have.members([
        'item',
        'status',
        'data',
        'auth_params',
      ]);
    });

    it('should perform a sync request', async function () {
      await this.actionsManager.runAction(
        this.getAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.calledOnce(this.syncServiceSync);
    });

    it('should not change the item', async function () {
      await this.actionsManager.runAction(
        this.getAction,
        this.noteItem,
        this.passwordRequestHandler
      );
      const refreshedNoteItem = await this.itemManager.findItem(
        this.noteItem.uuid
      );

      expect(this.noteItem).to.eq(refreshedNoteItem);
    });
  });

  describe('render action', async function () {
    const sandbox = sinon.createSandbox();

    before(async function () {
      this.noteItem = await this.itemManager.createItem(ContentType.Note, {
        title: 'Hey',
        text: 'Welcome To Paradise',
      });
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.renderAction = extensionItem.actions.filter(
        (action) => action.verb === 'render'
      )[0];
    });

    beforeEach(async function () {
      this.alertServiceAlert = sandbox.spy(
        this.actionsManager.alertService,
        'alert'
      );
      this.windowAlert = sandbox
        .stub(window, 'alert')
        .callsFake((message) => message);
      this.passwordRequestHandler = sandbox
        .stub()
        .callsFake(() => this.password);
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should show an alert if the request fails', async function () {
      this.httpServiceGetAbsolute = sandbox
        .stub(this.actionsManager.httpService, 'getAbsolute')
        .callsFake((url) => Promise.reject(new Error('Dummy error.')));

      const actionResponse = await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.calledOnceWithExactly(
        this.httpServiceGetAbsolute,
        this.renderAction.url
      );
      sinon.assert.calledOnceWithExactly(
        this.alertServiceAlert,
        errorProcessingActionMessage
      );
      expect(actionResponse.error.message).to.eq(errorProcessingActionMessage);
    });

    it('should return a response if payload is valid', async function () {
      const actionResponse = await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      expect(actionResponse).to.have.property('item');
      expect(actionResponse.item.payload.content.title).to.eq('Testing');
    });

    it('should return undefined if payload is invalid', async function () {
      sandbox
        .stub(this.actionsManager, 'payloadByDecryptingResponse')
        .returns(null);

      const actionResponse = await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );
      expect(actionResponse).to.be.undefined;
    });

    it('should return undefined and alert if payload could not be decrypted and auth_params are missing', async function () {
      const itemPayload = new PurePayload({
        uuid: Factory.generateUuid(),
      });

      sandbox
        .stub(this.actionsManager.httpService, 'getAbsolute')
        .resolves({ item: itemPayload });
      sandbox
        .stub(this.actionsManager.protocolService, 'payloadByDecryptingPayload')
        .returns({ errorDecrypting: true });

      const actionResponse = await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.calledOnceWithExactly(
        this.alertServiceAlert,
        errorDecryptingRevisionMessage
      );
      expect(actionResponse).to.be.undefined;
    });

    it('should try previous passwords and prompt for other passwords', async function () {
      /** Using a custom action that returns a payload with an invalid items_key_id. */
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.renderAction = extensionItem.actions.filter(
        (action) => action.verb === 'render'
      )[1];

      await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      sinon.assert.called(this.passwordRequestHandler);
    }).timeout(20000);

    it('should return decrypted payload if password is valid', async function () {
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.renderAction = extensionItem.actions.filter(
        (action) => action.verb === 'render'
      )[0];
      const actionResponse = await this.actionsManager.runAction(
        this.renderAction,
        this.noteItem,
        this.passwordRequestHandler
      );

      expect(actionResponse.item).to.be.ok;
      expect(actionResponse.item.title).to.be.equal('Testing');
    }).timeout(20000);
  });

  describe('show action', async function () {
    const sandbox = sinon.createSandbox();

    before(async function () {
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.showAction = extensionItem.actions[2];
    });

    beforeEach(async function () {
      this.actionsManager.deviceInterface.openUrl = (url) => url;
      this.deviceInterfaceOpenUrl = sandbox.spy(
        this.actionsManager.deviceInterface,
        'openUrl'
      );
    });

    this.afterEach(async function () {
      sandbox.restore();
    });

    it('should open the action url', async function () {
      const response = await this.actionsManager.runAction(this.showAction);

      sandbox.assert.calledOnceWithExactly(
        this.deviceInterfaceOpenUrl,
        this.showAction.url
      );
      expect(response).to.eql({});
    });
  });

  describe('post action', async function () {
    const sandbox = sinon.createSandbox();

    before(async function () {
      this.noteItem = await this.itemManager.createItem(ContentType.Note, {
        title: 'Excuse Me',
        text: 'Time To Be King 8)',
      });
      this.extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.extensionItem = await this.actionsManager.loadExtensionInContextOfItem(
        this.extensionItem,
        this.noteItem
      );

      this.decryptedPostAction = this.extensionItem.actions.filter(
        (action) => action.access_type === 'decrypted' && action.verb === 'post'
      )[0];

      this.encryptedPostAction = this.extensionItem.actions.filter(
        (action) => action.access_type === 'encrypted' && action.verb === 'post'
      )[0];
    });

    beforeEach(async function () {
      this.alertServiceAlert = sandbox.spy(
        this.actionsManager.alertService,
        'alert'
      );
      this.windowAlert = sandbox
        .stub(window, 'alert')
        .callsFake((message) => message);
      this.httpServicePostAbsolute = sandbox.stub(
        this.actionsManager.httpService,
        'postAbsolute'
      );
      this.httpServicePostAbsolute.callsFake((url, params) =>
        Promise.resolve(params)
      );
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should include generic encrypted payload within request body', async function () {
      const response = await this.actionsManager.runAction(
        this.encryptedPostAction,
        this.noteItem
      );

      expect(response.items[0].enc_item_key).to.satisfy((string) => {
        return string.startsWith(
          this.application.protocolService.getLatestVersion()
        );
      });
      expect(response.items[0].uuid).to.eq(this.noteItem.uuid);
      expect(response.items[0].auth_hash).to.not.be.ok;
      expect(response.items[0].content_type).to.be.ok;
      expect(response.items[0].created_at).to.be.ok;
      expect(response.items[0].content).to.satisfy((string) => {
        return string.startsWith(
          this.application.protocolService.getLatestVersion()
        );
      });
    });

    it('should include generic decrypted payload within request body', async function () {
      const response = await this.actionsManager.runAction(
        this.decryptedPostAction,
        this.noteItem
      );

      expect(response.items[0].uuid).to.eq(this.noteItem.uuid);
      expect(response.items[0].enc_item_key).to.not.be.ok;
      expect(response.items[0].auth_hash).to.not.be.ok;
      expect(response.items[0].content_type).to.be.ok;
      expect(response.items[0].created_at).to.be.ok;
      expect(response.items[0].content.title).to.eq(this.noteItem.title);
      expect(response.items[0].content.text).to.eq(this.noteItem.text);
    });

    it('should post to the action url', async function () {
      this.httpServicePostAbsolute.restore();
      const response = await this.actionsManager.runAction(
        this.decryptedPostAction,
        this.noteItem
      );

      expect(response).to.be.ok;
      expect(response.uuid).to.eq(this.noteItem.uuid);
      expect(response.result).to.eq('Action POSTed successfully.');
    });

    it('should alert if an error occurred while processing the action', async function () {
      this.httpServicePostAbsolute.restore();
      const dummyError = new Error('Dummy error.');

      sandbox
        .stub(this.actionsManager.httpService, 'postAbsolute')
        .callsFake((url, params) => Promise.reject(dummyError));

      const response = await this.actionsManager.runAction(
        this.decryptedPostAction,
        this.noteItem
      );

      sinon.assert.calledOnceWithExactly(
        this.alertServiceAlert,
        errorProcessingActionMessage
      );
      expect(response).to.be.eq(dummyError);
    });
  });

  describe('nested action', async function () {
    const sandbox = sinon.createSandbox();

    before(async function () {
      const extensionItem = await this.itemManager.findItem(
        this.extensionItemUuid
      );
      this.nestedAction = extensionItem.actions.filter(
        (action) => action.verb === 'nested'
      )[0];
    });

    beforeEach(async function () {
      this.actionsManagerRunAction = sandbox.spy(
        this.actionsManager,
        'runAction'
      );
      this.httpServiceRunHttp = sandbox.spy(
        this.actionsManager.httpService,
        'runHttp'
      );
      this.actionResponse = await this.actionsManager.runAction(
        this.nestedAction
      );
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should return undefined', async function () {
      expect(this.actionResponse).to.be.undefined;
    });

    it('should call runAction once', async function () {
      sandbox.assert.calledOnce(this.actionsManagerRunAction);
    });

    it('should not make any http requests', async function () {
      sandbox.assert.notCalled(this.httpServiceRunHttp);
    });
  });
});
