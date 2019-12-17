import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';

SFItem.AppDomain = "org.standardnotes.sn";

chai.use(chaiAsPromised);
var expect = chai.expect;

const globalModelManager = new SFModelManager();
const createModelManager = () => {
  return new SFModelManager();
}

const createItemParams = () => {
  var params = {
    uuid: cryptoManager.crypto.generateUUIDSync(),
    content_type: "Item",
    content: {
      title: "Hello",
      desc: "World",
      numbers: ["1", "2", "3"],
      tags: [
        {
          title: "foo",
          id: Math.random()
        },
        {
          title: "bar",
          id: Math.random()
        },
        {
          title: "far",
          id: Math.random()
        }
      ]
    }
  };
  return params;
}

const createItem = () => {
  return new SFItem(createItemParams());
}

describe("predicates", () => {
  it('test and operator', () => {
    let item = createItem();
    expect(item.satisfiesPredicate(new SFPredicate( "this_field_ignored", "and", [
      ["content.title", "=", "Hello"],
      ["content_type", "=", "Item"]
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate( "", "and", [
      ["content.title", "=", "Wrong"],
      ["content_type", "=", "Item"]
    ]))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate( "", "and", [
      ["content.title", "=", "Hello"],
      ["content_type", "=", "Wrong"]
    ]))).to.equal(false);
  })

  it('test or operator', () => {
    let item = createItem();
    expect(item.satisfiesPredicate(new SFPredicate( "this_field_ignored", "or", [
      ["content.title", "=", "Hello"],
      ["content_type", "=", "Item"]
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate( "", "or", [
      ["content.title", "=", "Wrong"],
      ["content_type", "=", "Item"]
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate( "", "or", [
      ["content.title", "=", "Hello"],
      ["content_type", "=", "Wrong"]
    ]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate( "", "or", [
      ["content.title", "=", "Wrong"],
      ["content_type", "=", "Wrong"]
    ]))).to.equal(false);
  })

  it('test deep nested recursive operator', () => {
    let item = createItem();
    expect(item.satisfiesPredicate(new SFPredicate( "this_field_ignored", "and", [
      ["content.title", "=", "Hello"],
      ["this_field_ignored", "or", [
        ["content.title", "=", "Wrong"],
        ["content.title", "=", "Wrong again"],
        ["content.title", "=", "Hello"],
      ]]
    ]))).to.equal(true);

    expect(item.satisfiesPredicate(new SFPredicate( "this_field_ignored", "and", [
      ["content.title", "=", "Hello"],
      ["this_field_ignored", "or", [
        ["content.title", "=", "Wrong"],
        ["content.title", "=", "Wrong again"],
        ["content.title", "=", "All wrong"],
      ]]
    ]))).to.equal(false);
  })

  it('test custom and', () => {
    let item = createItem();
    item.setAppDataItem("pinned", true);
    item.content.protected = true;
    expect(item.satisfiesPredicate(new SFPredicate( "this_field_ignored", "and", [
      ["pinned", "=", true],
      ["content.protected", "=", true]
    ]))).to.equal(true);
  });

  it('test equality', () => {
    let item = createItem();

    expect(item.satisfiesPredicate(new SFPredicate("content_type", "=", "Foo"))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content_type", "=", "Item"))).to.equal(true);

    expect(item.satisfiesPredicate(new SFPredicate("content.title", "=", "Foo"))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content.title", "=", "Hello"))).to.equal(true);

    expect(item.satisfiesPredicate(new SFPredicate("content.numbers", "=", ["1"]))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content.numbers", "=", ["1", "2", "3"]))).to.equal(true);
  });

  it('test inequality', () => {
    let item = createItem();

    expect(item.satisfiesPredicate(new SFPredicate("content_type", "!=", "Foo"))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("content_type", "!=", "Item"))).to.equal(false);

    expect(item.satisfiesPredicate(new SFPredicate("content.title", "!=", "Foo"))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("content.title", "!=", "Hello"))).to.equal(false);

    expect(item.satisfiesPredicate(new SFPredicate("content.numbers", "!=", ["1"]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("content.numbers", "!=", ["1", "2", "3"]))).to.equal(false);
  });

  it('test nonexistent property', () => {
    let item = createItem();

    expect(item.satisfiesPredicate(new SFPredicate("foobar", "!=", "Foo"))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("foobar", "=", "Foo"))).to.equal(false);

    expect(item.satisfiesPredicate(new SFPredicate("foobar", "<", 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("foobar", ">", 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("foobar", "<=", 3))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("foobar", "includes", 3))).to.equal(false);
  });

  it("test includes", () => {
    let item = createItem();
    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "includes", ["title", "=", "bar"]))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "includes", new SFPredicate("title", "=", "bar")))).to.equal(true);
    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "includes", new SFPredicate("title", "=", "foobar")))).to.equal(false);
    expect(item.satisfiesPredicate(new SFPredicate("content.tags", "includes", new SFPredicate("title", "=", "foo")))).to.equal(true);
  })

  it("test dynamic appData values", () => {
    let item = createItem();
    item.setAppDataItem("archived", true);
    expect(item.satisfiesPredicate(new SFPredicate("archived", "=", true))).to.equal(true);
    expect(item.satisfiesPredicate(["archived", "=", true])).to.equal(true);
    expect(item.satisfiesPredicate(JSON.parse('["archived", "=", true]'))).to.equal(true);
    expect(item.satisfiesPredicate(JSON.parse('["archived", "=", false]'))).to.equal(false);
  })

  it('model manager predicate matching', () => {
    let modelManager = createModelManager();
    let item1 = createItem();
    item1.updated_at = new Date();

    modelManager.addItem(item1);
    var predicate = new SFPredicate("content.title", "=", "ello");
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "content.desc";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "content.title";
    predicate.value = "Hello";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.keypath = "content.numbers.length";
    predicate.value = 2;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.value = 3;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = "<";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = "<=";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.operator = ">";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.keypath = "updated_at";
    predicate.operator = ">"
    var date = new Date();
    date.setSeconds(date.getSeconds() + 1);
    predicate.value = date;
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    predicate.operator = "<"
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.keypath = "updated_at";
    predicate.operator = "<"
    predicate.value = "30.days.ago";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);
    predicate.operator = ">"
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    predicate.value = "1.hours.ago";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);

    // multi matching
    var predicate1 = new SFPredicate("content_type", "=", "Item");
    var predicate2 = new SFPredicate("content.title", "=", "SHello");
    expect(modelManager.itemsMatchingPredicates([predicate1, predicate2]).length).to.equal(0);

    var predicate1 = new SFPredicate("content_type", "=", "Item");
    var predicate2 = new SFPredicate("content.title", "=", "Hello");
    expect(modelManager.itemsMatchingPredicates([predicate1, predicate2]).length).to.equal(1);

    expect(modelManager.itemsMatchingPredicate(new SFPredicate("content.title", "startsWith", "H")).length).to.equal(1);

    let item2 = new SFItem({
      content_type: "Item",
      content: {
        tags: [
          {
            title: "sobar",
            id: Math.random()
          },
          {
            title: "foobart",
            id: Math.random()
          }
        ]
      },
    })

    modelManager.addItem(item2);

    expect(modelManager.itemsMatchingPredicate(new SFPredicate("content.tags", "includes", ["title", "includes", "bar"])).length).to.equal(2);
    expect(modelManager.itemsMatchingPredicate(new SFPredicate("content.tags", "includes", ["title", "in", ["sobar"]])).length).to.equal(1);
    expect(modelManager.itemsMatchingPredicate(new SFPredicate("content.tags", "includes", ["title", "in", ["sobar", "foo"]])).length).to.equal(2);

    expect(modelManager.itemsMatchingPredicate(new SFPredicate("content.tags", "includes", new SFPredicate("title", "startsWith", "f"))).length).to.equal(2);

    expect(modelManager.itemsMatchingPredicate(new SFPredicate("archived", "=", true)).length).to.equal(0);
    var contentPred = new SFPredicate("content_type", "=", "Item");
    item2.setAppDataItem("archived", true);
    expect(modelManager.itemsMatchingPredicates([contentPred, new SFPredicate("archived", "=", true)]).length).to.equal(1);
  });

  it("nonexistent property should not satisfy predicate", () => {
    var item = createItem();
    expect(item.satisfiesPredicate(new SFPredicate("content.foobar.length", "=", 0))).to.equal(false);
  })

  it("false should compare true with undefined", () => {
    var item = createItem();
    let modelManager = createModelManager();
    modelManager.addItem(item);
    expect(modelManager.itemsMatchingPredicate(new SFPredicate("pinned", "=", false)).length).to.equal(1);
  })

  it("regex", () => {
    var item = createItem();
    item.content.title = "123";
    let modelManager = createModelManager();
    modelManager.addItem(item);
    // match only letters
    var predicate = new SFPredicate("content.title", "matches", "^[a-zA-Z]+$");
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(0);

    item.content.title = "abc";
    expect(modelManager.itemsMatchingPredicate(predicate).length).to.equal(1);
  })
})
