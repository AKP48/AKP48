var Channel = require("./Channel");
var Client = require("./Client");
var Context = require("./Context");
var User = require("./User");

/**
 * Used to build various objects.
 */
function Builder() {

}

/**
 * Build a Client.
 * @param  {Object}         options         The options that will configure the client.
 * @return {Client}                         The Client.
 */
Builder.prototype.buildClient = function(options) {
    var client = new Client();
    if(options.nick) {
        client.setNick(options.nick);
    }
    if(options.server) {
        client.setNick(options.server);
    }
    if(options.password) {
        client.setNick(options.password);
    }
    if(options.channels) {
        client.setNick(options.channels);
    }
    return client;
};

module.exports = Builder;