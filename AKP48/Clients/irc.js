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
var Message = require('../Message');

/**
 * The IRC Client.
 * @param {Logger} logger  The logger.
 * @param {Object} AKP48   The running instance of AKP48.
 * @param {Object} client  The raw IRC client to use.
 */
function IRCClient(logger, AKP48, client) {
    this.log = logger.child({module: "IRCClient"});
    this.AKP48 = AKP48;
    this.ircClient = (client || null);

    this.initialize();
}

IRCClient.prototype.initialize = function () {
    var config = this.AKP48.configManager.getServerConfig();
    var channels = this.AKP48.configManager.getChannels();

    if(!this.ircClient) {
        this.ircClient = new irc.Client(config.address, config.nick,
            {userName: config.username, realName: config.realname, port: config.port,
             channels: channels, password: (config.password.length ? config.password : null),
             floodProtection: (config.floodProtection || true), floodProtectionDelay: (config.floodProtectionDelay || 250),
             autoRejoin: (config.autoRejoin || true), encoding: (config.encoding || "utf-8")});
    } else {
        // We can't blindly remove all listeners, because we'll remove the raw message listener that
        // the ircClient uses internally, which means we won't get any more messages... ever.
        //this.ircClient.removeAllListeners();
        this.ircClient.removeAllListeners('registered');
        this.ircClient.removeAllListeners('kick');
        this.ircClient.removeAllListeners('message');
        this.ircClient.removeAllListeners('action');
        this.ircClient.removeAllListeners('invite');
        this.ircClient.removeAllListeners('error');

        // TODO: compare channels in ircClient to channels in config, make the two match.
    }

    var self = this;

    this.ircClient.on('registered', function (message) {
        self.handleRegister(message);
    });

    this.ircClient.on('kick', function (channel, nick, by, reason) {
        self.handleKick(channel, nick, by, reason);
    });

    this.ircClient.on('message', function (nick, to, text, message) {
        self.handleMessage(nick, to, text, message);
    });

    this.ircClient.on('action', function (nick, to, text, message) {
        self.handleAction(nick, to, text, message);
    });

    this.ircClient.on('invite', function (channel, from, message) {
        self.handleInvite(channel, from, message);
    });

    this.ircClient.on('error', function(message){self.log.error(message)});

    this.nick = this.ircClient.nick;
};

/**
 * Handle a register message.
 */
IRCClient.prototype.handleRegister = function () {
    var config = this.AKP48.configManager.getServerConfig();
    this.log.info("Connected to " + config.address + ":" + config.port + " with nick '" + this.ircClient.nick + "'");
};

/**
 * Handle an ACTION.
 * @param  {String} nick    Who performed the ACTION.
 * @param  {String} to      Where the ACTION was seen.
 * @param  {String} text    The text of the ACTION.
 * @param  {Object} message The full IRC message object.
 */
IRCClient.prototype.handleAction = function (nick, to, text, message) {
    message.isAction = true;
    this.handleMessage(nick, to, text, message);
};

/**
 * Handle an IRC kick message.
 * @param  {String} channel The channel someone was kicked from.
 * @param  {String} nick    The kickee.
 * @param  {String} by      The kicker.
 * @param  {String} reason  The reason for kicking.
 */
IRCClient.prototype.handleKick = function (channel, nick, by, reason) {
    //TODO: This.
};

/**
 * Handle a message.
 * @param  {String} nick    The nick that sent this message.
 * @param  {String} to      Where this message was sent to.
 * @param  {String} text    The text of this message.
 * @param  {Object} message The raw IRC message object.
 */
IRCClient.prototype.handleMessage = function (nick, to, text, message) {
    var message = new Message(nick, to, text, message.user, message.host, message.prefix,
                              message.isAction, message.isProxied, message.originalNick);
    this.AKP48.handleMessage(message);
};

/**
 * Handle an IRC invite.
 * @param  {String} channel Where we were invited to.
 * @param  {String} from    Who invited us.
 * @param  {Object} message The full IRC message object.
 */
IRCClient.prototype.handleInvite = function (channel, from, message) {
    //TODO: Also this.
};

IRCClient.prototype.say = function (msg, channel, directedAt) {
    var message = (directedAt ? (directedAt + ": ") : "");
    message += msg;
    this.ircClient.say(channel, message);
};

/**
 * Send a NOTICE to a user.
 * @param  {String} msg  The message to send.
 * @param  {String} user The user to send to.
 */
IRCClient.prototype.notice = function (msg, user) {
    this.ircClient.notice(user, msg);
};

/**
 * Send a private message to a user.
 * @param  {String} msg  The message to send.
 * @param  {String} user The user to send to.
 */
IRCClient.prototype.privmsg = function (msg, user) {
    this.say(msg, user);
};

/**
 * Disconnect from the IRC server.
 * @param  {String} message The disconnect message to use.
 */
IRCClient.prototype.disconnect = function (message) {
    this.ircClient.disconnect(message);
};

/**
 * Get the channels this client is connected to.
 * @return {Array} An array of channel names.
 */
IRCClient.prototype.getChannels = function () {
    return Object.keys(this.ircClient.chans).map(key => key);
};

module.exports = IRCClient;
module.exports.clientType = "irc";
