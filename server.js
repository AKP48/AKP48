var ClientManager = require('./clientmanager');

require('./polyfill.js')();

var climgr = new ClientManager(require('./config.json'));

//todo: better exception handling plz