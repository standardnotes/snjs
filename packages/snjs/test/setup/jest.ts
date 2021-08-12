import { beforeEach, afterEach } from '@jest/globals';

beforeEach(() => {
  // Stops loading any resources or network requests.
  window.stop();
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});
