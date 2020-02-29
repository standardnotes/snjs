/* Used for running mocha tests */
const connect = require('connect');
const serveStatic = require('serve-static');
const port = 9001;
connect().use(serveStatic(__dirname)).listen(port, () => {
    console.log(`Tests server running on ${port}`);
    console.log(`Open browser to localhost:${port}/test/test.html`);
});
