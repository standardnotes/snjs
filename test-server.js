// Used for running mocha tests

var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(9001, function(){
    console.info('Server running on 9001...');
});
