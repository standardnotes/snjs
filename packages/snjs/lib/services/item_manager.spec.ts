import { NotesDisplayCriteria } from './../protocol/collection/notes_display_criteria';
import { SNNote } from '@Lib/models';
import { FillItemContent } from '@Models/functions';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { SNTag } from '@Models/app/tag';
import { PayloadManager } from './payload_manager';
import { ItemManager, SNItem } from '@Lib/index';
import { ContentType } from '@standardnotes/common';

describe('itemManager', () => {
  let payloadManager: PayloadManager;
  let itemManager: ItemManager;
  let items: SNItem[];

  const createService = () => {
    return new ItemManager(payloadManager);
  };

  beforeEach(() => {
    payloadManager = new PayloadManager();

    items = [] as jest.Mocked<SNItem[]>;
    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.getItems = jest.fn().mockReturnValue(items);
    itemManager.createItem = jest.fn();
    itemManager.changeComponent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SNItem>);
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();
    itemManager.changeItem = jest.fn();
    itemManager.changeFeatureRepo = jest.fn();

    const dateToLocalizedString = jest.spyOn(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SNItem.prototype as any,
      'dateToLocalizedString'
    );
    dateToLocalizedString.mockImplementation(() => {
      return undefined;
    });
  });

  const createTag = (title: string) => {
    return new SNTag(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Tag,
        content: FillItemContent({
          title: title,
        }),
      })
    );
  };

  const createNote = (title: string) => {
    return new SNNote(
      CreateMaxPayloadFromAnyObject({
        uuid: String(Math.random()),
        content_type: ContentType.Note,
        content: FillItemContent({
          title: title,
        }),
      })
    );
  };

  describe('note display criteria', () => {
    it('viewing notes with tag', async () => {
      itemManager = createService();
      const tag = createTag('parent');
      const note = createNote('note');
      await itemManager.insertItems([tag, note]);
      await itemManager.addTagToNote(note, tag);

      const criteria = NotesDisplayCriteria.Create({
        tags: [tag],
      });
      itemManager.setNotesDisplayCriteria(criteria);

      const notes = itemManager.getDisplayableItems(ContentType.Note);
      expect(notes).toHaveLength(1);
    });
  });

  describe('tag relationships', () => {
    it('updates parentId of child tag', async () => {
      itemManager = createService();
      const parent = createTag('parent');
      const child = createTag('child');
      await itemManager.insertItems([parent, child]);
      await itemManager.establishTagRelationship(parent, child);

      const changedChild = itemManager.findItem(child.uuid) as SNTag;
      expect(changedChild.parentId).toBe(parent.uuid);
    });

    it('getTagParent', async () => {
      itemManager = createService();
      const parent = createTag('parent');
      const child = createTag('child');
      await itemManager.insertItems([parent, child]);
      await itemManager.establishTagRelationship(parent, child);

      expect(itemManager.getTagParent(child.uuid)?.uuid).toBe(parent.uuid);
    });

    it('getTagParentChain', async () => {
      itemManager = createService();
      const greatGrandParent = createTag('greatGrandParent');
      const grandParent = createTag('grandParent');
      const parent = createTag('parent');
      const child = createTag('child');
      await itemManager.insertItems([
        greatGrandParent,
        grandParent,
        parent,
        child,
      ]);
      await itemManager.establishTagRelationship(parent, child);
      await itemManager.establishTagRelationship(grandParent, parent);
      await itemManager.establishTagRelationship(greatGrandParent, grandParent);

      const uuidChain = itemManager
        .getTagParentChain(child.uuid)
        .map((tag) => tag.uuid);

      expect(uuidChain).toHaveLength(3);
      expect(uuidChain).toEqual([
        greatGrandParent.uuid,
        grandParent.uuid,
        parent.uuid,
      ]);
    });

    it('viewing notes for parent tag should not display notes of children', async () => {
      itemManager = createService();
      const parentTag = createTag('parent');
      const childTag = createTag('child');
      await itemManager.insertItems([parentTag, childTag]);
      await itemManager.establishTagRelationship(parentTag, childTag);

      const parentNote = createNote('parentNote');
      const childNote = createNote('childNote');
      await itemManager.insertItems([parentNote, childNote]);

      await itemManager.addTagToNote(parentNote, parentTag);
      await itemManager.addTagToNote(childNote, childTag);

      const criteria = NotesDisplayCriteria.Create({
        tags: [parentTag],
      });
      itemManager.setNotesDisplayCriteria(criteria);

      const notes = itemManager.getDisplayableItems(ContentType.Note);
      expect(notes).toHaveLength(1);
    });
  });
});
