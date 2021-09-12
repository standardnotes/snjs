/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

const createItemParams = function () {
  const params = {
    uuid: Factory.generateUuidish(),
    content_type: 'Item',
    content: {
      title: 'Hello',
      desc: 'World',
      numbers: ['1', '2', '3'],
      tags: [
        {
          title: 'foo',
          id: Math.random(),
        },
        {
          title: 'bar',
          id: Math.random(),
        },
        {
          title: 'far',
          id: Math.random(),
        },
      ],
    },
  };
  return params;
};

describe('predicates', async function () {
  before(async function () {
    const crypto = new SNWebCrypto();
    Uuid.SetGenerators(crypto.generateUUIDSync, crypto.generateUUID);
  });

  beforeEach(async function () {
    localStorage.clear();
    this.itemManager = new PayloadManager();
    this.itemManager = new ItemManager(this.itemManager);
    this.createItem = async () => {
      const payload = CreateMaxPayloadFromAnyObject(createItemParams());
      const template = CreateItemFromPayload(payload);
      return this.itemManager.insertItem(template);
    };

    this.createNote = async function () {
      return this.itemManager.createItem(ContentType.Note, {
        title: 'hello',
        text: 'world',
      });
    };

    this.createTag = async (notes) => {
      const references = notes.map((note) => {
        return {
          uuid: note.uuid,
          content_type: note.content_type,
        };
      });
      return this.itemManager.createItem(ContentType.Tag, {
        title: 'thoughts',
        references: references,
      });
    };
  });

  after(async function () {
    localStorage.clear();
  });

  it('test and operator', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'and', [
          ['content.title', '=', 'Hello'],
          ['content_type', '=', 'Item'],
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'and', [
          ['content.title', '=', 'Wrong'],
          ['content_type', '=', 'Item'],
        ])
      )
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'and', [
          ['content.title', '=', 'Hello'],
          ['content_type', '=', 'Wrong'],
        ])
      )
    ).to.equal(false);
  });

  it('test or operator', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'or', [
          ['content.title', '=', 'Hello'],
          ['content_type', '=', 'Item'],
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'or', [
          ['content.title', '=', 'Wrong'],
          ['content_type', '=', 'Item'],
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'or', [
          ['content.title', '=', 'Hello'],
          ['content_type', '=', 'Wrong'],
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'or', [
          ['content.title', '=', 'Wrong'],
          ['content_type', '=', 'Wrong'],
        ])
      )
    ).to.equal(false);
  });

  it('test not operator', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'not', [
          'content.title',
          '=',
          'Not This Title',
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'not', [
          'content.title',
          '=',
          'Hello',
        ])
      )
    ).to.equal(false);

    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'and', [
          ['', 'not', ['content.tags', 'includes', ['title', '=', 'far']]],
          ['content.tags', 'includes', ['title', '=', 'foo']],
        ])
      )
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'and', [
          ['', 'not', ['content.tags', 'includes', ['title', '=', 'boo']]],
          ['content.tags', 'includes', ['title', '=', 'foo']],
        ])
      )
    ).to.equal(true);

    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'not', [
          '',
          'and',
          [
            ['content.title', 'startsWith', 'H'],
            ['content.tags', 'includes', ['title', '=', 'falsify']],
          ],
        ])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'not', [
          '',
          'and',
          [
            ['content.title', 'startsWith', 'H'],
            ['content.tags', 'includes', ['title', '=', 'foo']],
          ],
        ])
      )
    ).to.equal(false);

    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'not', [
          '',
          'or',
          [
            ['content.title', 'startsWith', 'H'],
            ['content.tags', 'includes', ['title', '=', 'falsify']],
          ],
        ])
      )
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('', 'not', [
          '',
          'or',
          [
            ['content.title', 'startsWith', 'Z'],
            ['content.tags', 'includes', ['title', '=', 'falsify']],
          ],
        ])
      )
    ).to.equal(true);
  });

  it('test deep nested recursive operator', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'and', [
          ['content.title', '=', 'Hello'],
          [
            'this_field_ignored',
            'or',
            [
              ['content.title', '=', 'Wrong'],
              ['content.title', '=', 'Wrong again'],
              ['content.title', '=', 'Hello'],
            ],
          ],
        ])
      )
    ).to.equal(true);

    expect(
      item.satisfiesPredicate(
        new SNPredicate('this_field_ignored', 'and', [
          ['content.title', '=', 'Hello'],
          [
            'this_field_ignored',
            'or',
            [
              ['content.title', '=', 'Wrong'],
              ['content.title', '=', 'Wrong again'],
              ['content.title', '=', 'All wrong'],
            ],
          ],
        ])
      )
    ).to.equal(false);
  });

  it('test custom and', async function () {
    const item = await this.createItem();
    const changedItem = await this.itemManager.changeItem(
      item.uuid,
      (mutator) => {
        mutator.pinned = true;
        mutator.protected = true;
      }
    );
    const predicate = new SNPredicate('this_field_ignored', 'and', [
      ['pinned', '=', true],
      ['content.protected', '=', true],
    ]);
    expect(changedItem.satisfiesPredicate(predicate)).to.equal(true);
  });

  it('test compound', async function () {
    const item = await this.createItem();
    const changedItem = await this.itemManager.changeItem(
      item.uuid,
      (mutator) => {
        mutator.pinned = true;
        mutator.protected = true;
      }
    );
    const pinnedPred = new SNPredicate('pinned', '=', true);
    const protectedPred = new SNPredicate('content.protected', '=', true);
    const compoundProd = SNPredicate.CompoundPredicate([
      pinnedPred,
      protectedPred,
    ]);
    expect(changedItem.satisfiesPredicate(compoundProd)).to.equal(true);
  });

  it('test equality', async function () {
    const item = await this.createItem();

    expect(
      item.satisfiesPredicate(new SNPredicate('content_type', '=', 'Foo'))
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(new SNPredicate('content_type', '=', 'Item'))
    ).to.equal(true);

    expect(
      item.satisfiesPredicate(new SNPredicate('content.title', '=', 'Foo'))
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(new SNPredicate('content.title', '=', 'Hello'))
    ).to.equal(true);

    expect(
      item.satisfiesPredicate(new SNPredicate('content.numbers', '=', ['1']))
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('content.numbers', '=', ['1', '2', '3'])
      )
    ).to.equal(true);
  });

  it('test inequality', async function () {
    const item = await this.createItem();

    expect(
      item.satisfiesPredicate(new SNPredicate('content_type', '!=', 'Foo'))
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(new SNPredicate('content_type', '!=', 'Item'))
    ).to.equal(false);

    expect(
      item.satisfiesPredicate(new SNPredicate('content.title', '!=', 'Foo'))
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(new SNPredicate('content.title', '!=', 'Hello'))
    ).to.equal(false);

    expect(
      item.satisfiesPredicate(new SNPredicate('content.numbers', '!=', ['1']))
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate('content.numbers', '!=', ['1', '2', '3'])
      )
    ).to.equal(false);
  });

  it('test nonexistent property', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(new SNPredicate('foobar', '!=', 'Foo'))
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(new SNPredicate('foobar', '=', 'Foo'))
    ).to.equal(false);

    expect(item.satisfiesPredicate(new SNPredicate('foobar', '<', 3))).to.equal(
      false
    );
    expect(item.satisfiesPredicate(new SNPredicate('foobar', '>', 3))).to.equal(
      false
    );
    expect(
      item.satisfiesPredicate(new SNPredicate('foobar', '<=', 3))
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(new SNPredicate('foobar', 'includes', 3))
    ).to.equal(false);
  });

  it('test includes', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(
        new SNPredicate('content.tags', 'includes', ['title', '=', 'bar'])
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate(
          'content.tags',
          'includes',
          new SNPredicate('title', '=', 'bar')
        )
      )
    ).to.equal(true);
    expect(
      item.satisfiesPredicate(
        new SNPredicate(
          'content.tags',
          'includes',
          new SNPredicate('title', '=', 'foobar')
        )
      )
    ).to.equal(false);
    expect(
      item.satisfiesPredicate(
        new SNPredicate(
          'content.tags',
          'includes',
          new SNPredicate('title', '=', 'foo')
        )
      )
    ).to.equal(true);
  });

  it('test dynamic appData values', async function () {
    const item = await this.createItem();
    const changedItem = await this.itemManager.changeItem(
      item.uuid,
      (mutator) => {
        mutator.archived = true;
      }
    );

    expect(
      changedItem.satisfiesPredicate(new SNPredicate('archived', '=', true))
    ).to.equal(true);
    expect(changedItem.satisfiesPredicate(['archived', '=', true])).to.equal(
      true
    );
    expect(
      changedItem.satisfiesPredicate(JSON.parse('["archived", "=", true]'))
    ).to.equal(true);
    expect(
      changedItem.satisfiesPredicate(JSON.parse('["archived", "=", false]'))
    ).to.equal(false);
  });

  it('item manager predicate matching', async function () {
    const itemManager = this.itemManager;
    const payload1 = CreateMaxPayloadFromAnyObject({
      ...createItemParams(),
      updated_at: new Date(),
    });
    await itemManager.emitItemFromPayload(payload1, PayloadSource.LocalSaved);

    const predicate = new SNPredicate('content.title', '=', 'ello');
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'content.desc';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'content.title';
    predicate.value = 'Hello';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.keypath = 'content.numbers.length';
    predicate.value = 2;
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.value = 3;
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = '<';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = '<=';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = '>';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = 'updated_at';
    predicate.operator = '>';
    const date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    predicate.value = date;
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = '<';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(
      itemManager.items.length
    );

    predicate.keypath = 'updated_at';
    predicate.operator = '<';
    predicate.value = '30.days.ago';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);
    predicate.operator = '>';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.value = '1.hours.ago';
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    // multi matching
    expect(
      itemManager.itemsMatchingPredicates([
        new SNPredicate('content_type', '=', 'Item'),
        new SNPredicate('content.title', '=', 'SHello'),
      ]).length
    ).to.equal(0);

    expect(
      itemManager.itemsMatchingPredicates([
        new SNPredicate('content_type', '=', 'Item'),
        new SNPredicate('content.title', '=', 'Hello'),
      ]).length
    ).to.equal(1);

    expect(
      itemManager.itemsMatchingPredicate(
        new SNPredicate('content.title', 'startsWith', 'H')
      ).length
    ).to.equal(1);
  });

  it('item manager predicate matching 2', async function () {
    const itemManager = this.itemManager;
    const payload = CreateMaxPayloadFromAnyObject({
      uuid: Factory.generateUuidish(),
      content_type: 'Item',
      content: {
        tags: [
          {
            title: 'sobar',
            id: Math.random(),
          },
          {
            title: 'foobart',
            id: Math.random(),
          },
        ],
      },
    });

    const item2 = await itemManager.emitItemFromPayload(
      payload,
      PayloadSource.LocalChanged
    );

    expect(
      itemManager.itemsMatchingPredicate(
        new SNPredicate('content.tags', 'includes', [
          'title',
          'includes',
          'bar',
        ])
      ).length
    ).to.equal(1);
    expect(
      itemManager.itemsMatchingPredicate(
        new SNPredicate('content.tags', 'includes', ['title', 'in', ['sobar']])
      ).length
    ).to.equal(1);
    expect(
      itemManager.itemsMatchingPredicate(
        new SNPredicate('content.tags', 'includes', [
          'title',
          'in',
          ['sobar', 'foo'],
        ])
      ).length
    ).to.equal(1);
    expect(
      itemManager.itemsMatchingPredicate(
        new SNPredicate(
          'content.tags',
          'includes',
          new SNPredicate('title', 'startsWith', 'f')
        )
      ).length
    ).to.equal(1);
    expect(
      itemManager.itemsMatchingPredicate(new SNPredicate('archived', '=', true))
        .length
    ).to.equal(0);
    const contentPred = new SNPredicate('content_type', '=', 'Item');

    await this.itemManager.changeItem(item2.uuid, (mutator) => {
      mutator.archived = true;
    });

    expect(
      itemManager.itemsMatchingPredicates([
        contentPred,
        new SNPredicate('archived', '=', true),
      ]).length
    ).to.equal(1);
  });

  it('nonexistent property should not satisfy predicate', async function () {
    const item = await this.createItem();
    expect(
      item.satisfiesPredicate(new SNPredicate('content.foobar.length', '=', 0))
    ).to.equal(false);
  });

  it('false should compare true with undefined', async function () {
    const item = await this.createItem();
    const itemManager = this.itemManager;
    await itemManager.emitItemFromPayload(
      item.payloadRepresentation(),
      PayloadSource.LocalSaved
    );
    const predicate = new SNPredicate('pinned', '=', false);
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(
      itemManager.items.length
    );
  });

  it('regex', async function () {
    const item = await this.createItem();
    const changedItem = await this.itemManager.changeItem(
      item.uuid,
      (mutator) => {
        mutator.content.title = '123';
      }
    );

    const itemManager = this.itemManager;
    // match only letters
    const predicate = new SNPredicate(
      'content.title',
      'matches',
      '^[a-zA-Z]+$'
    );
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    await this.itemManager.changeItem(changedItem.uuid, (mutator) => {
      mutator.content.title = 'abc';
    });
    expect(itemManager.itemsMatchingPredicate(predicate).length).to.equal(1);
  });
});
