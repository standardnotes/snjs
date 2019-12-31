import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("local storage manager", () => {
  before(async () => {
    await Factory.globalStorageManager().clearAllData();
  })

  it("should set and retrieve values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setValue(key, value);
    expect(await Factory.globalStorageManager().getValue(key)).to.eql(value);
  })

  it("should set and retrieve items", async () => {
    var item = Factory.createStorageItemNotePayload();
    await Factory.globalStorageManager().savePayload(item);

    return Factory.globalStorageManager().getAllPayloads().then((models) => {
      expect(models.length).to.equal(1);
    })
  })

  it("should clear values", async () => {
    var key = "foo";
    var value = "bar";
    await Factory.globalStorageManager().setValue(key, value);
    await Factory.globalStorageManager().clearAllData();
    expect(await Factory.globalStorageManager().getValue(key)).to.not.be.ok;
  })
})
