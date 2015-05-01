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
var CommandProcessor = require("./CommandProcessor");
var AutoResponseProcessor = require("./AutoResponseProcessor");
var ActionHandler = require("./ActionHandler");
var GitListener = require('./GitListener');

/**
 * The ClientManager.
 * @param {JSON}   config The IRCBot configuration.
 * @param {Logger} logger The bunyan logger.
 */
function ClientManager(logger) {
    // The logger.
    this.log = logger.child({module: "ClientManager"});

    // array of all clients
    this.clients = [];

    // API objects.
    this.APIs = require("./API/")(logger);

    // handles config stuff.
    this.config = new (require("./ConfigurationHandler"))(logger);
    // make config accessible globally.
    GLOBAL.config = this.config;

    // load all of the clients.
    this.loadClients(this.config.getServers());

    // The CommandProcessor.
    this.commandProcessor = new CommandProcessor(this.log);

    // The AutoResponseProcessor.
    this.autoResponseProcessor = new AutoResponseProcessor(this.log);

    // The ActionHandler.
    this.actionHandler = new ActionHandler(this.log);

    // The cache.
    this.cache = new (require("./lib/cache"))(logger);

    this.log.info("Creating Git Listener");
    this.gitListener = new GitListener(this, logger);
}

/**
 * Load all clients from server config file.
 * @param {JSON} servers The server config file.
 */
ClientManager.prototype.loadClients = function(servers) {
    this.log.info("Loading client information...");
    servers.each(function (server) {
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

    //reload the ActionHandler
    this.actionHandler = new (require("./ActionHandler"))(this.log);

    //reload the API loader
    this.APIs = require("./API/")(this.log);

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

    for (var i = 0; i < this.clients.length; i++) {
        //keep a reference to the IRC client, so it doesn't disconnect.
        var tempIRCClient = this.clients[i].getIRCClient();

        //build a new client using the values from this client.
        var tempClient = Client.build({
            uuid: this.clients[i].uuid,
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
    var serverArr = [];

    for (var i = 0; i < this.clients.length; i++) {
        serverArr.push(this.clients[i].getConfigObject());
    };

    require('fs').writeFile('./data/config/servers.json', JSON.stringify(serverArr, null, 4), function (err) {
        if (err) return this.log.err(err, "Error saving configuration.");
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

ClientManager.prototype.getActionHandler = function() {
    return this.actionHandler;
};

ClientManager.prototype.getCache = function() {
    return this.cache;
};

module.exports = ClientManager;
