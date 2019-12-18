import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('utils', () => {

  it("findInArray", async () => {
    expect(findInArray).to.not.be.null;

    let array = [
      {id: 1},
      {id: 2},
      {id: 3},
      {id: 4}
    ]

    expect(findInArray(array, "id", 1)).to.be.ok;
    expect(findInArray(array, "id", "foo")).to.not.be.ok;
  })
});
