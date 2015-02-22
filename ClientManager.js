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

    // load all of the clients on creation of this object.
    this.loadClients(config);

    // builder
    this.builder = new Builder(logger);

    this.log.info("Creating Git Listener");
    this.gitListener = new GitListener(this, logger);
}

/**
 * Load all clients from config file.
 * @param {JSON} config The config file.
 */
ClientManager.prototype.loadClients = function(config) {
    log.info("Loading client information...");
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
    //remove all sorts of cached objects from the cache
    //starting with all commands
    require('fs').readdirSync(__dirname+"/Commands").each(function(file) {
        log.trace("Deleting Commands/"+file+" from require cache.");
        delete require.cache[require.resolve('./Commands/'+file)];
    });

    //all api objects
    require('fs').readdirSync(__dirname + '/API/').each(function(file) {
        log.trace("Deleting API/"+file+" from require cache.");
        delete require.cache[require.resolve('./API/' + file)];
    });

    //all AKP48 client objects
    require('fs').readdirSync(__dirname + '/Client/').each(function(file) {
        log.trace("Deleting Client/"+file+" from require cache.");
        delete require.cache[require.resolve('./Client/' + file)];
    });

    //all regular expression objects
    require('fs').readdirSync(__dirname + '/Regex/').each(function(file) {
        log.trace("Deleting Regex/"+file+" from require cache.");
        delete require.cache[require.resolve('./Regex/' + file)];
    });

    //all autoresponses
    require('fs').readdirSync(__dirname + '/AutoResponses').each(function(file) {
        log.trace("Deleting AutoResponses/"+file+" from require cache.");
        delete require.cache[require.resolve('./AutoResponses/' + file)];
    });

    //the command processor, autoresponse processor, and configuration file
    log.trace("Deleting CommandProcessor from require cache.")
    delete require.cache[require.resolve('./CommandProcessor')];
    log.trace("Deleting AutoResponseProcessor from require cache.")
    delete require.cache[require.resolve('./AutoResponseProcessor')];
    log.trace("Deleting config.json from require cache.")
    delete require.cache[require.resolve('./config.json')];

    //the polyfill file
    log.trace("Deleting polyfill.js from require cache.")
    delete require.cache[require.resolve('./polyfill.js')];

    //the package.json file
    log.trace("Deleting package.json from require cache.")
    delete require.cache[require.resolve('./package.json')];

    //and finally, the autoresponse and command loaders.
    log.trace("Deleting AutoResponses index from require cache.")
    delete require.cache[require.resolve('./AutoResponses/')];
    log.trace("Deleting Commands index from require cache.")
    delete require.cache[require.resolve('./Commands/')];

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
    this.builder = new Builder();

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
        });

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

    setTimeout(function () {
        this.log.info("Killing process.");
        process.exit(0);
    }, 50);
};

module.exports = ClientManager;
