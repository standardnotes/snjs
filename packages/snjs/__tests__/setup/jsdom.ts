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

global.window.alert = jest.fn();
global.window.confirm = jest.fn();
global.window.open = jest.fn();

//@ts-ignore
global.window.setImmediate = global.window.setTimeout;

global.document = window.document;
