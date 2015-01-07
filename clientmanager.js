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

ClientManager.prototype.loadClients = function(config) {
    for (var i = 0; i < config.servers.length; i++) {
        this.addClient(this.builder.buildClient(config.servers[i]));
    };
};

ClientManager.prototype.addClient = function(client) {
    client.initialize(this);
    this.clients.push(client);
};

module.exports = ClientManager;