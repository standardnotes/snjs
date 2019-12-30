import '../../node_modules/regenerator-runtime/runtime.js';
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import './../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('http manager', () => {
  const httpManager = Factory.globalHttpManager();
  it("formats urls properly 1", async () => {
    let url = "http://example.org";
    let params = {foo: "bar"};
    let result = url + "?foo=bar";

    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });

  it("formats urls properly 2", async () => {
    let url = "http://example.org?name=java";
    let params = {foo: "bar"};
    let result = url + "&foo=bar";

    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });
});
