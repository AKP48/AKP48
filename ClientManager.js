var Builder = require("./Client/Builder");

/**
 * The ClientManager.
 * @param {JSON} config The IRCBot configuration.
 */
function ClientManager(config) {
    // array of all clients
    this.clients = [];

    // a builder for us to use.
    this.builder = new Builder();

    // load all of the clients on creation of this object.
    this.loadClients(config);
}

/**
 * Load all clients from config file.
 * @param {JSON} config The config file.
 */
ClientManager.prototype.loadClients = function(config) {
    for (var i = 0; i < config.servers.length; i++) {
        this.addClient(this.builder.buildClient(config.servers[i]));
    };
};

/**
 * Add a client to this ClientManager.
 * @param {Client} client The client.
 */
ClientManager.prototype.addClient = function(client) {
    client.initialize(this);
    this.clients.push(client);
};

/**
 * Reload the CommandProcessor in each Client that this ClientManager manages.
 */
ClientManager.prototype.reloadClients = function() {
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].reloadCommandProcessor();
    };
};

/**
 * Save the configuration of this ClientManager.
 */
ClientManager.prototype.save = function() {
    //get the current config
    var config = require("./config.json");
    //remove the current server config
    config.servers = [];

    for (var i = 0; i < this.clients.length; i++) {
        //copy the client, keeping only properties.
        var client = this.clients[i].clone();

        //delete everything we don't need to save.
        delete client.commandProcessor;
        delete client.ircClient;
        delete client.clientManager;
        delete client.isTemporary;

        config.servers.push(client);
    };

    require('fs').writeFile('./config.json', JSON.stringify(config, null, 4), function (err) {
        if (err) return console.log(err);
        console.log('Saved config!');
    });
};

module.exports = ClientManager;