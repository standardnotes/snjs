/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("duplication", () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const syncOptions = {
    checkIntegrity: true
  }

  before(async function() {
    localStorage.clear();
  })

  after(async function() {
    localStorage.clear();
  })

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password
    });
  })

  afterEach(async function() {
    expect(this.application.syncManager.isOutOfSync()).to.equal(false);
    const rawPayloads = await this.application.storageManager.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
  })

  function createDirtyPayload(contentType) {
    const params = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: contentType,
      content: {
        foo: 'bar'
      }
    };
    const payload = CreateMaxPayloadFromAnyObject({
      object: params,
      override: {
        dirty: true
      }
    });
    return payload;
  }

  it('components should not be duplicated under any circumstances', async function() {
    const payload = createDirtyPayload(ContentTypes.Component);
    const item = await this.application.modelManager.mapPayloadToLocalItem({
      payload: payload
    })
    this.expectedItemCount++;
    await this.application.syncManager.sync();

    /** Conflict the item */
    item.content.foo = 'zar';
    item.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(item);
    await this.application.syncManager.sync();
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('items keys should not be duplicated under any circumstances', async function() {
    const payload = createDirtyPayload(ContentTypes.ItemsKey);
    const item = await this.application.modelManager.mapPayloadToLocalItem({
      payload: payload
    })
    this.expectedItemCount++;
    await this.application.syncManager.sync();

    /** Conflict the item */
    item.content.foo = 'zar';
    item.updated_at = Factory.yesterday();
    await this.application.modelManager.setItemDirty(item);
    await this.application.syncManager.sync();
    expect(this.application.modelManager.allItems.length).to.equal(this.expectedItemCount);
  });
});
