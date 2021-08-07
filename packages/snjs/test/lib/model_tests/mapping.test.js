import { PayloadSource, CreateMaxPayloadFromAnyObject, CreateSourcedPayloadFromObject } from '@Lib/index';
import { ContentType } from '@Lib/models';
import * as Factory from '../../factory';

describe('model manager mapping', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  it('mapping nonexistent item creates it', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount++;
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('mapping nonexistent deleted item doesnt create it', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = CreateMaxPayloadFromAnyObject(Factory.createNoteParams(), {
      dirty: false,
      deleted: true,
    });
    await application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    expect(application.itemManager.items.length).toBe(BASE_ITEM_COUNT);
  });

  it('mapping with omitted content should preserve item content', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    /** content is omitted to simulate handling saved_items sync success. */
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const originalNote = application.itemManager.notes[0];
    expect(originalNote.content.title).toBe(payload.content.title);
    const mutated = CreateSourcedPayloadFromObject(
      payload,
      PayloadSource.RemoteSaved
    );
    await application.itemManager.emitItemsFromPayloads(
      [mutated],
      PayloadSource.LocalChanged
    );
    const sameNote = application.itemManager.notes[0];
    expect(sameNote.content.title).toBe(payload.content.title);
  });

  it('mapping and deleting nonexistent item creates and deletes it', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount++;
    expect(application.itemManager.items.length).toBe(expectedItemCount);

    const changedParams = CreateMaxPayloadFromAnyObject(payload, {
      dirty: false,
      deleted: true,
    });
    expectedItemCount--;
    await application.itemManager.emitItemsFromPayloads(
      [changedParams],
      PayloadSource.LocalChanged
    );
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('mapping deleted but dirty item should not delete it', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount++;

    let item = application.itemManager.items[0];
    item = await application.itemManager.changeItem(
      item.uuid,
      (mutator) => {
        mutator.setDeleted();
      }
    );
    const payload2 = CreateMaxPayloadFromAnyObject(item);
    await application.itemManager.emitItemsFromPayloads(
      [payload2],
      PayloadSource.LocalChanged
    );
    expect(application.itemManager.items.length).toBe(expectedItemCount);
  });

  it('mapping existing item updates its properties', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );

    const newTitle = 'updated title';
    const mutated = CreateMaxPayloadFromAnyObject(payload, {
      content: {
        ...payload.safeContent,
        title: newTitle,
      },
    });
    await application.itemManager.emitItemsFromPayloads(
      [mutated],
      PayloadSource.LocalChanged
    );
    const item = application.itemManager.notes[0];

    expect(item.content.title).toBe(newTitle);
  });

  it('setting an item dirty should retrieve it in dirty items', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const note = application.itemManager.notes[0];
    await application.itemManager.setItemDirty(note.uuid);
    const dirtyItems = application.itemManager.getDirtyItems();
    expect(dirtyItems.length).toBe(1);
  });

  it('set all items dirty', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const count = 10;
    let expectedItemCount = BASE_ITEM_COUNT;
    expectedItemCount += count;
    const payloads = [];
    for (let i = 0; i < count; i++) {
      payloads.push(Factory.createNotePayload());
    }
    await application.itemManager.emitItemsFromPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    await application.syncService.markAllItemsAsNeedingSync();

    const dirtyItems = application.itemManager.getDirtyItems();
    expect(dirtyItems.length).toBe(expectedItemCount);
  });

  it('sync observers should be notified of changes', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const payload = Factory.createNotePayload();
    await application.itemManager.emitItemsFromPayloads(
      [payload],
      PayloadSource.LocalChanged
    );
    const item = application.itemManager.items[0];
    return new Promise((resolve) => {
      application.itemManager.addObserver(
        ContentType.Any,
        (changed, inserted, discarded, _ignored) => {
          expect(changed[0].uuid === item.uuid);
          resolve();
        }
      );
      application.itemManager.emitItemsFromPayloads(
        [payload],
        PayloadSource.LocalChanged
      );
    });
  });
});
