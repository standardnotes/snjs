import { version } from '../../package.json';

//@ts-ignore
global['__VERSION__'] = global['SnjsVersion'] = version;

/*
 * Handling uncaught exceptions.
 * See https://github.com/facebook/jest/issues/3251
 */
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
  process.on('unhandledRejection', reason => {
    throw reason;
  });
  // @ts-ignore
  // Avoid memory leak by adding too many listeners.
  process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}
