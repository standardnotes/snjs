/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('duplication', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
  });

  afterEach(async function () {
    expect(this.application.syncService.isOutOfSync()).to.equal(false);
    const rawPayloads = await this.application.storageService.getAllRawPayloads();
    expect(rawPayloads.length).to.equal(this.expectedItemCount);
    await this.application.deinit();
  });

  function createDirtyPayload(contentType) {
    const params = {
      uuid: Uuid.GenerateUuidSynchronously(),
      content_type: contentType,
      content: {
        foo: 'bar',
      },
    };
    const payload = CreateMaxPayloadFromAnyObject(params, {
      dirty: true,
      dirtiedDate: new Date(),
    });
    return payload;
  }

  it('components should not be duplicated under any circumstances', async function () {
    const payload = createDirtyPayload(ContentType.Component);
    const item = await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;
    await this.application.syncService.sync(syncOptions);

    await this.application.changeAndSaveItem(
      item.uuid,
      (mutator) => {
        /** Conflict the item */
        mutator.content.foo = 'zar';
        mutator.updated_at = Factory.yesterday();
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );
  });

  it('items keys should not be duplicated under any circumstances', async function () {
    const payload = createDirtyPayload(ContentType.ItemsKey);
    const item = await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;
    await this.application.syncService.sync(syncOptions);

    await this.application.changeAndSaveItem(
      item.uuid,
      (mutator) => {
        /** Conflict the item */
        mutator.content.foo = 'zar';
        mutator.updated_at = Factory.yesterday();
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(this.application.itemManager.items.length).to.equal(
      this.expectedItemCount
    );
  });

  it('duplicating note should maintain editor ref', async function () {
    const note = await Factory.createSyncedNote(this.application);
    this.expectedItemCount++;
    const basePayload = createDirtyPayload(ContentType.Component);
    const payload = CopyPayload(basePayload, {
      content: {
        ...basePayload.content,
        area: ComponentArea.Editor,
      },
    });
    const editor = await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    this.expectedItemCount++;
    await this.application.syncService.sync(syncOptions);

    await this.application.changeAndSaveItem(
      editor.uuid,
      (mutator) => {
        mutator.associateWithItem(note.uuid);
      },
      undefined,
      undefined,
      syncOptions
    );

    expect(this.application.componentManager.editorForNote(note)).to.be.ok;

    /** Conflict the note */
    await this.application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.content.title = 'zar';
        mutator.updated_at = Factory.yesterday();
      },
      undefined,
      undefined,
      syncOptions
    );
    this.expectedItemCount++;

    const duplicate = this.application.itemManager.notes.find((n) => {
      return n.uuid !== note.uuid;
    });
    expect(duplicate).to.be.ok;
    expect(this.application.componentManager.editorForNote(duplicate)).to.be.ok;
  });
});
