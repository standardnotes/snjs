/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('actions service', () => {
  before(async function () {
    // Set timeout for all tests.
    this.timeout(20000);

    localStorage.clear();

    this.application = await Factory.createInitAppWithRandNamespace();
    this.itemManager = this.application.itemManager;
    this.actionsManager = this.application.actionsManager;
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    await Factory.registerUserToApplication({
      application: this.application,
      email: email,
      password: password
    });

    const rootKey = await this.application.protocolService.createRootKey(email, password);
    this.authParams = rootKey.keyParams.content;

    this.fakeServer = sinon.fakeServer.create();
    this.fakeServer.respondImmediately = true;

    this.actionsExtension = {
      identifier: 'org.standardnotes.testing',
      name: 'Test extension',
      content_type: 'Extension',
      url: 'http://my-extension.sn.org/get_actions/',
      description: 'For testing purposes.',
      supported_types: [
        'Note'
      ],
      actions: [
        {
          label: 'Action #1',
          url: 'http://my-extension.sn.org/action_1/',
          verb: 'get',
          context: '*',
          content_types: [
            'Note'
          ]
        },
        {
          label: 'Action #2',
          url: 'http://my-extension.sn.org/action_2/',
          verb: 'render',
          context: 'Note',
          content_types: [
            'Note'
          ]
        },
        {
          label: 'Action #3',
          url: 'http://my-extension.sn.org/action_3/',
          verb: 'show',
          context: 'Tag',
          content_types: [
            'Note'
          ]
        },
      ]
    };

    this.fakeServer.respondWith('GET', /http:\/\/my-extension.sn.org\/get_actions\/(.*)/, (request, params) => {
      const urlParams = new URLSearchParams(params);
      const extension = this.actionsExtension;

      if (urlParams.has('item_uuid')) {
        extension.actions.push({
          label: 'Action #4',
          url: `http://my-extension.sn.org/action_4/?item_uuid=${urlParams.get('item_uuid')}`,
          verb: 'post',
          context: 'Item',
          content_types: [
            'Note'
          ],
          access_type: 'decrypted'
        });
      }

      request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(extension));
    });

    this.fakeServer.respondWith('GET', /http:\/\/my-extension.sn.org\/action_[1,2]\/(.*)/, (request, params) => {
      const item = new PurePayload(
        {
          uuid: Factory.generateUuid(),
          content_type: ContentType.Note,
          content: {
            title: 'Testing'
          }
        }
      );

      request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({
        item,
        auth_params: this.authParams
      }));
    });

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_3/', [
      200,
      { 'Content-Type': 'text/html; charset=utf-8' },
      '<h2>Action #3</h2>'
    ]);

    this.fakeServer.respondWith('POST', 'http://my-extension.sn.org/action_4/', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ]);

    // Extension item
    const extensionItem = await this.application.itemManager.createItem(
      ContentType.ActionsExtension,
      this.actionsExtension
    );
    this.extensionItemUuid = extensionItem.uuid;
  });

  after(function () {
    this.fakeServer.restore();
    this.application.deinit();
    this.application = null;
    localStorage.clear();
  });

  it('should get extension items', async function () {
    await this.itemManager.createItem(
      ContentType.Note,
      {
        title: 'A simple note',
        text: 'Standard Notes rocks! lml.'
      }
    );
    const extensions = this.actionsManager.getExtensions();
    expect(extensions.length).to.eq(1);
  });

  it('should get extensions in context of item', async function () {
    const noteItem = await this.itemManager.createItem(
      ContentType.Note,
      {
        title: 'Another note',
        text: 'Whiskey In The Jar'
      }
    );

    const noteItemExtensions = this.actionsManager.extensionsInContextOfItem(noteItem);
    expect(noteItemExtensions.length).to.eq(1);
    expect(noteItemExtensions[0].supported_types).to.include(noteItem.content_type);
  });

  it('should get actions based on item context', async function () {
    const tagItem = await this.itemManager.createItem(
      ContentType.Tag,
      {
        title: 'Music'
      }
    );

    const extensionItem = await this.itemManager.findItem(this.extensionItemUuid);
    const tagActions = extensionItem.actionsWithContextForItem(tagItem);

    expect(tagActions.length).to.eq(1);
    expect(tagActions.map(action => action.label)).to.have.members(['Action #3']);
  });

  it('should load extension in context of item', async function () {
    const noteItem = await this.itemManager.createItem(
      ContentType.Note,
      {
        title: 'Yet another note',
        text: 'And all things will end ♫'
      }
    );

    const extensionItem = await this.itemManager.findItem(this.extensionItemUuid);

    const extensionWithItem = await this.actionsManager.loadExtensionInContextOfItem(extensionItem, noteItem);
    const updatedExtensionItem = await this.itemManager.findItem(this.extensionItemUuid);
    
    expect(extensionWithItem).to.eq(updatedExtensionItem);
    const extensions = this.actionsManager.getExtensions();
    expect(extensions[0].actions.map(action => action.label)).to.include('Action #4');
  });

  describe('get action', async function () {
    const sandbox = sinon.createSandbox();
    const confirmMessage = 'Are you sure you want to replace the current note ' +
                          'contents with this action\'s results?';

    before(async function () {
      this.noteItem = await this.itemManager.createItem(
        ContentType.Note,
        {
          title: 'Know what?',
          text: 'To Live is to Die'
        }
      );
      const extensionItem = await this.itemManager.findItem(this.extensionItemUuid);
      this.getAction = extensionItem.actions[0];
    });

    beforeEach(async function () {
      this.passwordRequestHandler = sandbox.spy();
      this.confirmAlertService = sandbox.spy(this.actionsManager.alertService, 'confirm');
      this.windowConfirm = sandbox.stub(window, 'confirm').callsFake((message) => true);
      this.syncServiceSync = sandbox.spy(this.actionsManager.syncService, 'sync');
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should be canceled if requested', async function () {
      this.windowConfirm.callsFake((message) => false);

      const actionResponse = await this.actionsManager.runAction(this.getAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.calledOnce(this.confirmAlertService);
      sinon.assert.calledOnceWithExactly(this.windowConfirm, confirmMessage);
      expect(actionResponse.error.message).to.eq('Action canceled by user.');
      sinon.assert.notCalled(this.syncServiceSync);
    });

    it('should show a confirmation message', async function () {
      await this.actionsManager.runAction(this.getAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.calledOnce(this.confirmAlertService);
      sinon.assert.calledOnceWithExactly(this.windowConfirm, confirmMessage);
    });

    it('should return response and item keys', async function () {
      const actionResponse = await this.actionsManager.runAction(this.getAction, this.noteItem, this.passwordRequestHandler);

      expect(Object.keys(actionResponse)).to.have.members(['response', 'item']);
    });

    it('should perform a sync request', async function () {
      await this.actionsManager.runAction(this.getAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.calledOnce(this.syncServiceSync);
    });

    it('should not change the item', async function () {
      await this.actionsManager.runAction(this.getAction, this.noteItem, this.passwordRequestHandler);
      const refreshedNoteItem = await this.itemManager.findItem(this.noteItem.uuid);

      expect(this.noteItem).to.eq(refreshedNoteItem);
    });
  });

  describe('render action', async function () {
    const sandbox = sinon.createSandbox();
    const errorRenderMessageResponse = 'An issue occurred while processing this action. Please try again.';
    const errorDecryptingRevisionMessage = 'We were unable to decrypt this revision using your current keys, ' +
                                          'and this revision is missing metadata that would allow us to try different ' +
                                          'keys to decrypt it. This can likely be fixed with some manual intervention. ' +
                                          'Please email hello@standardnotes.org for assistance.';

    before(async function () {
      this.noteItem = await this.itemManager.createItem(
        ContentType.Note,
        {
          title: 'Hey',
          text: 'Welcome To Paradise'
        }
      );
      const extensionItem = await this.itemManager.findItem(this.extensionItemUuid);
      this.renderAction = extensionItem.actions[1];
    });

    beforeEach(async function () {
      this.alertServiceAlert = sandbox.spy(this.actionsManager.alertService, 'alert');
      this.windowAlert = sandbox.stub(window, 'alert').callsFake((message) => message);
      this.passwordRequestHandler = () => 'previous-password';
    });

    afterEach(async function () {
      sandbox.restore();
    });

    it('should show an alert if the request fails', async function () {
      this.httpServiceGetAbsolute = sandbox.stub(this.actionsManager.httpService, 'getAbsolute')
        .callsFake((url) => Promise.reject(new Error('Dummy error.')));

      const actionResponse = await this.actionsManager.runAction(this.renderAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.calledOnceWithExactly(this.httpServiceGetAbsolute, this.renderAction.url);
      sinon.assert.calledOnceWithExactly(this.alertServiceAlert, errorRenderMessageResponse);
      expect(actionResponse.error.message).to.eq(errorRenderMessageResponse);
    });

    it('should return a response if payload is valid', async function () {
      const actionResponse = await this.actionsManager.runAction(this.renderAction, this.noteItem, this.passwordRequestHandler);

      expect(actionResponse).to.have.property('response');
      expect(actionResponse.response.item.content.title).to.eq('Testing');
      expect(actionResponse).to.have.property('item');
      expect(actionResponse.item.payload.content).to.eql(actionResponse.response.item.content);
    });

    it('should return undefined if payload is invalid', async function () {
      sandbox.stub(this.actionsManager, 'payloadByDecryptingResponse').returns(null);

      const actionResponse = await this.actionsManager.runAction(this.renderAction, this.noteItem, this.passwordRequestHandler);
      expect(actionResponse).to.be.undefined;
    });

    it('should return undefined and alert if could not decrypt', async function () {
      const itemPayload = new PurePayload({
        uuid: Factory.generateUuid()
      });

      sandbox.stub(this.actionsManager.httpService, 'getAbsolute')
        .resolves({ item: itemPayload });
      sandbox.stub(this.actionsManager.protocolService, 'payloadByDecryptingPayload')
        .returns({ errorDecrypting: true });

      const actionResponse = await this.actionsManager.runAction(this.renderAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.calledOnceWithExactly(this.alertServiceAlert, errorDecryptingRevisionMessage);
      expect(actionResponse).to.be.undefined;
    });

    it.skip('should return undefined when decrypting a payload and all passwords have already been tried', async function () {
      sandbox.stub(this.actionsManager.protocolService, 'payloadByDecryptingPayload')
        .returns({ errorDecrypting: true });

      const actionResponse = await this.actionsManager.runAction(this.renderAction, this.noteItem, this.passwordRequestHandler);

      sinon.assert.called(this.passwordRequestHandler);
      expect(actionResponse).to.be.undefined;
    });
  });

  describe('show action', async function () {
    const sandbox = sinon.createSandbox();

    before(async function () {
      const extensionItem = await this.itemManager.findItem(this.extensionItemUuid);
      this.showAction = extensionItem.actions[2];
    });

    beforeEach(async function () {
      this.actionsManager.deviceInterface.openUrl = (url) => url;
      this.deviceInterfaceOpenUrl = sandbox.spy(this.actionsManager.deviceInterface, 'openUrl');
    });

    this.afterEach(async function () {
      sandbox.restore();
    });

    it('should open the action url', async function () {
      const actionResponse = await this.actionsManager.runAction(this.showAction);

      sandbox.assert.calledOnceWithExactly(this.deviceInterfaceOpenUrl, this.showAction.url);
      expect(actionResponse.response).to.be.undefined;
    });
  });

  xit('should run post action', async function () {

  });
});
