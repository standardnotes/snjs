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

    const actionExtension = {
      identifier: 'org.standardnotes.testing',
      name: 'Test extension',
      content_type: 'Extension',
      url: 'http://my-extension.sn.org/install/',
      description: 'For testing purposes.',
      supported_types: [
        'Note'
      ],
      actions: [
        {
          label: 'Action #1',
          url: 'http://my-extension.sn.org/action_1/',
          verb: 'get',
          context: 'Item',
          content_types: [
            'Note'
          ]
        },
        {
          label: 'Action #2',
          url: 'http://my-extension.sn.org/action_2/',
          verb: 'render',
          context: 'Item',
          content_types: [
            'Note'
          ]
        },
        {
          label: 'Action #3',
          url: 'http://my-extension.sn.org/action_3/',
          verb: 'show',
          context: 'Item',
          content_types: [
            'Note'
          ]
        },
        {
          label: 'Action #4',
          url: 'http://my-extension.sn.org/action_4/',
          verb: 'post',
          context: 'Item',
          content_types: [
            'Note'
          ],
          access_type: 'decrypted'
        },
      ]
    };

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/install/', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify(actionExtension)
    ]);

    this.fakeServer.respondWith('GET', 'http://my-extension.sn.org/action_1/', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({})
    ]);

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
  });

  beforeEach(async () => {
    
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
    // Extension item
    await this.application.itemManager.createItem(
      ContentType.ActionsExtension,
      {
        url: 'http://my-extension.sn.org/install'
      }
    );

    // Note item
    await this.application.itemManager.createItem(
      ContentType.Note,
      {
        content: {
          title: 'A simple note',
          text: 'Standard Notes rocks! lml.'
        }
      }
    );
    const extensions = this.application.actionsManager.getExtensions();
    expect(extensions.length).to.eq(1);
  });

  it('testing sinonjs mock server', async function () {
    const callback = sinon.spy();
    const response = await this.application.httpService.getAbsolute('http://my-extension.sn.org/install');
    callback(response);

    sinon.assert.calledOnce(callback);
    expect(response.identifier).to.eq('org.standardnotes.testing');
    expect(this.fakeServer.requests.length).to.eq(1);
  });
});
