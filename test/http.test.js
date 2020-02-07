/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
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
    const url = "http://example.org";
    const params = {foo: "bar"};
    const result = url + "?foo=bar";
    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });

  it("formats urls properly 2", async () => {
    const url = "http://example.org?name=java";
    const params = {foo: "bar"};
    const result = url + "&foo=bar";
    expect(httpManager.urlForUrlAndParams(url, params)).to.equal(result);
  });
});
