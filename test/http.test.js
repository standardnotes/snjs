/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('http manager', () => {
  const httpService = Factory.globalHttpManager();
  it('formats urls properly 1', async () => {
    const url = 'http://example.org';
    const params = {foo: 'bar'};
    const result = url + '?foo=bar';
    expect(httpService.urlForUrlAndParams(url, params)).to.equal(result);
  });

  it('formats urls properly 2', async () => {
    const url = 'http://example.org?name=java';
    const params = {foo: 'bar'};
    const result = url + '&foo=bar';
    expect(httpService.urlForUrlAndParams(url, params)).to.equal(result);
  });
});
