/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('note display criteria', function () {
  before(async function () {
    const crypto = new SNWebCrypto();
    Uuid.SetGenerators(
      crypto.generateUUIDSync,
      crypto.generateUUID
    );
  });

  beforeEach(function () {
    this.modelManager = new PayloadManager();
    this.itemManager = new ItemManager(this.modelManager);

    this.createNote = async () => {
      return this.itemManager.createItem(
        ContentType.Note,
        {
          title: 'hello',
          text: 'world'
        }
      );
    };

    this.createTag = async (notes = [], title = 'thoughts') => {
      const references = notes.map((note) => {
        return {
          uuid: note.uuid,
          content_type: note.content_type
        };
      });
      return this.itemManager.createItem(
        ContentType.Tag,
        {
          title: title,
          references: references
        }
      );
    };
  });

  const emptyCollection = function () {
    const collection = new ItemCollection();
    collection.setDisplayOptions(
      ContentType.Note,
      CollectionSort.CreatedAt,
      'asc'
    );
    return collection;
  }

  const collectionWithNotes = function (titles = [], bodies = []) {
    const collection = emptyCollection();
    const notes = [];
    titles.forEach((title, index) => {
      notes.push(CreateItemFromPayload(Factory.createNotePayload(title, bodies[index])));
    })
    collection.set(notes);
    return collection;
  }

  it('display criteria copying', async function () {
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includeArchived = true;
    });
    const copy = NotesDisplayCriteria.Copy(criteria);
    expect(copy.includeArchived).to.equal(true);
  });

  it('string query title', async function () {
    const query = "foo";
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.searchQuery = { query: query };
    });
    const collection = collectionWithNotes(['hello', 'fobar', 'foobar', 'foo']);
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2);
  });

  it('string query text', async function () {
    const query = "foo";
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.searchQuery = { query: query };
    });
    const collection = collectionWithNotes(
      [undefined, undefined, undefined, undefined],
      ['hello', 'fobar', 'foobar', 'foo']
    );
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2);
  });

  it('string query title and text', async function () {
    const query = "foo";
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.searchQuery = { query: query };
    });
    const collection = collectionWithNotes(['hello', 'foobar'], ['foo', 'fobar']);
    expect(notesMatchingCriteria(criteria, collection).length).to.equal(2);
  });

  it('includePinned off', async function () {
    await this.createNote();
    const pendingPin = await this.createNote();
    await this.itemManager.changeItem(
      pendingPin.uuid,
      (mutator) => {
        mutator.pinned = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includePinned = false;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1);
  });

  it('includePinned on', async function () {
    await this.createNote();
    const pendingPin = await this.createNote();
    await this.itemManager.changeItem(
      pendingPin.uuid,
      (mutator) => {
        mutator.pinned = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includePinned = true;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2);
  });

  it('includeTrashed off', async function () {
    await this.createNote();
    const pendingTrash = await this.createNote();
    await this.itemManager.changeItem(
      pendingTrash.uuid,
      (mutator) => {
        mutator.trashed = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includeTrashed = false;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1);
  });

  it('includeTrashed on', async function () {
    await this.createNote();
    const pendingTrash = await this.createNote();
    await this.itemManager.changeItem(
      pendingTrash.uuid,
      (mutator) => {
        mutator.trashed = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includeTrashed = true;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2);
  });

  it('includeArchived off', async function () {
    await this.createNote();
    const pendingArchive = await this.createNote();
    await this.itemManager.changeItem(
      pendingArchive.uuid,
      (mutator) => {
        mutator.archived = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includeArchived = false;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1);
  });

  it('includeArchived on', async function () {
    await this.createNote();
    const pendingArchive = await this.createNote();
    await this.itemManager.changeItem(
      pendingArchive.uuid,
      (mutator) => {
        mutator.archived = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.includeArchived = true;
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(2);
  });

  it('protectedSearchEnabled false', async function () {
    const normal = await this.createNote();
    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.protected = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.searchQuery = { query: 'world', protectedBodySearch: false };
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(0);
  });

  it('protectedSearchEnabled true', async function () {
    const normal = await this.createNote();
    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.protected = true;
      }
    );
    const criteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.searchQuery = { query: 'world', protectedBodySearch: true };
    });
    expect(notesMatchingCriteria(criteria, this.itemManager.collection).length).to.equal(1);
  });

  it('tags', async function () {
    const note = await this.createNote();
    const tag = await this.createTag([note]);
    const looseTag = await this.createTag([], 'loose');

    const matchingCriteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.tags = [tag];
    });
    expect(notesMatchingCriteria(matchingCriteria, this.itemManager.collection).length).to.equal(1);

    const nonmatchingCriteria = NotesDisplayCriteria.CreateCriteria((criteria) => {
      criteria.tags = [looseTag];
    });
    expect(notesMatchingCriteria(nonmatchingCriteria, this.itemManager.collection).length).to.equal(0);
  });

  it('smart tags', async function () {
    const systemTags = this.itemManager.systemSmartTags;
    const allTag = systemTags.find(t => t.isAllTag);
    const trashTag = systemTags.find(t => t.isTrashTag);
    const archivedTag = systemTags.find(t => t.isArchiveTag);

    const normal = await this.createNote();

    /** Note is normal */
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
      }), this.itemManager.collection).length
    ).to.equal(0);


    /** Note is trashed */
    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = true;
      }
    );

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
      }), this.itemManager.collection).length
    ).to.equal(0);


    /** Note is archived */

    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = false;
        mutator.archived = true;
      }
    );
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
      }), this.itemManager.collection).length
    ).to.equal(1);

    /** Note is archived and trashed */

    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = true;
        mutator.archived = true;
      }
    );
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
      }), this.itemManager.collection).length
    ).to.equal(0);
  });


  it('includeTrash', async function () {
    const systemTags = this.itemManager.systemSmartTags;
    const allTag = systemTags.find(t => t.isAllTag);
    const trashTag = systemTags.find(t => t.isTrashTag);
    const archivedTag = systemTags.find(t => t.isArchiveTag);

    const normal = await this.createNote();

    /** Note is normal */
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    /** Note is trashed */
    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = true;
      }
    );

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeTrashed = false;
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    /** Note is archived and trashed */

    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = true;
        mutator.archived = true;
      }
    );
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
        criteria.includeTrashed = true;
      }), this.itemManager.collection).length
    ).to.equal(1);
  });

  it('includeArchived', async function () {
    const systemTags = this.itemManager.systemSmartTags;
    const allTag = systemTags.find(t => t.isAllTag);
    const trashTag = systemTags.find(t => t.isTrashTag);
    const archivedTag = systemTags.find(t => t.isArchiveTag);

    const normal = await this.createNote();

    /** Note is normal */
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    /** Note is archived */
    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.archived = true;
      }
    );

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeArchived = false;
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
        criteria.includeArchived = false;
      }), this.itemManager.collection).length
    ).to.equal(1);

    /** Note is archived and trashed */

    await this.itemManager.changeItem(
      normal.uuid,
      (mutator) => {
        mutator.trashed = true;
        mutator.archived = true;
      }
    );
    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [allTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(0);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [trashTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(1);

    expect(
      notesMatchingCriteria(NotesDisplayCriteria.CreateCriteria((criteria) => {
        criteria.tags = [archivedTag];
        criteria.includeArchived = true;
      }), this.itemManager.collection).length
    ).to.equal(0);
  });

});
