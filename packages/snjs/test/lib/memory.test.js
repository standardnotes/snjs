import * as Factory from './../factory';

/**
 * Simple empty test page to create and deinit empty application
 * Then check browser Memory tool to make sure there are no leaks.
 */
describe('memory', function () {
  let application;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();
  });

  afterEach(function () {
    application.deinit();
  });

  it('passes', async function () {
    expect(true).toBe(true);
  });
});
