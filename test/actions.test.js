/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('actions service', () => {
  before(async function () {
    // Set timeout for all tests.
    this.timeout(Factory.TestTimeout);

    localStorage.clear();

    this.application = await Factory.createInitAppWithRandNamespace();
    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    await Factory.registerUserToApplication({
      application: this.application,
      email: email,
      password: password
    });

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

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_1/', (request, params) => {
      const item = Factory.createNotePayload({
        title: 'New title.',
        text: 'New text.'
      });

      request.respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ item }));
    });

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_2/', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ]);

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_3/', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
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

  beforeEach(async function () {
    this.itemManager = this.application.itemManager;
    this.actionsManager = this.application.actionsManager;
  });

  afterEach(function () {
    
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

    this.afterEach(async function () {
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

  xit('should run render action', async function () {

  });

  xit('should run show action', async function () {

  });

  xit('should run post action', async function () {

  });
});
