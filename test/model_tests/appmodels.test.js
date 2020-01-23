import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('app models', () => {
  let sharedCreatedItem;

  const BASE_ITEM_COUNT = 1; /** Default items key */

  const sharedApplication = Factory.createApplication();
  let sharedItemCount = BASE_ITEM_COUNT;
  before(async function() {
    await Factory.initializeApplication(sharedApplication);
  });

  beforeEach(async function() {
    this.expectedItemCount = BASE_ITEM_COUNT;
    this.application = await Factory.createInitAppWithRandNamespace();
  })

  it('modelManager should be defined', () => {
    expect(sharedApplication.modelManager).to.not.be.null;
  });

  it('item should be defined', () => {
    expect(SFItem).to.not.be.null;
  });

  it('item content should be assigned', () => {
    var params = Factory.createNotePayload();
    var item = new SFItem(params);
    expect(item.content.title).to.equal(params.content.title);
  });

  it('should default updated_at to 1970 and created_at to the present', () => {
    var params = Factory.createNotePayload();
    var item = new SFItem(params);
    let epoch = new Date(0);
    expect(item.updated_at - epoch).to.equal(0);
    expect(item.created_at - epoch).to.be.above(0);
    expect(new Date() - item.created_at).to.be.below(5); // < 5ms
  });

  it('adding item to modelmanager should add it to its items', async function() {
    sharedCreatedItem = await Factory.createMappedNote(sharedApplication);
    sharedItemCount++;
    sharedApplication.modelManager.addItem(sharedCreatedItem);
    expect(sharedApplication.modelManager.allItems.length).to.equal(sharedItemCount);
    expect(sharedApplication.modelManager.allItemsMatchingTypes([sharedCreatedItem.content_type]).length).to.equal(1);
    expect(sharedApplication.modelManager.validItemsForContentType([sharedCreatedItem.content_type]).length).to.equal(1);
  });

  it('find added item', () => {
    var result = sharedApplication.modelManager.findItem(sharedCreatedItem.uuid);
    expect(result.uuid).to.equal(sharedCreatedItem.uuid);
  });

  it('removing item from modelmanager should remove it from its items', async () => {
    await sharedApplication.modelManager.removeItemLocally(sharedCreatedItem);
    sharedItemCount--;
    expect(sharedApplication.modelManager.allItems.length).to.equal(sharedItemCount);
  });

  it('handles delayed mapping', async function() {
    const modelManager = this.application.modelManager;
    const params1 = Factory.createNotePayload();
    const params2 = Factory.createNotePayload();

    const mutated = CreateMaxPayloadFromAnyObject({
      object: params1,
      override: {
        content: {
          references: [{
            uuid: params2.uuid,
            content_type: params2.content_type
          }]
        }
      }
    })

    await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    await modelManager.mapPayloadsToLocalItems({payloads: [params2]});

    const item1 = modelManager.findItem(params1.uuid);
    const item2 = modelManager.findItem(params2.uuid);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(0);

    expect(item1.referencingItemsCount).to.equal(0);
    expect(item2.referencingItemsCount).to.equal(1);
  });

  it('mapping item without uuid should not map it', async function() {
    const modelManager = this.application.modelManager;
    const params = CreateMaxPayloadFromAnyObject({
      object: Factory.createNoteParams(),
      override: {uuid: null}
    });

    await modelManager.mapPayloadsToLocalItems({payloads: [params]});
    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);
  });

  it('mapping an item twice shouldnt cause problems', async function() {
    let modelManager = this.application.modelManager;
    var payload = Factory.createNotePayload();
    const mutated = CreateMaxPayloadFromAnyObject({
      object: payload,
      override: {content: {foo: "bar"}}
    })

    let items = await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    let item = items[0];
    expect(item).to.not.be.null;

    items = await modelManager.mapPayloadsToLocalItems({payloads: [mutated]});
    item = items[0];

    expect(item.content.foo).to.equal("bar");
    expect(modelManager.notes.length).to.equal(1);
  });

  it('mapping item twice should preserve references', async function() {
    const modelManager = this.application.modelManager;
    const item1 = await Factory.createMappedNote(this.application);
    const item2 = await Factory.createMappedNote(this.application);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);

    const updatedPayload = Factory.itemToStoragePayload(item1);
    await modelManager.mapPayloadsToLocalItems({payloads: [updatedPayload]});

    expect(item1.content.references.length).to.equal(1);
  });

  it('fixes relationship integrity', async function() {
    let modelManager = this.application.modelManager;
    var item1 = await Factory.createMappedNote(this.application);
    var item2 = await Factory.createMappedNote(this.application);

    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    // damage references of one object
    item1.content.references = [];
    const updatedPayload = Factory.itemToStoragePayload(item1);
    await modelManager.mapPayloadsToLocalItems({payloads: [updatedPayload]});

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(1);
  });

  it('creating and removing relationships between two items should have valid references', async function() {
    let modelManager = this.application.modelManager;
    var item1 = await Factory.createMappedNote(this.application);
    var item2 = await Factory.createMappedNote(this.application);
    item1.addItemAsRelationship(item2);
    item2.addItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(1);
    expect(item2.content.references.length).to.equal(1);

    expect(item1.allReferencingItems).to.include(item2);
    expect(item2.allReferencingItems).to.include(item1);

    item1.removeItemAsRelationship(item2);
    item2.removeItemAsRelationship(item1);

    expect(item1.content.references.length).to.equal(0);
    expect(item2.content.references.length).to.equal(0);

    expect(item1.referencingItemsCount).to.equal(0);
    expect(item2.referencingItemsCount).to.equal(0);
  });

  // it('notifies observers of item uuid alternation', async function() {
  //   const modelManager = this.application.modelManager;
  //   const item = await Factory.createMappedNote(this.application);
  //
  //   return new Promise((resolve, reject) => {
  //     modelManager.addModelUuidChangeObserver("test", (oldItem, newItem) => {
  //       expect(oldItem.uuid).to.not.equal(newItem.uuid);
  //       resolve();
  //     })
  //
  //     modelManager.alternateUuidForItem(item);
  //   })
  // });

  it('properly duplicates item with no relationships', async function() {
    const modelManager = this.application.modelManager;
    const item = await Factory.createMappedNote(this.application);
    const duplicate = await modelManager.duplicateItem({item});
    expect(duplicate.uuid).to.not.equal(item.uuid);
    expect(item.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(item.created_at.toISOString()).to.equal(duplicate.created_at.toISOString());
    expect(item.content_type).to.equal(duplicate.content_type);
  });

  it('properly duplicates item with relationships', async function() {
    const modelManager = this.application.modelManager;

    const item1 = await Factory.createMappedNote(this.application);
    const item2 = await Factory.createMappedNote(this.application);

    item1.addItemAsRelationship(item2);

    expect(item1.referencedItemsCount).to.equal(1);
    expect(item2.referencingItemsCount).to.equal(1);

    const duplicate = await modelManager.duplicateItem({item: item1});
    expect(duplicate.uuid).to.not.equal(item1.uuid);
    expect(item1.referencedItemsCount).to.equal(1);
    expect(duplicate.referencingItemsCount).to.equal(item1.referencingItemsCount);
    expect(duplicate.referencedItemsCount).to.equal(item1.referencedItemsCount);

    expect(item1.isItemContentEqualWith(duplicate)).to.equal(true);
    expect(item1.created_at.toISOString()).to.equal(duplicate.created_at.toISOString());
    expect(item1.content_type).to.equal(duplicate.content_type);

    expect(duplicate.content.references.length).to.equal(1);

    expect(item2.referencingItemsCount).to.equal(2);
    expect(item2.referencedItemsCount).to.equal(0);
  });

  it('removing references should update cross-refs', async function() {
    const modelManager = this.application.modelManager;
    const item1 = await Factory.createMappedNote(this.application);
    const item2 = await Factory.createMappedNote(this.application);
    item1.addItemAsRelationship(item2);
    await modelManager.mapPayloadToLocalItem({
      payload: CreateMaxPayloadFromAnyObject({object: item1})
    })
    expect(item2.referencingItemsCount).to.equal(1);
    await modelManager.mapPayloadToLocalItem({
      payload: item1.payloadRepresentation({
        override: {
          deleted: true,
          content: {
            references: []
          }
        }
      })
    })
    expect(item2.referencingItemsCount).to.equal(0);
    expect(item1.referencingItemsCount).to.equal(0);
    expect(item1.referencedItemsCount).to.equal(0);
  });

  it('properly handles single item uuid alternation', async function() {
    const modelManager = this.application.modelManager;
    const item1 = await Factory.createMappedNote(this.application);
    const item2 = await Factory.createMappedNote(this.application);

    item1.addItemAsRelationship(item2);
    await modelManager.mapPayloadToLocalItem({
      payload: CreateMaxPayloadFromAnyObject({object: item1})
    })

    expect(item1.content.references.length).to.equal(1);
    expect(item1.referencedItemsCount).to.equal(1);
    expect(item2.referencingItemsCount).to.equal(1);

    const alternatedItem = await modelManager.alternateUuidForItem(item1);
    expect(alternatedItem.isItem).to.equal(true);
    expect(item1.deleted).to.equal(true);
    // they should not be same reference
    expect(item1.content === alternatedItem.content).to.equal(false);
    expect(item1.content.references === alternatedItem.content.references).to.equal(false);
    expect(item1.uuid).to.not.equal(alternatedItem.uuid);

    expect(modelManager.notes.length).to.equal(2);

    // item1 references should be discarded
    expect(item1.content.references.length).to.equal(0);

    expect(alternatedItem.content.references.length).to.equal(1);
    expect(alternatedItem.referencingItemsCount).to.equal(0);
    expect(alternatedItem.referencedItemsCount).to.equal(1);

    expect(item2.referencingItemsCount).to.equal(1);

    expect(alternatedItem.hasRelationshipWithItem(item2)).to.equal(true);
    expect(alternatedItem.dirty).to.equal(true);
  });

  it('properly handles mutli item uuid alternation', async function() {
    const modelManager = this.application.modelManager;
    const item1 = await Factory.createMappedNote(this.application);
    const item2 = await Factory.createMappedNote(this.application);
    this.expectedItemCount +=2;

    item1.addItemAsRelationship(item2);
    await modelManager.mapPayloadToLocalItem({
      payload: CreateMaxPayloadFromAnyObject({object: item1})
    })

    expect(item2.referencingItemsCount).to.equal(1);

    const alternatedItem1 = await modelManager.alternateUuidForItem(item1);
    const alternatedItem2 = await modelManager.alternateUuidForItem(item2);

    expect(modelManager.allItems.length).to.equal(this.expectedItemCount);

    expect(item1.uuid).to.not.equal(alternatedItem1.uuid);
    expect(item2.uuid).to.not.equal(alternatedItem2.uuid);

    expect(alternatedItem1.content.references.length).to.equal(1);
    expect(alternatedItem1.content.references[0].uuid).to.equal(alternatedItem2.uuid);
    expect(alternatedItem2.content.references.length).to.equal(0);

    expect(alternatedItem2.referencingItemsCount).to.equal(1);

    expect(alternatedItem1.hasRelationshipWithItem(alternatedItem2)).to.equal(true);
    expect(alternatedItem2.hasRelationshipWithItem(alternatedItem1)).to.equal(false);
    expect(alternatedItem1.dirty).to.equal(true);
  });

  it('maintains referencing relationships when duplicating', async function() {
    const modelManager = this.application.modelManager;
    const tag = await Factory.createMappedTag(this.application);
    const note = await Factory.createMappedNote(this.application);
    tag.addItemAsRelationship(note);
    await this.application.saveItem({item: tag});

    expect(tag.content.references.length).to.equal(1);

    const noteCopy = await modelManager.duplicateItem({item: note});
    expect(note.uuid).to.not.equal(noteCopy.uuid);

    expect(modelManager.notes.length).to.equal(2);
    expect(modelManager.tags.length).to.equal(1);

    expect(note.content.references.length).to.equal(0);
    expect(noteCopy.content.references.length).to.equal(0);
    expect(tag.content.references.length).to.equal(2);
  });
});
