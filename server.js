var ClientManager = require('./ClientManager');

require('./polyfill.js')();
var config = require('./config.json');

var clientmanager = new ClientManager(config);

//todo: better exception handling plz
if(config.productionMode) {
    process.on('uncaughtException', function(err) {
        console.log('Caught exception: ' + err);
        console.log('Stack:', err.stack);
    });
}