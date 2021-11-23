/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('notes and tags', () => {
  const BASE_ITEM_COUNT = 2; /** Default items key, user preferences */

  const syncOptions = {
    checkIntegrity: true,
    awaitAll: true,
  };

  beforeEach(async function () {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await Factory.safeDeinit(this.application);
  });

  it('uses proper class for note', async function () {
    const payload = Factory.createNotePayload();
    await this.application.itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    expect(note.constructor === SNNote).to.equal(true);
  });

  it('properly constructs syncing params', async function () {
    const title = 'Foo';
    const text = 'Bar';
    const note = await this.application.createTemplateItem(ContentType.Note, {
      title,
      text,
    });

    expect(note.content.title).to.equal(title);
    expect(note.content.text).to.equal(text);

    const tag = await this.application.createTemplateItem(ContentType.Tag, {
      title,
    });

    expect(tag.title).to.equal(title);
  });

  it('properly handles legacy relationships', async function () {
    // legacy relationships are when a note has a reference to a tag
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    const mutatedTag = CreateMaxPayloadFromAnyObject(tagPayload, {
      content: {
        ...tagPayload.safeContent,
        references: null,
      },
    });
    const mutatedNote = CreateMaxPayloadFromAnyObject(notePayload, {
      content: {
        references: [
          {
            uuid: tagPayload.uuid,
            content_type: tagPayload.content_type,
          },
        ],
      },
    });

    await this.application.itemManager.emitItemsFromPayloads(
      [mutatedNote, mutatedTag],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(1);
    expect(
      this.application.itemManager.itemsReferencingItem(tag.uuid).length
    ).to.equal(1);
  });

  it('creates relationship between note and tag', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload({ dirty: false });
    const notePayload = pair[0];
    const tagPayload = pair[1];

    expect(notePayload.content.references.length).to.equal(0);
    expect(tagPayload.content.references.length).to.equal(1);

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.notes[0];
    let tag = this.application.itemManager.tags[0];

    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    expect(note.hasRelationshipWithItem(tag)).to.equal(false);
    expect(tag.hasRelationshipWithItem(note)).to.equal(true);

    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(1);
    expect(note.payload.safeReferences.length).to.equal(0);
    expect(tag.noteCount).to.equal(1);

    note = await this.application.itemManager.setItemToBeDeleted(note.uuid);
    tag = this.application.itemManager.tags[0];

    expect(note.dirty).to.be.true;
    expect(tag.dirty).to.be.true;
    await this.application.syncService.sync(syncOptions);
    expect(tag.content.references.length).to.equal(0);
    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(0);
    expect(tag.noteCount).to.equal(0);

    note = this.application.itemManager.notes[0];
    tag = this.application.itemManager.tags[0];
    expect(note).to.not.be.ok;
    expect(tag.dirty).to.be.false;
  });

  it('handles remote deletion of relationship', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      pair,
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    await this.application.syncService.sync(syncOptions);

    const mutatedTag = CreateMaxPayloadFromAnyObject(tagPayload, {
      dirty: false,
      content: {
        ...tagPayload.safeContent,
        references: [],
      },
    });
    await this.application.itemManager.emitItemsFromPayloads(
      [mutatedTag],
      PayloadSource.LocalChanged
    );

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.content.references.length).to.equal(0);
    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(0);
    expect(tag.noteCount).to.equal(0);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('creating basic note should have text set', async function () {
    const note = await Factory.createMappedNote(this.application);
    expect(note.title).to.be.ok;
    expect(note.text).to.be.ok;
  });

  it('creating basic tag should have title', async function () {
    const tag = await Factory.createMappedTag(this.application);
    expect(tag.title).to.be.ok;
  });

  it('handles removing relationship between note and tag', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(note.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(1);

    tag = await this.application.changeAndSaveItem(
      tag.uuid,
      (mutator) => {
        mutator.removeItemAsRelationship(note);
      },
      undefined,
      undefined,
      syncOptions
    );

    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(0);
    expect(tag.noteCount).to.equal(0);
  });

  it('properly handles tag duplication', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    await this.application.itemManager.emitItemsFromPayloads(
      pair,
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.notes[0];
    let tag = this.application.itemManager.tags[0];

    const duplicateTag = await this.application.itemManager.duplicateItem(
      tag.uuid,
      true
    );
    await this.application.syncService.sync(syncOptions);

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.uuid).to.not.equal(duplicateTag.uuid);
    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);
    expect(duplicateTag.content.references.length).to.equal(1);
    expect(duplicateTag.noteCount).to.equal(1);

    const noteTags = this.application.itemManager.itemsReferencingItem(
      note.uuid
    );
    expect(noteTags.length).to.equal(2);

    const noteTag1 = noteTags[0];
    const noteTag2 = noteTags[1];
    expect(noteTag1.uuid).to.not.equal(noteTag2.uuid);

    // expect to be false
    expect(note.dirty).to.not.be.ok;
    expect(tag.dirty).to.not.be.ok;
  });

  it('duplicating a note should maintain its tag references', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    const duplicateNote = await this.application.itemManager.duplicateItem(
      note.uuid,
      true
    );
    expect(note.uuid).to.not.equal(duplicateNote.uuid);

    expect(
      this.application.itemManager.itemsReferencingItem(duplicateNote.uuid)
        .length
    ).to.equal(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    );
  });

  it('deleting a note should update tag references', async function () {
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    const note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    expect(tag.content.references.length).to.equal(1);
    expect(tag.noteCount).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(
      this.application.itemManager.itemsReferencingItem(note.uuid).length
    ).to.equal(1);

    await this.application.itemManager.setItemToBeDeleted(tag.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);
    expect(tag.content).to.not.be.ok;
  });

  it('modifying item content should not modify payload content', async function () {
    const notePayload = Factory.createNotePayload();
    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    note = await this.application.changeAndSaveItem(
      note.uuid,
      (mutator) => {
        mutator.content.title = Math.random();
      },
      undefined,
      undefined,
      syncOptions
    );
    expect(note.content.title).to.not.equal(notePayload.content.title);
  });

  it('deleting a tag should not dirty notes', async function () {
    // Tags now reference notes, but it used to be that tags referenced notes and notes referenced tags.
    // After the change, there was an issue where removing an old tag relationship from a note would only
    // remove one way, and thus keep it intact on the visual level.
    const pair = Factory.createRelatedNoteTagPairPayload();
    const notePayload = pair[0];
    const tagPayload = pair[1];

    await this.application.itemManager.emitItemsFromPayloads(
      [notePayload, tagPayload],
      PayloadSource.LocalChanged
    );
    let note = this.application.itemManager.getItems([ContentType.Note])[0];
    let tag = this.application.itemManager.getItems([ContentType.Tag])[0];

    await this.application.syncService.sync(syncOptions);
    await this.application.itemManager.setItemToBeDeleted(tag.uuid);

    note = this.application.itemManager.findItem(note.uuid);
    tag = this.application.itemManager.findItem(tag.uuid);

    expect(tag.dirty).to.equal(true);
    expect(note.dirty).to.not.be.ok;
  });

  it('should sort notes', async function () {
    await Promise.all(
      ['Y', 'Z', 'A', 'B'].map(async (title) => {
        return this.application.insertItem(
          await this.application.createTemplateItem(ContentType.Note, { title })
        );
      })
    );
    this.application.setNotesDisplayCriteria(
      NotesDisplayCriteria.Create({
        sortProperty: 'title',
        sortDirection: 'dsc',
      })
    );
    const titles = this.application
      .getDisplayableItems(ContentType.Note)
      .map((note) => note.title);
    expect(titles).to.deep.equal(['A', 'B', 'Y', 'Z']);
  });

  it('setting a note dirty should collapse its properties into content', async function () {
    let note = await this.application.createTemplateItem(ContentType.Note, {
      title: 'Foo',
    });
    await this.application.insertItem(note);
    note = this.application.itemManager.findItem(note.uuid);
    expect(note.content.title).to.equal('Foo');
  });

  describe('Tags', function () {
    it('should sort tags in ascending alphabetical order by default', async function () {
      const titles = ['1', 'A', 'a', 'b', '1', '2', 'B'];
      const sortedTitles = titles.sort((a, b) => a.localeCompare(b));
      await Promise.all(
        titles.map((title) => this.application.findOrCreateTag(title))
      );
      expect(
        this.application
          .getDisplayableItems(ContentType.Tag)
          .map((t) => t.title)
      ).to.deep.equal(sortedTitles);
    });

    it('should sort tags in reverse alphabetical order', async function () {
      const titles = ['1', 'A', 'a', 'b', '1', '2', 'B'];
      const sortedTitles = titles.sort((a, b) => b.localeCompare(a));
      await Promise.all(
        titles.map((title) => this.application.findOrCreateTag(title))
      );
      this.application.setDisplayOptions(ContentType.Tag, 'title', 'asc');
      expect(
        this.application
          .getDisplayableItems(ContentType.Tag)
          .map((t) => t.title)
      ).to.deep.equal(sortedTitles);
    });

    it('should match a tag', async function () {
      const taggedNote = await Factory.createMappedNote(this.application);
      const tag = await this.application.findOrCreateTag('A');
      await this.application.changeItem(tag.uuid, (mutator) => {
        mutator.addItemAsRelationship(taggedNote);
      });
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'dsc',
          tags: [tag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes.length).to.equal(1);
      expect(displayedNotes[0].uuid).to.equal(taggedNote.uuid);
    });

    it('should not show trashed notes when displaying a tag', async function () {
      const taggedNote = await Factory.createMappedNote(this.application);
      const trashedNote = await Factory.createMappedNote(this.application);
      const tag = await this.application.findOrCreateTag('A');
      await this.application.changeItem(tag.uuid, (mutator) => {
        mutator.addItemAsRelationship(taggedNote);
        mutator.addItemAsRelationship(trashedNote);
      });
      await this.application.changeItem(trashedNote.uuid, (mutator) => {
        mutator.trashed = true;
      });
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'dsc',
          tags: [tag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes.length).to.equal(1);
      expect(displayedNotes[0].uuid).to.equal(taggedNote.uuid);
    });

    it('should sort notes when displaying tag', async function () {
      await Promise.all(
        ['Y', 'Z', 'A', 'B'].map(async (title) => {
          return this.application.insertItem(
            await this.application.createTemplateItem(ContentType.Note, {
              title,
            })
          );
        })
      );
      const Bnote = this.application.itemManager.notes.find(
        (note) => note.title === 'B'
      );
      await this.application.changeItem(Bnote.uuid, (mutator) => {
        mutator.pinned = true;
      });
      const tag = await this.application.findOrCreateTag('A');
      await this.application.changeItem(tag.uuid, (mutator) => {
        for (const note of this.application.itemManager.notes) {
          mutator.addItemAsRelationship(note);
        }
      });

      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'dsc',
          tags: [tag],
        })
      );

      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.have.length(4);
      expect(displayedNotes[0].title).to.equal('B');
      expect(displayedNotes[1].title).to.equal('A');
    });
  });

  describe('Smart tags', function () {
    it('"title", "startsWith", "Foo"', async function () {
      const note = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'Foo 🎲',
        })
      );
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'Not Foo 🎲',
        })
      );
      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Foo Notes',
          predicate: {
            keypath: 'title',
            operator: 'startsWith',
            value: 'Foo',
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );

      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(note.uuid);
    });

    it('"pinned", "=", true', async function () {
      const note = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(note.uuid, (mutator) => {
        mutator.pinned = true;
      });
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'B',
          pinned: false,
        })
      );
      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Pinned',
          predicate: {
            keypath: 'pinned',
            operator: '=',
            value: true,
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );

      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(note.uuid);
    });

    it('"pinned", "=", false', async function () {
      const pinnedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(pinnedNote.uuid, (mutator) => {
        mutator.pinned = true;
      });
      const unpinnedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'B',
        })
      );
      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Not pinned',
          predicate: {
            keypath: 'pinned',
            operator: '=',
            value: false,
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );

      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(unpinnedNote.uuid);
    });

    it('"text.length", ">", 500', async function () {
      const longNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
          text: Array(501).fill(0).join(''),
        })
      );
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'B',
          text: 'b',
        })
      );
      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Long',
          predicate: {
            keypath: 'text.length',
            operator: '>',
            value: 500,
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(longNote.uuid);
    });

    it('"updated_at", ">", "1.days.ago"', async function () {
      await Factory.registerUserToApplication({
        application: this.application,
        email: Factory.generateUuid(),
        password: Factory.generateUuid(),
      });
      const recentNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.sync();
      const olderNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'B',
          text: 'b',
        })
      );
      await this.application.changeItem(olderNote.uuid, (mutator) => {
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        mutator.updated_at = new Date(Date.now() - threeDays);
      });

      /** Create an unsynced note which shouldn't get an updated_at */
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'B',
          text: 'b',
        })
      );
      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'One day ago',
          predicate: {
            keypath: 'serverUpdatedAt',
            operator: '>',
            value: '1.days.ago',
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(recentNote.uuid);
    });

    it('"tags.length", "=", 0', async function () {
      const untaggedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      const taggedNote = await Factory.createMappedNote(this.application);
      const tag = await this.application.findOrCreateTag('A');
      await this.application.changeItem(tag.uuid, (mutator) => {
        mutator.addItemAsRelationship(taggedNote);
      });

      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Untagged',
          predicate: {
            keypath: 'tags.length',
            operator: '=',
            value: 0,
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(untaggedNote.uuid);
    });

    it('"tags", "includes", ["title", "startsWith", "b"]', async function () {
      const taggedNote = await Factory.createMappedNote(this.application);
      const tag = await this.application.findOrCreateTag('B');
      await this.application.changeItem(tag.uuid, (mutator) => {
        mutator.addItemAsRelationship(taggedNote);
      });
      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );

      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'B-tags',
          predicate: {
            keypath: 'tags',
            operator: 'includes',
            value: ['title', 'startsWith', 'B'],
          },
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(taggedNote.uuid);
    });

    it('"ignored", "and", [["pinned", "=", true], ["locked", "=", true]]', async function () {
      const pinnedAndLockedNote = await Factory.createMappedNote(
        this.application
      );
      await this.application.changeItem(pinnedAndLockedNote.uuid, (mutator) => {
        mutator.pinned = true;
        mutator.locked = true;
      });

      const pinnedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(pinnedNote.uuid, (mutator) => {
        mutator.pinned = true;
      });

      const lockedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(lockedNote.uuid, (mutator) => {
        mutator.locked = true;
      });

      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Pinned & Locked',
          predicate: SNPredicate.FromArray([
            'ignored',
            'and',
            [
              ['pinned', '=', true],
              ['locked', '=', true],
            ],
          ]),
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'title',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes).to.deep.equal(matches);
      expect(matches.length).to.equal(1);
      expect(matches[0].uuid).to.equal(pinnedAndLockedNote.uuid);
    });

    it('"ignored", "or", [["content.protected", "=", true], ["pinned", "=", true]]', async function () {
      const protectedNote = await Factory.createMappedNote(this.application);
      await this.application.changeItem(protectedNote.uuid, (mutator) => {
        mutator.protected = true;
      });

      const pinnedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(pinnedNote.uuid, (mutator) => {
        mutator.pinned = true;
      });

      const pinnedAndProtectedNote = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );
      await this.application.changeItem(
        pinnedAndProtectedNote.uuid,
        (mutator) => {
          mutator.pinned = true;
          mutator.protected = true;
        }
      );

      await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.Note, {
          title: 'A',
        })
      );

      const smartTag = await this.application.insertItem(
        await this.application.createTemplateItem(ContentType.SmartTag, {
          title: 'Protected or Pinned',
          predicate: SNPredicate.FromArray([
            'ignored',
            'or',
            [
              ['content.protected', '=', true],
              ['pinned', '=', true],
            ],
          ]),
        })
      );
      const matches = this.application.notesMatchingSmartTag(smartTag);
      this.application.setNotesDisplayCriteria(
        NotesDisplayCriteria.Create({
          sortProperty: 'created_at',
          sortDirection: 'asc',
          tags: [smartTag],
        })
      );
      const displayedNotes = this.application.getDisplayableItems(
        ContentType.Note
      );
      expect(displayedNotes.length).to.equal(matches.length);
      expect(matches.length).to.equal(3);
      expect(matches.find((note) => note.uuid === protectedNote.uuid)).to.exist;
      expect(matches.find((note) => note.uuid === pinnedNote.uuid)).to.exist;
      expect(matches.find((note) => note.uuid === pinnedAndProtectedNote.uuid))
        .to.exist;
    });
  });

  it('include notes that have tag titles that match search query', async function () {
    const [notePayload1, tagPayload1] = Factory.createRelatedNoteTagPairPayload({
      noteTitle: 'A simple note',
      noteText: 'This is just a note.',
      tagTitle: 'Test'
    });
    const notePayload2 = Factory.createNotePayload('Foo');
    const notePayload3 = Factory.createNotePayload('Bar');
    const notePayload4 = Factory.createNotePayload('Testing');

    await this.application.itemManager.emitItemsFromPayloads(
      [
        notePayload1,
        notePayload2,
        notePayload3,
        notePayload4,
        tagPayload1
      ],
      PayloadSource.LocalChanged
    );

    this.application.setNotesDisplayCriteria(
      NotesDisplayCriteria.Create({
        sortProperty: 'title',
        sortDirection: 'dsc',
        searchQuery: {
          query: 'Test',
        }
      })
    );

    const displayedNotes = this.application.getDisplayableItems(
      ContentType.Note
    );
    expect(displayedNotes.length).to.equal(2);
    expect(displayedNotes[0].uuid).to.equal(notePayload1.uuid);
    expect(displayedNotes[1].uuid).to.equal(notePayload4.uuid);
  });

  it('search query should be case insensitive and match notes and tags title', async function () {
    const [notePayload1, tagPayload1] = Factory.createRelatedNoteTagPairPayload({
      noteTitle: 'A simple note',
      noteText: 'Just a note. Nothing to see.',
      tagTitle: 'Foo'
    });
    const notePayload2 = Factory.createNotePayload('Another bar (foo)');
    const notePayload3 = Factory.createNotePayload('Testing FOO (Bar)');
    const notePayload4 = Factory.createNotePayload('This should not match');

    await this.application.itemManager.emitItemsFromPayloads(
      [
        notePayload1,
        notePayload2,
        notePayload3,
        notePayload4,
        tagPayload1
      ],
      PayloadSource.LocalChanged
    );

    this.application.setNotesDisplayCriteria(
      NotesDisplayCriteria.Create({
        sortProperty: 'title',
        sortDirection: 'dsc',
        searchQuery: {
          query: 'foo',
        }
      })
    );

    const displayedNotes = this.application.getDisplayableItems(
      ContentType.Note
    );
    expect(displayedNotes.length).to.equal(3);
    expect(displayedNotes[0].uuid).to.equal(notePayload1.uuid);
    expect(displayedNotes[1].uuid).to.equal(notePayload2.uuid);
    expect(displayedNotes[2].uuid).to.equal(notePayload3.uuid);
  });
});
