import { beforeEach, afterEach } from '@jest/globals';

beforeEach(() => {
  /**
   * Stops loading any resources or network requests before each test.
   * This will "restore" the environment between tests, and ensure that
   * each test starts with a clean state.
   */
  window.stop();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
