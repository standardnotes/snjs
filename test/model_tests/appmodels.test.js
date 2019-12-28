import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
var expect = chai.expect;

describe('app models', () => {
  let sharedCreatedItem;

  const createModelManager = async () => {
    const isolatedApplication = await Factory.createInitAppWithRandNamespace();
    return isolatedApplication.modelManager;
  }

  const application = Factory.createApplication();
  before(async () => {
    await Factory.initializeApplication(application);
  });

  it('lodash merge should behave as expected', () => {
    var a = {
      content: {
        references: [{a: "a"}]
      }
    }

    var b = {
      content: {
        references: [ ]
      }
    }

    // merging a with b should replace total content
    deepMerge(a, b);
    expect(a.content.references).to.eql([]);
  });

  it('modelManager should be defined', () => {
    expect(application.modelManager).to.not.be.null;
  });

  it('item should be defined', () => {
    expect(SFItem).to.not.be.null;
  });

  it('item content should be assigned', () => {
    var params = Factory.createStorageItemNotePayload();
    var item = new SFItem(params);
    expect(item.content.title).to.equal(params.content.title);
  });

  it('should default updated_at to 1970 and created_at to the present', () => {
    var params = Factory.createStorageItemNotePayload();
    var item = new SFItem(params);
    let epoch = new Date(0);
    expect(item.updated_at - epoch).to.equal(0);
    expect(item.created_at - epoch).to.be.above(0);
    expect(new Date() - item.created_at).to.be.below(5); // < 5ms
  });

  it('adding item to modelmanager should add it to its items', async () => {
    sharedCreatedItem = await Factory.createMappedNote(application.modelManager);
    application.modelManager.addItem(sharedCreatedItem);
    expect(application.modelManager.items.length).to.equal(1);
    expect(application.modelManager.allItems.length).to.equal(1);
    expect(application.modelManager.allItemsMatchingTypes([sharedCreatedItem.content_type]).length).to.equal(1);
    expect(application.modelManager.validItemsForContentType([sharedCreatedItem.content_type]).length).to.equal(1);
  });

  it('find added item', () => {
    var result = application.modelManager.findItem(sharedCreatedItem.uuid);
    expect(result.uuid).to.equal(sharedCreatedItem.uuid);
  });

  it('removing item from modelmanager should remove it from its items', () => {
    application.modelManager.removeItemLocally(sharedCreatedItem);
    expect(application.modelManager.items.length).to.equal(0);
  });

  it('handles delayed mapping', async () => {
    let modelManager = await createModelManager();
    var params1 = Factory.createStorageItemNotePayload();
    var params2 = Factory.createStorageItemNotePayload();

    params1.content.references = [{
      uuid: params2.uuid,
      content_type: params2.content_type
    }];

    await modelManager.mapPayloadsToLocalModels({payloads: [params1]});
    await modelManager.mapPayloadsToLocalModels({payloads: [params2]});

    var item1 = modelManager.findItem(params1.uuid);
    var item2 = modelManager.findItem(params2.uuid);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(0);

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(1);
  });

  it('mapping item without uuid should not map it', async () => {
    let modelManager = await createModelManager();
    var params1 = Factory.createStorageItemNotePayload();
    params1.uuid = null;

    await modelManager.mapPayloadsToLocalModels({payloads: [params1]});
    expect(modelManager.allItems.length).to.equal(0);
  });

  it('mapping an item twice shouldnt cause problems', async () => {
    let modelManager = await createModelManager();
    var payload = Factory.createStorageItemNotePayload();
    payload.content.foo = "bar";

    let items = await modelManager.mapPayloadsToLocalModels({payloads: [payload]});
    let item = items[0];
    expect(item).to.not.be.null;

    items = await modelManager.mapPayloadsToLocalModels({payloads: [payload]});
    item = items[0];

    expect(item.content.foo).to.equal("bar");
    expect(modelManager.notes.length).to.equal(1);
  });

  it('mapping item twice should preserve references', async () => {
    let modelManager = await createModelManager();
    var item1 = await Factory.createMappedNote(modelManager);
    var item2 = await Factory.createMappedNote(modelManager);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);

    const updatedPayload = Factory.itemToStoragePayload(item1);
    await modelManager.mapPayloadsToLocalModels({payloads: [updatedPayload]});

    expect(item1.content.references.length).to.equal(1);
  });

  it('fixes relationship integrity', async () => {
    let modelManager = await createModelManager();
    var item1 = await Factory.createMappedNote(modelManager);
    var item2 = await Factory.createMappedNote(modelManager);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    // damage references of one object
    item1.content.references = [];
    const updatedPayload = Factory.itemToStoragePayload(item1);
    await modelManager.mapPayloadsToLocalModels({payloads: [updatedPayload]});

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(1);
  });

  it('creating and removing relationships between two items should have valid references', async () => {
    let modelManager = await createModelManager();
    var item1 = await Factory.createMappedNote(modelManager);
    var item2 = await Factory.createMappedNote(modelManager);
    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    expect(item1.referencingObjects).to.include(item2);
    expect(item2.referencingObjects).to.include(item1);

    item1.removeItemAsRelationship(item2);
    item2.removeItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(0);
  });

  it('notifies observers of item uuid alternation', async () => {
    let modelManager = await createModelManager();
    var item1 = await Factory.createMappedNote(modelManager);

    return new Promise((resolve, reject) => {
      modelManager.addModelUuidChangeObserver("test", (oldItem, newItem) => {
        expect(oldItem.uuid).to.not.equal(newItem.uuid);
        resolve();
      })

      modelManager.alternateUUIDForItem(item1);
    })
  });

  it('properly duplicates item with no relationships', async () => {
    const modelManager = await createModelManager();
    const item = await Factory.createMappedNote(modelManager);
    const duplicate = modelManager.duplicateItemAndAdd(item);
    expect(duplicate.uuid).to.not.equal(item.uuid);
    expect(item.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(item.created_at).to.equal(duplicate.created_at);
    expect(item.content_type).to.equal(duplicate.content_type);
  });

  it('properly duplicates item with relationships', async () => {
    const modelManager = await createModelManager();

    const item1 = await Factory.createMappedNote(modelManager);
    const item2 = await Factory.createMappedNote(modelManager);

    item1.addItemAsRelationship(item2);

    expect(item1.referencedObjects.length).to.equal(1);
    expect(item2.referencingObjects.length).to.equal(1);

    const duplicate = modelManager.duplicateItemAndAdd(item1);
    expect(duplicate.uuid).to.not.equal(item1.uuid);
    expect(item1.referencedObjects.length).to.equal(1);
    expect(duplicate.referencingObjects.length).to.equal(item1.referencingObjects.length);
    expect(duplicate.referencedObjects.length).to.equal(item1.referencedObjects.length);

    expect(item1.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(item1.created_at).to.equal(duplicate.created_at);
    expect(item1.content_type).to.equal(duplicate.content_type);

    expect(duplicate.content.references.length).to.equal(1);

    expect(item2.referencingObjects.length).to.equal(2);
    expect(item2.referencedObjects.length).to.equal(0);
  });

  it('properly handles single item uuid alternation', async () => {
    const modelManager = await createModelManager();
    const item1 = await Factory.createMappedNote(modelManager);
    const item2 = await Factory.createMappedNote(modelManager);

    item1.addItemAsRelationship(item2);

    expect(item1.content.references.length).to.equal(1);
    expect(item1.referencedObjects.length).to.equal(1);
    expect(item2.referencingObjects.length).to.equal(1);

    const alternatedItem = await modelManager.alternateUUIDForItem(item1);
    // they should not be same reference
    expect(item1.content === alternatedItem.content).to.equal(false);
    expect(item1.content.references === alternatedItem.content.references).to.equal(false);
    expect(item1.uuid).to.not.equal(alternatedItem.uuid);

    expect(modelManager.notes.length).to.equal(2);

    // item1 references should be discarded
    expect(item1.content.references.length).to.equal(0);

    expect(alternatedItem.content.references.length).to.equal(1);
    expect(alternatedItem.referencingObjects.length).to.equal(0);
    expect(alternatedItem.referencedObjects.length).to.equal(1);

    expect(item2.referencingObjects.length).to.equal(1);

    expect(alternatedItem.hasRelationshipWithItem(item2)).to.equal(true);
    expect(alternatedItem.dirty).to.equal(true);
  });

  it('properly handles mutli item uuid alternation', async () => {
    const modelManager = await createModelManager();
    const item1 = await Factory.createMappedNote(modelManager);
    const item2 = await Factory.createMappedNote(modelManager);
    modelManager.addItem(item1);
    modelManager.addItem(item2);

    item1.addItemAsRelationship(item2);

    expect(item2.referencingObjects.length).to.equal(1);

    const alternatedItem1 = await modelManager.alternateUUIDForItem(item1);
    const alternatedItem2 = await modelManager.alternateUUIDForItem(item2);

    expect(modelManager.allItems.length).to.equal(2);

    expect(item1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(item2.uuid).to.not.equal(alternatedItem2.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references[0].uuid).to.equal(alternatedItem2.uuid);
    expect(alternatedItem2.content.references.length).to.equal(0);

    expect(alternatedItem2.referencingObjects.length).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(alternatedItem2)).to.equal(true);
    expect(alternatedItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(false);
    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('maintains referencing relationships when duplicating', async () => {
    const modelManager = await createModelManager();
    const tag = await Factory.createMappedTag(modelManager);
    const note = await Factory.createMappedNote(modelManager);
    tag.addItemAsRelationship(note);

    expect(tag.content.references.length).to.equal(1);

    const noteCopy = modelManager.duplicateItemAndAdd(note);
    expect(note.uuid).to.not.equal(noteCopy.uuid);

    expect(modelManager.notes.length).to.equal(2);
    expect(modelManager.tags.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(noteCopy.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(2);
  });

  it('when importing items, imported values should not be used to determine if changed', async () => {
    /*
      If you have a note and a tag, and the tag has 1 reference to the note,
      and you import the same two items, except modify the note value so that a duplicate is created,
      we expect only the note to be duplicated, and the tag not to.
      However, if only the note changes, and you duplicate the note, which causes the tag's references content to change,
      then when the incoming tag is being processed, it will also think it has changed, since our local value now doesn't match
      what's coming in. The solution is to get all values ahead of time before any changes are made.
    */
    const modelManager = await createModelManager();
    const tag = await Factory.createMappedTag(modelManager);
    const note = await Factory.createMappedNote(modelManager);

    tag.addItemAsRelationship(note);

    const externalNote = Object.assign(
      {},
      {content: note.getContentCopy(), content_type: note.content_type}
    );
    externalNote.uuid = note.uuid;
    externalNote.content.text = `${Math.random()}`;

    const externalTag = Object.assign(
      {},
      {content: tag.getContentCopy(), content_type: tag.content_type}
    );
    externalTag.uuid = tag.uuid;

    await modelManager.importItemsFromRaw([externalNote, externalTag]);

    // We expect now that the total item count is 3, not 4.
    expect(modelManager.allItems.length).to.equal(3);
    expect(tag.content.references.length).to.equal(2);
  });
});
