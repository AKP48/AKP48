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
var Context = require('./Context');
var ContextProcessor = require('./Processors/ContextProcessor');

/**
 * AKP48. The main module.
 * @param {Object} options Options to use for this instance.
 * @param {logger} logger  The logger to use.
 */
function AKP48(options, logger) {
    this.log = logger.child({module: "AKP48"});
    this.instanceManager = options.instanceManager;
    this.uuid = options.uuid;
    this.configManager = options.configManager;
    this.ircClient = options.ircClient;
    this.cache = new (require("./Helpers/cache"))(logger);
    this.APIs = require("./APIs/")(logger, this.configManager.getGlobalConfig().api, this);

    this.initialize();
}

/**
 * Initialize this instance of AKP48 as a fresh instance. This gets everything going.
 * It creates a new IRC client for use.
 */
AKP48.prototype.initialize = function () {
    var config = this.configManager.getServerConfig();
    var channels = this.configManager.getChannels();

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

    this.alert = this.getAlertChannels();
};

/**
 * Handle an IRC register message.
 * @param  {Object} message The full IRC message object.
 */
AKP48.prototype.handleRegister = function (message) {
    var config = this.configManager.getServerConfig();
    this.log.info("Connected to " + config.address + ":" + config.port + " with nick '" + this.ircClient.nick + "'");
};

/**
 * Handle an IRC kick message.
 * @param  {String} channel The channel someone was kicked from.
 * @param  {String} nick    The kickee.
 * @param  {String} by      The kicker.
 * @param  {String} reason  The reason for kicking.
 */
AKP48.prototype.handleKick = function (channel, nick, by, reason) {
    //TODO: This.
};

/**
 * Handle a message.
 * @param  {String} nick    Who sent the message.
 * @param  {String} to      Where the message was seen.
 * @param  {String} text    The text of the message.
 * @param  {Object} message The full IRC message object.
 */
AKP48.prototype.handleMessage = function (nick, to, text, message) {
    var context = new Context(nick, to, text, message, this, this.log);
    var log = this.log;
    //process the context.
    return new ContextProcessor(context, log);
};

/**
 * Handle an ACTION.
 * @param  {String} nick    Who performed the ACTION.
 * @param  {String} to      Where the ACTION was seen.
 * @param  {String} text    The text of the ACTION.
 * @param  {Object} message The full IRC message object.
 */
AKP48.prototype.handleAction = function (nick, to, text, message) {
    message.isAction = true;
    this.handleMessage(nick, to, text, message);
};

/**
 * Handle an IRC invite.
 * @param  {String} channel Where we were invited to.
 * @param  {String} from    Who invited us.
 * @param  {Object} message The full IRC message object.
 */
AKP48.prototype.handleInvite = function (channel, from, message) {
    //TODO: Also this.
};

/**
 * Send a message to a channel.
 * @param  {String} channel The channel.
 * @param  {String} message The message.
 */
AKP48.prototype.say = function (channel, message) {
    this.ircClient.say(channel, message);
};

/**
 * Get an API instance.
 * @param  {String} api_name The API to retrieve.
 * @return {Object}          The API.
 */
AKP48.prototype.getAPI = function (api_name) {
    return (this.APIs[api_name] || {});
};

/**
 * Whether or not AKP48 is in a channel.
 * @param  {String}  channel The channel to check.
 * @return {Boolean}         If AKP48 is in it or not.
 */
AKP48.prototype.isInChannel = function (channel) {
    var inChannel = false;
    for (var key in this.ircClient.chans) {
        if (this.ircClient.chans.hasOwnProperty(key)) {
            if(key.toLowerCase() == channel.toLowerCase()) {
                inChannel = true;
            }
        }
    }
    return inChannel;
};

/**
 * Get the channels that are to be alerted of bot updates.
 * @return {String[]} The channels to be alerted.
 */
AKP48.prototype.getAlertChannels = function () {
    var alert = [];
    var channelConfig = this.configManager.getChannelConfig();
    for (var key in channelConfig) {
        if (channelConfig.hasOwnProperty(key)) {
            var chan = channelConfig[key];
            if(chan.alert) {
                alert.push(key);
            }
        }
    }

    return alert;
};

/**
 * Stop the instance.
 * @param  {String} message The message to send when we quit.
 */
AKP48.prototype.stop = function (message) {
  this.log.debug({uuid: this.uuid}, "Shutting down!");
  var self = this;
  setTimeout(function(){
      self.ircClient.disconnect(message);
      setTimeout(function(){
          delete self.ircClient;
      }, 250);
  }, 50);
};

/**
 * Destroy the instance without disconnecting from IRC.
 */
AKP48.prototype.destroy = function () {
    this.log.debug({uuid:this.uuid}, "Destroying instance!");
    delete this.ircClient;
};

module.exports = AKP48;
