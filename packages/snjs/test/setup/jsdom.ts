import { JSDOM } from 'jsdom';

const htmlTemplate = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Standard Notes test application</title>
    </head>
    <body>
    </body>
  </html>
`;

const { window } = new JSDOM(htmlTemplate, {
  resources: "usable",
  url: 'http://localhost',
});

global.window.alert = (message) => message;
global.window.confirm = (message) => false;

/**
 * window.setImmediate is non-standard, so we substitute it with setTimeout.
 * See https://developer.mozilla.org/en-US/docs/Web/API/Window/setImmediate
 */
//@ts-ignore
global.window.setImmediate = (func) => {
  setTimeout(func, 0);
};

/**
 * Setting native extensions location:
 * - _extensions_manager_location for the Extension manager
 * - _batch_manager_location for the Batch manager
 */
//@ts-ignore
global.window['_extensions_manager_location'] = 'http://localhost/extensions/extension_manager';
//@ts-ignore
global.window['_batch_manager_location'] = 'http://localhost/extensions/batch_manager';

global.document = window.document;
