import Storage from 'dom-storage';

// @ts-ignore
global.window.localStorage = new Storage(null, { strict: false });

//@ts-ignore
global['__VERSION__'] = global['SnjsVersion'] = require('./../../package.json').version;

/*
 * Handling uncaught exceptions.
 * See https://github.com/facebook/jest/issues/3251
 */
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    console.error(reason);
  });
  // @ts-ignore
  // Avoid memory leak by adding too many listeners.
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}
