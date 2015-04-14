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

var Client = require("./Client/Client");
var Builder = require("./Client/Builder");
var CommandProcessor = require("./CommandProcessor");
var AutoResponseProcessor = require("./AutoResponseProcessor");
var GitListener = require('./GitListener');

/**
 * The ClientManager.
 * @param {JSON}   config The IRCBot configuration.
 * @param {Logger} logger The bunyan logger.
 */
function ClientManager(config, logger) {
    // The logger.
    this.log = logger.child({module: "ClientManager"});

    // array of all clients
    this.clients = [];

    // API objects.
    this.APIs = require("./API/")(logger);

    // load all of the clients on creation of this object.
    this.loadClients(config);

    // builder
    this.builder = new Builder(logger);

    // The CommandProcessor.
    this.commandProcessor = new CommandProcessor(this.log);

    // The AutoResponseProcessor.
    this.autoResponseProcessor = new AutoResponseProcessor(this.log);

    this.log.info("Creating Git Listener");
    this.gitListener = new GitListener(this, logger);
}

/**
 * Load all clients from config file.
 * @param {JSON} config The config file.
 */
ClientManager.prototype.loadClients = function(config) {
    this.log.info("Loading client information...");
    config.servers.each(function (server) {
        this.addClient(Client.build(server, this.log));
    }, this);
};

/**
 * Add a client to this ClientManager.
 * @param {Client} client The client.
 */
ClientManager.prototype.addClient = function(client) {
    this.log.info("Initializing client", client.getNick(), "on", client.getServer()+":"+client.getPort()+".");
    client.initialize(this);
    this.clients.push(client);
};

ClientManager.prototype.softReload = function() {
    this.log.info("Beginning soft reload...");
    var log = this.log;

    //delete everything in require cache.
    for (var prop in require.cache) {
        if(require.cache.hasOwnProperty(prop)){
            this.log.trace("Deleting " + prop + " from require cache.");
            delete require.cache[prop];
        }
    }

    //reload the CommandProcessor and AutoResponseProcessor.
    this.commandProcessor = new (require("./CommandProcessor"))(this.log);
    this.autoResponseProcessor = new (require("./AutoResponseProcessor"))(this.log);

    //now we can reload all the clients.
    this.reloadClients();
};

/**
 * Reload the CommandProcessor in each Client that this ClientManager manages.
 */
ClientManager.prototype.reloadClients = function() {
    this.log.info("Reloading all clients.");

    //require the code to refresh it
    var Client = require("./Client/Client");
    var Builder = require("./Client/Builder");

    //assign a new builder from refreshed code
    this.builder = new Builder(this.log);

    for (var i = 0; i < this.clients.length; i++) {
        //keep a reference to the IRC client, so it doesn't disconnect.
        var tempIRCClient = this.clients[i].getIRCClient();

        //build a new client using the values from this client.
        var tempClient = Client.build({
            nick: this.clients[i].getNick(),
            realname: this.clients[i].getRealName(),
            username: this.clients[i].getUserName(),
            password: this.clients[i].getPassword(),
            server: this.clients[i].getServer(),
            port: this.clients[i].getPort(),
            alert: this.clients[i].alert,
            channels: this.clients[i].getChannels()
        }, this.log);

        tempClient.ircClient = tempIRCClient;

        this.clients[i].destroy();

        this.clients[i] = tempClient;

        this.clients[i].initialize(this, true);
    };

    this.log.info("Reinitializing polyfill.");
    require('./polyfill.js')(this.log);

    this.log.info("Soft reload complete.");
};

/**
 * Save the configuration of this ClientManager.
 */
ClientManager.prototype.save = function() {
    this.log.info("Saving configuration...");

    //get the current config
    var config = require("./config.json");
    //remove the current server config
    config.servers = [];

    // TODO: fix this
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
        this.log.info('Configuration saved.');
    });
};

ClientManager.prototype.shutdown = function(msg) {
    this.log.info("Shutting down all clients.");
    for (var i = 0; i < this.clients.length; i++) {
        this.clients[i].shutdown(msg);
    };

    var log = this.log;

    setTimeout(function () {
        log.info("Killing process.");
        process.exit(0);
    }, 50);
};

/**
 * Get an API instance.
 * @param  {String} api_name The API to retrieve.
 * @return {Object}          The API.
 */
ClientManager.prototype.getAPI = function(api_name) {
    return (this.APIs[api_name] || null);
};

ClientManager.prototype.getCommandProcessor = function() {
    return this.commandProcessor;
};

ClientManager.prototype.getAutoResponseProcessor = function() {
    return this.autoResponseProcessor;
};

module.exports = ClientManager;