/**
 * Copyright (C) 2015  Austin Peterson
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
        this.clients[i].reloadProcessors();
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