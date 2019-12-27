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
    SFItem.deepMerge(a, b);
    expect(a.content.references).to.eql([]);
  });

  it('modelManager should be defined', () => {
    expect(application.modelManager).to.not.be.null;
  });

  it('item should be defined', () => {
    expect(SFItem).to.not.be.null;
  });

  it('item content should be assigned', () => {
    var params = Factory.createItemParams();
    var item = new SFItem(params);
    expect(item.content.title).to.equal(params.content.title);
  });

  it('should default updated_at to 1970 and created_at to the present', () => {
    var params = Factory.createItemParams();
    var item = new SFItem(params);
    let epoch = new Date(0);
    expect(item.updated_at - epoch).to.equal(0);
    expect(item.created_at - epoch).to.be.above(0);
    expect(new Date() - item.created_at).to.be.below(5); // < 5ms
  });

  it('adding item to modelmanager should add it to its items', () => {
    sharedCreatedItem = Factory.createItem();
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
    var params1 = Factory.createItem();
    var params2 = Factory.createItem();

    params1.content.references = [{uuid: params2.uuid, content_type: params2.content_type}];

    expect(params1.content.references.length).to.equal(1);
    expect(params2.content.references.length).to.equal(0);

    await modelManager.mapResponseItemsToLocalModels([params1]);
    await modelManager.mapResponseItemsToLocalModels([params2]);

    var item1 = modelManager.findItem(params1.uuid);
    var item2 = modelManager.findItem(params2.uuid);

    expect(item1.referencingObjects.length).to.equal(0);
    expect(item2.referencingObjects.length).to.equal(1);
  });

  it('mapping item without uuid should not map it', async () => {
    let modelManager = await createModelManager();
    var params1 = Factory.createItem();
    params1.uuid = null;

    await modelManager.mapResponseItemsToLocalModels([params1]);
    expect(modelManager.allItems.length).to.equal(0);
  });

  it('mapping an item twice shouldnt cause problems', async () => {
    let modelManager = await createModelManager();
    var params1 = Factory.createItem();
    params1.content.foo = "bar";

    let items = await modelManager.mapResponseItemsToLocalModels([params1]);
    let item = items[0];
    expect(item).to.not.be.null;

    items = await modelManager.mapResponseItemsToLocalModels([item]);
    item = items[0];

    expect(item.content.foo).to.equal("bar");
  });

  it('fixes relationship integrity', async () => {
    let modelManager = await createModelManager();
    var item1 = Factory.createItem();
    var item2 = Factory.createItem();

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    // damage references of one object
    item1.content.references = [];
    await modelManager.mapResponseItemsToLocalModels([item1]);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(1);
  });

  it('creating and removing relationships between two items should have valid references', async () => {
    let modelManager = await createModelManager();
    var item1 = Factory.createItem();
    var item2 = Factory.createItem();
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
    var originalItem1 = Factory.createItem();

    return new Promise((resolve, reject) => {
      modelManager.addModelUuidChangeObserver("test", (oldItem, newItem) => {
        expect(oldItem.uuid).to.not.equal(newItem.uuid);
        resolve();
      })

      modelManager.alternateUUIDForItem(originalItem1);
    })
  });

  it('properly duplicates item', async () => {
    let modelManager = await createModelManager();
    var originalItem1 = Factory.createItem();
    originalItem1.setAppDataItem("locked", true);
    var originalItem2 = Factory.createItem();
    originalItem1.addItemAsRelationship(originalItem2);

    expect(originalItem2.referencingObjects.length).to.equal(1);

    let duplicate = modelManager.duplicateItemAndAdd(originalItem1);

    expect(originalItem1.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(originalItem1.created_at).to.equal(duplicate.created_at);
    expect(originalItem1.content_type).to.equal(duplicate.content_type);
    expect(duplicate.content.references.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);
  });

  it('properly handles single item uuid alternation', async () => {
    let modelManager = await createModelManager();
    var originalItem1 = Factory.createItem();
    var originalItem2 = Factory.createItem();
    modelManager.addItem(originalItem1);
    modelManager.addItem(originalItem2);

    originalItem1.addItemAsRelationship(originalItem2);
    originalItem2.addItemAsRelationship(originalItem1);

    expect(originalItem1.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);

    let alternatedItem1 = await modelManager.alternateUUIDForItem(originalItem1);

    expect(modelManager.allItems.length).to.equal(2);

    expect(originalItem1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(alternatedItem1.uuid).to.equal(alternatedItem1.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(originalItem2.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references.length).to.equal(1);

    expect(alternatedItem1.referencingObjects.length).to.equal(1);
    expect(originalItem2.referencingObjects.length).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(originalItem2)).to.equal(true);
    expect(originalItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(true);

    expect(originalItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(true);
    expect(alternatedItem1.hasRelationshipWithItem(originalItem2)).to.equal(true);

    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('properly handles mutli item uuid alternation', async () => {
    let modelManager = await createModelManager();
    var originalItem1 = Factory.createItem();
    var originalItem2 = Factory.createItem();
    modelManager.addItem(originalItem1);
    modelManager.addItem(originalItem2);

    originalItem1.addItemAsRelationship(originalItem2);

    expect(originalItem2.referencingObjects.length).to.equal(1);

    var alternatedItem1 = await modelManager.alternateUUIDForItem(originalItem1);
    var alternatedItem2 = await modelManager.alternateUUIDForItem(originalItem2);

    expect(modelManager.allItems.length).to.equal(2);

    expect(originalItem1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(originalItem2.uuid).to.not.equal(alternatedItem2.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references[0].uuid).to.equal(alternatedItem2.uuid);
    expect(alternatedItem2.content.references.length).to.equal(0);

    expect(alternatedItem2.referencingObjects.length).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(alternatedItem2)).to.equal(true);
    expect(alternatedItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(false);
    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('maintains referencing relationships when duplicating', async () => {
    let modelManager = await createModelManager();
    var tag = Factory.createItem();
    var note = Factory.createItem();
    modelManager.addItem(tag);
    modelManager.addItem(note);

    tag.addItemAsRelationship(note);

    expect(tag.content.references.length).to.equal(1);

    var noteCopy = modelManager.duplicateItemAndAdd(note);

    expect(modelManager.allItems.length).to.equal(3);
    expect(note.uuid).to.not.equal(noteCopy.uuid);

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
    let modelManager = await createModelManager();
    var tag = Factory.createItem();
    var note = Factory.createItem();
    modelManager.addItem(tag);
    modelManager.addItem(note);

    tag.addItemAsRelationship(note);

    let externalNote = Object.assign({}, {content: note.getContentCopy(), content_type: note.content_type});
    externalNote.uuid = note.uuid;
    externalNote.content.text = `${Math.random()}`;

    let externalTag = Object.assign({}, {content: tag.getContentCopy(), content_type: tag.content_type});
    externalTag.uuid = tag.uuid;

    await modelManager.importItems([externalNote, externalTag]);

    // We expect now that the total item count is 3, not 4.
    expect(modelManager.allItems.length).to.equal(3);
    expect(tag.content.references.length).to.equal(2);
  });
});
