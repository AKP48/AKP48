var ClientManager = require('./clientmanager');

require('./polyfill.js')();
var config = require('./config.json');

var climgr = new ClientManager(config);

//todo: better exception handling plz
if(config.productionMode) {
    process.on('uncaughtException', function(err) {
        console.log('Caught exception: ' + err);
    });
}