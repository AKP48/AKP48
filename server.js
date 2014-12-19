var ClientManager = require('./clientmanager');

var climgr = new ClientManager(require('./config.json'));

process.on('uncaughtException', function(err) {
  console.log(JSON.stringify(err));
});