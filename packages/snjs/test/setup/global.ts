import { version } from '../../package.json';
const Storage = require('dom-storage');

//@ts-ignore
global['__VERSION__'] = global['SnjsVersion'] = version;
global['localStorage'] = new Storage('./db.json', { strict: false });

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
