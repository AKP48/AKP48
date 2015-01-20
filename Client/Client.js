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

var irc = require('irc');
var CommandProcessor = require("../CommandProcessor");

/**
 * An IRC client.
 */
function Client() {
    // The nickname this client uses.
    this.nick = "IRCBot9000";

    // The server this client is connected to.
    this.server = "kuroi.irc.nolimitzone.com";

    // The username this client uses.
    this.username = "IRCBot9000";

    // The realname this client uses.
    this.realname = "IRCBot9000";

    // The password used by this client when connecting to the server.
    this.password = "";

    // The channels this client is connected to.
    this.channels = [];

    // The IRC client being used for this client.
    this.ircClient = null;

    // The ClientManager that manages this client.
    this.clientManager = null;

    // Whether or not this client is temporary. (Will not be saved on configuration saves)
    this.isTemporary = false;

    // The client's CommandProcessor.
    this.commandProcessor = new CommandProcessor();
}

/**
 * Set nickname.
 * @param {String} nick The new nickname.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setNick = function(nick) {
    this.nick = nick;
};

/**
 * Get nickname.
 * @return {String} The nickname.
 */
Client.prototype.getNick = function() {
    return this.nick;
};

/**
 * Set server address.
 * @param {String} server The new server address.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setServer = function(server) {
    this.server = server;
};

/**
 * Get server address.
 * @return {String} The server address.
 */
Client.prototype.getServer = function() {
    return this.server;
};

/**
 * Set real name.
 * @param {String} realname The new real name.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setRealName = function(realname) {
    this.realname = realname;
};

/**
 * Get real name.
 * @return {String} The real name.
 */
Client.prototype.getRealName = function() {
    return this.realname;
};

/**
 * Set user name.
 * @param {String} username The new username.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setUserName = function(username) {
    this.username = username;
};

/**
 * Get user name.
 * @return {String} The user name.
 */
Client.prototype.getUserName = function() {
    return this.username;
};

/**
 * Set server password.
 * @param {String} password The new server password.
 * @TODO Make this immutable once ircClient exists.
 */
Client.prototype.setPassword = function(password) {
    this.password = password;
};

/**
 * Get server password.
 * @return {String} The server password.
 */
Client.prototype.getPassword = function() {
    return this.password;
};

/**
 * Set channels.
 * @param {Array} channels The new channels.
 * @TODO Make this not work once ircClient has been set.
 */
Client.prototype.setChannels = function(channels) {
    this.channels = channels;
};

/**
 * Get channels.
 * @return {Array} The channels.
 */
Client.prototype.getChannels = function() {
    return this.channels;
};

/**
 * Add a channel.
 * @param {Channel} channel Channel to add.
 * @TODO Make IRC client actually connect upon changing here.
 */
Client.prototype.addChannel = function(channel) {
    //just return if this channel is already in the array.
    if(this.channels.indexOf(channel) !== -1) {return;}
    this.channels.push(channel);
};

/**
 * Remove a channel.
 * @param  {Channel} channel Channel to remove.
 * @return {Boolean}         Whether or not the channel was removed.
 * @TODO Make IRC client disconnect upon changing here.
 */
Client.prototype.removeChannel = function(channel) {
    //get index of channel, -1 if non-existent
    var index = this.channels.indexOf(channel);
    if(index > -1) {
        this.channels.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Get channel.
 * @param  {String}  The channel's name.
 * @return {Channel} The channel.
 */
Client.prototype.getChannel = function(channame) {
    for (var i = 0; i < this.channels.length; i++) {
        if(this.channels[i].name === channame) {
            return this.channels[i];
        }
    };
    return false;
};

/**
 * Get the IRC client that this Client uses.
 * @return {irc} The IRC client.
 */
Client.prototype.getIRCClient = function() {
    return this.ircClient;
};

/**
 * Get the ClientManager that controls this Client.
 * @return {ClientManager} The ClientManager.
 */
Client.prototype.getClientManager = function() {
    return this.clientManager;
};

/**
 * Set whether or not this Client should be temporary.
 * @param {Boolean} temporary New temporary status.
 */
Client.prototype.setTemporary = function(isTemporary) {
    this.isTemporary = temporary;
};

/**
 * Get the CommandProcessor for this Client.
 * @return {CommandProcessor} The CommandProcessor.
 */
Client.prototype.getCommandProcessor = function() {
    return this.commandProcessor;
};

/**
 * Reload the client's CommandProcessor.
 */
Client.prototype.reloadCommandProcessor = function() {
    delete this.commandProcessor;
    var CommandProcessor = require("../CommandProcessor");
    this.commandProcessor = new CommandProcessor();
};

/**
 * Initialize the Client by creating an IRC client.
 */
Client.prototype.initialize = function(clientManager) {
    //set the client manager.
    this.clientManager = clientManager;

    //if there is a password, we use it. Otherwise, we leave it undefined, so we don't get an error from some IRC servers.
    var password = (this.getPassword().length ? this.getPassword() : undefined);

    //channels to connect to.
    var channels = [];

    //loop to get channel names
    for (var i = 0; i < this.getChannels().length; i++) {
        if(this.getChannels()[i].getName() && this.getChannels()[i].getName() !== "global") {
            channels.push(this.getChannels()[i].getName());
        }
    };

    //create the IRC client. This automatically connects, as well.
    this.ircClient = new irc.Client(this.getServer(), this.getNick(), { channels: channels, realName: this.getRealName(), password: password, userName: this.getUserName() });

    var self = this;

    this.ircClient.on('message', function(nick, to, text, message) {
        self.getCommandProcessor().process(message, self);
    });
};

/**
 * Say a message to a context.
 * @param  {Context} context The context.
 * @param  {String}  message The message.
 */
Client.prototype.say = function(context, message) {
    var channel = (context.getChannel().getName() === "global" ? context.getUser().getNick() : context.getChannel().getName());
    this.getIRCClient().say(channel, context.getUser().getNick() + ": " + message);
};

/**
 * Clone this Client for configuration-saving.
 * @return {Client} The client.
 */
Client.prototype.clone = function() {
    //just return a blank object if this is supposed to be temporary.
    if(this.isTemporary) {return {};}

    //create new client, set options
    var client = new Client();
    client.setNick(this.getNick());
    client.setServer(this.getServer());
    client.setPassword(this.getPassword());

    //looping through all channels to fix having a blank channel.
    for (var i = 0; i < this.getChannels().length; i++) {
        if(this.getChannels()[i].getName !== "") {
            client.addChannel(this.getChannels()[i]);
        }
    };

    //return the new client
    return client;
};

module.exports = Client;