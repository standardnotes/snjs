import { afterEach } from '@jest/globals';

afterEach(() => {
  // Reset the test environment between tests.
  window.stop();
});
