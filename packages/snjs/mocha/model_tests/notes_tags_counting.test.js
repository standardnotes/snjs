/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Notes Counting in Tags', () => {
  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await Factory.safeDeinit(this.application);
  });

  it('should not count notes that are archived when the setting is not set.', async function () {
    // The user create a note and tag
    const [
      noteArchived,
      noteRegular,
      noteTrashed1,
      noteTrashed2,
    ] = await Promise.all([
      Factory.createNote(this.application, 'a note archived', 'some content'),
      Factory.createNote(this.application, 'a regular note', 'some content'),
      Factory.createNote(
        this.application,
        'a note trashed (1)',
        'some content'
      ),
      Factory.createNote(
        this.application,
        'a note trashed (2)',
        'some content'
      ),
    ]);

    const tag = await this.application.findOrCreateTag('a new tag');
    await Promise.all([
      this.application.addTagHierarchyToNote(noteArchived, tag),
      this.application.addTagHierarchyToNote(noteRegular, tag),
      this.application.addTagHierarchyToNote(noteTrashed1, tag),
      this.application.addTagHierarchyToNote(noteTrashed2, tag),
    ]);

    const criteria = NotesDisplayCriteria.Create({
      includeArchived: false,
      includeTrashed: false,
    });

    // The user configure the app to NOT show archived notes and NOT show trashed notes
    await this.application.setNotesDisplayCriteria(criteria);

    // The tag counts all the notes for now, they are regular
    let count = await this.application.countDisplayableNotesInTag(tag.uuid);
    expect(count).to.equal(4);

    // The user archive one note
    await Factory.archiveNote(this.application, noteArchived);

    // The user trashes the notes
    await Factory.trashNote(this.application, noteTrashed1);
    await Factory.trashNote(this.application, noteTrashed2);

    // Now the tag counts 1 note
    count = await this.application.countDisplayableNotesInTag(tag.uuid);
    expect(count).to.equal(1);

    // The user configure the app to SHOW archived notes
    await this.application.setNotesDisplayCriteria(
      criteria.copy({ includeArchived: true })
    );

    // Now the tag counts the archived note
    count = await this.application.countDisplayableNotesInTag(tag.uuid);
    expect(count).to.equal(2);

    // The user configure the app to show trashed notes
    await this.application.setNotesDisplayCriteria(
      criteria.copy({ includeTrashed: true })
    );

    // The tag counts the trashed notes
    count = await this.application.countDisplayableNotesInTag(tag.uuid);
    expect(count).to.equal(3);

    // The user configure the app to show archived and trashed
    await this.application.setNotesDisplayCriteria(
      criteria.copy({ includeArchived: true, includeTrashed: true })
    );

    // The tag counts all the notes now
    count = await this.application.countDisplayableNotesInTag(tag.uuid);
    expect(count).to.equal(4);
  });
});
