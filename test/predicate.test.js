/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

const createItemParams = () => {
  const params = {
    uuid: Uuid.GenerateUuidSynchronously(),
    content_type: 'Item',
    content: {
      title: 'Hello',
      desc: 'World',
      numbers: ['1', '2', '3'],
      tags: [
        {
          title: 'foo',
          id: Math.random()
        },
        {
          title: 'bar',
          id: Math.random()
        },
        {
          title: 'far',
          id: Math.random()
        }
      ]
    }
  };
  return params;
};

const createItem = () => {
  const payload = CreateMaxPayloadFromAnyObject(
    createItemParams()
  );
  return CreateItemFromPayload(payload);
};

describe('predicates', () => {
  const BASE_ITEM_COUNT = 1; /** Default items key */

  const application = Factory.createApplication();
  before(async function () {
    await Factory.initializeApplication(application);
  });

  after(async function () {
    await application.deinit();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('test and operator', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('this_field_ignored', 'and', [
      ['content.title', '=', 'Hello'],
      ['content_type', '=', 'Item']
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('', 'and', [
      ['content.title', '=', 'Wrong'],
      ['content_type', '=', 'Item']
    ]))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('', 'and', [
      ['content.title', '=', 'Hello'],
      ['content_type', '=', 'Wrong']
    ]))).to.equal(false);
  });

  it('test or operator', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('this_field_ignored', 'or', [
      ['content.title', '=', 'Hello'],
      ['content_type', '=', 'Item']
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('', 'or', [
      ['content.title', '=', 'Wrong'],
      ['content_type', '=', 'Item']
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('', 'or', [
      ['content.title', '=', 'Hello'],
      ['content_type', '=', 'Wrong']
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('', 'or', [
      ['content.title', '=', 'Wrong'],
      ['content_type', '=', 'Wrong']
    ]))).to.equal(false);
  });

  it('test deep nested recursive operator', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('this_field_ignored', 'and', [
      ['content.title', '=', 'Hello'],
      ['this_field_ignored', 'or', [
        ['content.title', '=', 'Wrong'],
        ['content.title', '=', 'Wrong again'],
        ['content.title', '=', 'Hello'],
      ]]
    ]))).to.equal(true);

    expect(item.satisfiesPredicate(new SNPredicate('this_field_ignored', 'and', [
      ['content.title', '=', 'Hello'],
      ['this_field_ignored', 'or', [
        ['content.title', '=', 'Wrong'],
        ['content.title', '=', 'Wrong again'],
        ['content.title', '=', 'All wrong'],
      ]]
    ]))).to.equal(false);
  });

  it('test custom and', () => {
    const item = createItem();
    item.setAppDataItem('pinned', true);
    item.content.protected = true;
    expect(item.satisfiesPredicate(new SNPredicate('this_field_ignored', 'and', [
      ['pinned', '=', true],
      ['content.protected', '=', true]
    ]))).to.equal(true);
  });

  it('test compound', () => {
    const item = createItem();
    item.setAppDataItem('pinned', true);
    item.content.protected = true;
    const pinnedPred = new SNPredicate('pinned', '=', true);
    const protectedPred = new SNPredicate('content.protected', '=', true);
    const compoundProd = SNPredicate.CompoundPredicate([
      pinnedPred,
      protectedPred
    ]);
    expect(item.satisfiesPredicate(compoundProd)).to.equal(true);
  });

  it('test equality', () => {
    const item = createItem();

    expect(item.satisfiesPredicate(new SNPredicate('content_type', '=', 'Foo'))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('content_type', '=', 'Item'))).to.equal(true);

    expect(item.satisfiesPredicate(new SNPredicate('content.title', '=', 'Foo'))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('content.title', '=', 'Hello'))).to.equal(true);

    expect(item.satisfiesPredicate(new SNPredicate('content.numbers', '=', ['1']))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('content.numbers', '=', ['1', '2', '3']))).to.equal(true);
  });

  it('test inequality', () => {
    const item = createItem();

    expect(item.satisfiesPredicate(new SNPredicate('content_type', '!=', 'Foo'))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('content_type', '!=', 'Item'))).to.equal(false);

    expect(item.satisfiesPredicate(new SNPredicate('content.title', '!=', 'Foo'))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('content.title', '!=', 'Hello'))).to.equal(false);

    expect(item.satisfiesPredicate(new SNPredicate('content.numbers', '!=', ['1']))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('content.numbers', '!=', ['1', '2', '3']))).to.equal(false);
  });

  it('test nonexistent property', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('foobar', '!=', 'Foo'))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('foobar', '=', 'Foo'))).to.equal(false);

    expect(item.satisfiesPredicate(new SNPredicate('foobar', '<', 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('foobar', '>', 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('foobar', '<=', 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('foobar', 'includes', 3))).to.equal(false);
  });

  it('test includes', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('content.tags', 'includes', ['title', '=', 'bar']))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('content.tags', 'includes', new SNPredicate('title', '=', 'bar')))).to.equal(true);
    expect(item.satisfiesPredicate(new SNPredicate('content.tags', 'includes', new SNPredicate('title', '=', 'foobar')))).to.equal(false);
    expect(item.satisfiesPredicate(new SNPredicate('content.tags', 'includes', new SNPredicate('title', '=', 'foo')))).to.equal(true);
  });

  it('test dynamic appData values', () => {
    const item = createItem();
    item.setAppDataItem('archived', true);
    expect(item.satisfiesPredicate(new SNPredicate('archived', '=', true))).to.equal(true);
    expect(item.satisfiesPredicate(['archived', '=', true])).to.equal(true);
    expect(item.satisfiesPredicate(JSON.parse('["archived", "=", true]'))).to.equal(true);
    expect(item.satisfiesPredicate(JSON.parse('["archived", "=", false]'))).to.equal(false);
  });

  it('model manager predicate matching', async function () {
    const modelManager = this.application.modelManager;
    const payload1 = CreateMaxPayloadFromAnyObject(createItemParams());
    const item1 = await modelManager.mapPayloadToLocalItem({
      payload: payload1,
      source: PayloadSources.LocalSaved
    });
    item1.updated_at = new Date();

    await modelManager.mapItem({
      item: item1,
      source: PayloadSources.LocalSaved
    });
    const predicate = new SNPredicate('content.title', '=', 'ello');
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'content.desc';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'content.title';
    predicate.value = 'Hello';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.keypath = 'content.numbers.length';
    predicate.value = 2;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.value = 3;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = '<';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = '<=';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = '>';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'updated_at';
    predicate.operator = '>';
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    predicate.value = date;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = '<';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(
      modelManager.allItems.length
    );

    predicate.keypath = 'updated_at';
    predicate.operator = '<';
    predicate.value = '30.days.ago';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(BASE_ITEM_COUNT);
    predicate.operator = '>';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.value = '1.hours.ago';
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    // multi matching
    expect(modelManager.itemsMatchingPredicates([
      new SNPredicate('content_type', '=', 'Item'),
      new SNPredicate('content.title', '=', 'SHello')
    ]).length).to.equal(0);

    expect(modelManager.itemsMatchingPredicates([
      new SNPredicate('content_type', '=', 'Item'),
      new SNPredicate('content.title', '=', 'Hello')
    ]).length).to.equal(1);

    expect(modelManager.itemsMatchingPredicate(
      new SNPredicate('content.title', 'startsWith', 'H')
    ).length).to.equal(1);
  });

  it('model manager predicate matching 2', async function () {
    const modelManager = this.application.modelManager;
    const payload = CreateMaxPayloadFromAnyObject(
      {
        uuid: Uuid.GenerateUuidSynchronously(),
        content_type: 'Item',
        content: {
          tags: [
            {
              title: 'sobar',
              id: Math.random()
            },
            {
              title: 'foobart',
              id: Math.random()
            }
          ]
        }
      }
    );

    const item2 = (await modelManager.mapPayloadsToLocalItems({
      payloads: [payload],
      source: PayloadSources.LocalChanged
    }))[0];

    expect(modelManager.itemsMatchingPredicate(new SNPredicate('content.tags', 'includes', ['title', 'includes', 'bar'])).length).to.equal(1);
    expect(modelManager.itemsMatchingPredicate(new SNPredicate('content.tags', 'includes', ['title', 'in', ['sobar']])).length).to.equal(1);
    expect(modelManager.itemsMatchingPredicate(new SNPredicate('content.tags', 'includes', ['title', 'in', ['sobar', 'foo']])).length).to.equal(1);

    expect(modelManager.itemsMatchingPredicate(new SNPredicate('content.tags', 'includes', new SNPredicate('title', 'startsWith', 'f'))).length).to.equal(1);

    expect(modelManager.itemsMatchingPredicate(new SNPredicate('archived', '=', true)).length).to.equal(0);
    const contentPred = new SNPredicate('content_type', '=', 'Item');
    item2.setAppDataItem('archived', true);
    expect(modelManager.itemsMatchingPredicates([contentPred, new SNPredicate('archived', '=', true)]).length).to.equal(1);
  });

  it('nonexistent property should not satisfy predicate', () => {
    const item = createItem();
    expect(item.satisfiesPredicate(new SNPredicate('content.foobar.length', '=', 0))).to.equal(false);
  });

  it('false should compare true with undefined', async function () {
    const item = createItem();
    const modelManager = this.application.modelManager;
    await modelManager.mapItem({
      item: item,
      source: PayloadSources.LocalSaved
    });
    const predicate = new SNPredicate('pinned', '=', false);
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(modelManager.allItems.length);
  });

  it('regex', async function () {
    const item = createItem();
    item.content.title = '123';
    const modelManager = this.application.modelManager;
    await modelManager.setItemDirty(item, true);
    // match only letters
    const predicate = new SNPredicate('content.title', 'matches', '^[a-zA-Z]+$');
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    item.content.title = 'abc';
    await modelManager.mapPayloadsToLocalItems({
      payloads: [CreateMaxPayloadFromAnyObject(item)],
      source: PayloadSources.LocalChanged
    });
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);
  });
});
