import { NotesDisplayCriteria } from './../protocol/collection/notes_display_criteria';
import { SNNote } from '@Lib/models';
import { FillItemContent } from '@Models/functions';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { SNTag } from '@Models/app/tag';
import { PayloadManager } from './payload_manager';
import { ItemManager, SNItem, Uuid } from '@Lib/index';
import { ContentType } from '@standardnotes/common';

const setupRandomUuid = () => {
  Uuid.SetGenerators(
    () => Promise.resolve(String(Math.random())),
    () => String(Math.random())
  );
};

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
      await itemManager.setTagParent(parent, child);

      const changedChild = itemManager.findItem(child.uuid) as SNTag;
      expect(changedChild.parentId).toBe(parent.uuid);
    });

    it('forbids a tag to be its own parent', async () => {
      itemManager = createService();
      const tag = createTag('tag');
      await itemManager.insertItems([tag]);

      expect(() => itemManager.setTagParent(tag, tag)).toThrow();
      expect(itemManager.getTagParent(tag.uuid)).toBeUndefined();
    });

    it('forbids a tag to be its own ancestor', async () => {
      itemManager = createService();
      const grandParent = createTag('grandParent');
      const parent = createTag('parent');
      const child = createTag('child');

      await itemManager.insertItems([child, parent, grandParent]);
      await itemManager.setTagParent(parent, child);
      await itemManager.setTagParent(grandParent, parent);

      expect(() => itemManager.setTagParent(child, grandParent)).toThrow();
      expect(itemManager.getTagParent(grandParent.uuid)).toBeUndefined();
    });

    it('getTagParent', async () => {
      itemManager = createService();
      const parent = createTag('parent');
      const child = createTag('child');
      await itemManager.insertItems([parent, child]);
      await itemManager.setTagParent(parent, child);

      expect(itemManager.getTagParent(child.uuid)?.uuid).toBe(parent.uuid);
    });

    it('isAncestor', async () => {
      itemManager = createService();
      const grandParent = createTag('grandParent');
      const parent = createTag('parent');
      const child = createTag('child');
      const another = createTag('another');

      await itemManager.insertItems([child, parent, grandParent, another]);
      await itemManager.setTagParent(parent, child);
      await itemManager.setTagParent(grandParent, parent);

      expect(itemManager.isTagAncestor(grandParent.uuid, parent.uuid)).toEqual(
        true
      );
      expect(itemManager.isTagAncestor(grandParent.uuid, child.uuid)).toEqual(
        true
      );
      expect(itemManager.isTagAncestor(parent.uuid, child.uuid)).toEqual(true);

      expect(
        itemManager.isTagAncestor(parent.uuid, grandParent.uuid)
      ).toBeFalsy();
      expect(
        itemManager.isTagAncestor(child.uuid, grandParent.uuid)
      ).toBeFalsy();
      expect(
        itemManager.isTagAncestor(grandParent.uuid, grandParent.uuid)
      ).toBeFalsy();

      expect(
        itemManager.isTagAncestor(another.uuid, grandParent.uuid)
      ).toBeFalsy();
      expect(itemManager.isTagAncestor(child.uuid, another.uuid)).toBeFalsy();
      expect(
        itemManager.isTagAncestor(grandParent.uuid, another.uuid)
      ).toBeFalsy();
    });

    it('unsetTagRelationship', async () => {
      itemManager = createService();
      const parent = createTag('parent');
      const child = createTag('child');
      await itemManager.insertItems([parent, child]);
      await itemManager.setTagParent(parent, child);
      expect(itemManager.getTagParent(child.uuid)?.uuid).toBe(parent.uuid);

      await itemManager.unsetTagParent(child);

      expect(itemManager.getTagParent(child.uuid)).toBeUndefined();
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
      await itemManager.setTagParent(parent, child);
      await itemManager.setTagParent(grandParent, parent);
      await itemManager.setTagParent(greatGrandParent, grandParent);

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
      await itemManager.setTagParent(parentTag, childTag);

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

    it('adding a note to a tag hierarchy should add the note to its parent too', async () => {
      itemManager = createService();
      const parentTag = createTag('parent');
      const childTag = createTag('child');
      const note = createNote('note');

      await itemManager.insertItems([parentTag, childTag, note]);
      await itemManager.setTagParent(parentTag, childTag);

      await itemManager.addTagHierarchyToNote(note, childTag);

      const tags = itemManager.getSortedTagsForNote(note);

      expect(tags).toHaveLength(2);
      expect(tags[0].uuid).toEqual(childTag.uuid);
      expect(tags[1].uuid).toEqual(parentTag.uuid);
    });
  });

  describe('template items', () => {
    it('create template item', async () => {
      itemManager = createService();
      setupRandomUuid();

      const item = await itemManager.createTemplateItem(ContentType.Note, {
        title: 'hello',
        references: [],
      });

      expect(!!item).toEqual(true);
      /* Template items should never be added to the record */
      expect(itemManager.items).toHaveLength(0);
      expect(itemManager.notes).toHaveLength(0);
    });

    it('isTemplateItem return the correct value', async () => {
      itemManager = createService();
      setupRandomUuid();

      const item = await itemManager.createTemplateItem(ContentType.Note, {
        title: 'hello',
        references: [],
      });

      expect(itemManager.isTemplateItem(item)).toEqual(true);

      await itemManager.insertItem(item);

      expect(itemManager.isTemplateItem(item)).toEqual(false);
    });
  });
});
