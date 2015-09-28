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

var Context = require('./Context');
var ContextProcessor = require('./Processors/ContextProcessor');

/**
 * AKP48. The main module.
 * @param {Object} options Options to use for this instance.
 * @param {logger} logger  The logger to use.
 */
function AKP48(options, logger) {
    this.Clients = require('./Clients')(logger);
    this.log = logger.child({module: "AKP48"});
    this.instanceManager = options.instanceManager;
    this.uuid = options.uuid;
    this.client = null;
    this.configManager = options.configManager;
    this.cache = new (require("./Helpers/cache"))(logger);
    this.APIs = require("./APIs/")(logger, this.configManager.getGlobalConfig().api, this);

    this.initialize(options.client);
}

/**
 * Initialize this instance of AKP48 as a fresh instance. This gets everything going.
 * It creates a new IRC client for use.
 * @param {Object} client  The pre-existing client to use.
 */
AKP48.prototype.initialize = function (client) {
    var clientType = (this.configManager.getServerConfig().clientType || "irc");

    this.client = new this.Clients[clientType](this.log, this, client);

    this.alert = this.getAlertChannels();
};

/**
 * Handle a message.
 * @param  {Object} The message that was sent.
 */
AKP48.prototype.handleMessage = function (message) {
    var context = new Context(message, this, this.log);
    var log = this.log;
    //process the context.
    return new ContextProcessor(context, log);
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
    var chans = this.client.getChannels();
    for (var i = 0; i < chans.length; i++) {
        if(chans[i].toLowerCase() == channel.toLowerCase()) {
            inChannel = true;
            break;
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
      self.client.disconnect(message);
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
    delete this.client;
};

module.exports = AKP48;
