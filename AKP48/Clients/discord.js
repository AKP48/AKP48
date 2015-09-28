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

var Discord = require('discord.js');
var Message = require('../Message');
var c = require('irc-colors');

/**
 * The Discord Client.
 * @param {Logger} logger  The logger.
 * @param {Object} AKP48   The running instance of AKP48.
 * @param {Object} client  The raw Discord client to use.
 */
function DiscordClient(logger, AKP48, client) {
    this.log = logger.child({module: "DiscordClient"});
    this.AKP48 = AKP48;
    this.client = (client || null);
    this.nick = "";

    this.initialize();
}

DiscordClient.prototype.initialize = function () {
    var config = this.AKP48.configManager.getServerConfig();
    var channels = this.AKP48.configManager.getChannels();

    if(!this.client) {
        this.client = new Discord.Client();
    } else {
        this.client.removeAllListeners('message');
    }

    var self = this;

    this.client.on('ready', function () {
        self.handleReady();
    });

    this.client.on('message', function (message) {
        self.handleMessage(message);
    });

    this.client.on('unknown', function(message){self.log.trace(message, "Received unknown packet.")});

    this.client.login(config.username, config.password);
};

/**
 * Handle a ready message.
 */
DiscordClient.prototype.handleReady = function () {
    var config = this.AKP48.configManager.getServerConfig();
    this.log.info("Ready to begin! Serving in " + this.client.channels.length + " channels");
    this.nick = this.client.getUser("username", config.name).username;
};

/**
 * Handle a message.
 * @param  {Object} message The raw message object.
 */
DiscordClient.prototype.handleMessage = function (message) {
    if(message.channel.user) { //message is a PM, and must be handled differently.
        var message = new Message(message.author.username, message.channel.user.id, message.content,
                                  message.author.id, "", message.author.id, false, false);
    } else {
        var message = new Message(message.author.username, message.channel.name, message.content,
                                  message.author.id, "", message.author.id, false, false);
    }

    this.AKP48.handleMessage(message);
};

/**
 * Send a message to a channel.
 * @param  {String} channel    The channel to send to.
 * @param  {String} msg        The message to send.
 * @param  {String} directedAt Who this message should be directed at.
 */
DiscordClient.prototype.say = function (channel, msg, directedAt) {
    var message = (directedAt ? ("@" + directedAt + ": ") : "");
    message += c.stripColorsAndStyle(msg);
    var channel = (this.client.getChannel("name", channel) || this.client.getPMChannel("id", channel) || this.client.getUser("id", channel));
    this.client.sendMessage(channel, message);
};

/**
 * Send a NOTICE to a user.
 * @param  {String} user The user to send to.
 * @param  {String} msg  The message to send.
 */
DiscordClient.prototype.notice = function (user, msg) {
    this.privmsg(user, msg); //discord doesn't support notices, so we use private messages.
};

/**
 * Send an ACTION to a channel.
 * @param  {String} channel The channel to send to.
 * @param  {String} msg     The message to send.
 */
DiscordClient.prototype.action = function (channel, msg) {
    this.say(channel, "/me "+msg); //discord doesn't support actions yet.
};

/**
 * Send a private message to a user.
 * @param  {String} user The user to send to.
 * @param  {String} msg  The message to send.
 */
DiscordClient.prototype.privmsg = function (user, msg) {
    var userID = this.client.getUser("username", user).id;
    this.say(userID, msg);
};

/**
 * Disconnect from the IRC server.
 * @param  {String} message The disconnect message to use.
 */
DiscordClient.prototype.disconnect = function (message) {
    this.client.logout();
};

/**
 * Get the channels this client is connected to.
 * @return {Array} An array of channel names.
 */
DiscordClient.prototype.getChannels = function () {
    return this.client.channels;
};

/**
 * Change the nick of this client.
 * @param  {String} nick The nick to change to.
 */
DiscordClient.prototype.changeNick = function (nick) {
    this.client.setUsername(nick);
};

/**
 * Get the raw client we are using.
 * @return {Object} The raw client.
 */
DiscordClient.prototype.getRawClient = function () {
    return this.client;
};

module.exports = DiscordClient;
module.exports.clientType = "discord";
