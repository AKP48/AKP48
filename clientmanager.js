var irc = require('irc');
var IRCClient = require("./ircclient");
fs = require('fs');

function ClientManager(servers) {
    this.clients = [];

    this.createClientsFromJSON(servers);
}

ClientManager.prototype.createClientsFromJSON = function(config) {
    for (var i = 0; i < config.servers.length; i++) {
        this.createClient(config.servers[i]);
    };
};

ClientManager.prototype.createClient = function(o, save) {
    if(save === undefined) {
        save = true;
    }
    var c = new IRCClient(o, this, save);
    this.addClient(c);

    return true;
};

ClientManager.prototype.addClient = function(client) {
    this.clients.push(client);
};

ClientManager.prototype.reloadAll = function() {
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].reload();
    };
    console.log("All clients reloaded!");
}

ClientManager.prototype.shutdown = function(msg) {
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].disconnect(msg);
    };

    process.exit(0);
};

ClientManager.prototype.saveConfig = function() {
    delete require.cache[__dirname+'/config.json'];
    var configObject = require("./config.json");
    var configObject.servers = [];
    for (var i = 0; i < this.clients.length; i++) {
        if(this.clients[i].getConfig()) {
            configObject.servers.push(this.clients[i].getConfig());
        }
    };

    fs.writeFile('./config.json', JSON.stringify(configObject, null, 4), function (err) {
        if (err) return console.log(err);
        console.log('Saved config!');
    });
};

ClientManager.prototype.removeClient = function(client, msg) {
    var index = this.clients.indexOf(client);
    if (index > -1) {
        this.clients.splice(index, 1);

        var self = this;

        client.getIRCClient().disconnect(msg, function() {
            console.log("Disconnected client: "+client.name);
            self.saveConfig();
        });
    }
};

module.exports = ClientManager;