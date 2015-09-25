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

var path = require('path');
var jsonfile = require('jsonfile');

function ConfigManager(logger, configPath) {
    this.log = logger.child({module: "ConfigManager"});
    this.configPath = (configPath || "");
}

/**
 * Gets the server config.
 * @return {Object} The server config.
 */
ConfigManager.prototype.getServerConfig = function () {
    var filePath = path.resolve(this.configPath, "server.json");
    return jsonfile.readFileSync(filePath);
};

/**
 * Gets the channel config.
 * @return {Object} The channel config.
 */
ConfigManager.prototype.getChannelConfig = function () {
    var filePath = path.resolve(this.configPath, "channels.json");
    return jsonfile.readFileSync(filePath);
};

/**
 * Gets the permissions config.
 * @return {Object} The permissions config.
 */
ConfigManager.prototype.getPermissionsConfig = function () {
    var filePath = path.resolve(this.configPath, "permissions.json");
    return jsonfile.readFileSync(filePath);
};

/**
 * Gets the global config.
 * @return {Object} The global config.
 */
ConfigManager.prototype.getGlobalConfig = function () {
    var filePath = path.resolve(this.configPath, "../global.json");
    return jsonfile.readFileSync(filePath);
};

/**
 * Gets the permissions object for a specific user.
 * @param  {String} usermask The user to get permissions for.
 * @return {Object}          The permissions object.
 */
ConfigManager.prototype.getPermissions = function (usermask) {
    var perms = this.getPermissionsConfig();
    if(perms[usermask]) {
        return perms[usermask];
    } else {
        return null;
    }
};

/**
 * Gets the channels that we should be in.
 * @return {String[]} The channels we should be in.
 */
ConfigManager.prototype.getChannels = function () {
    var channelConfig = this.getChannelConfig();
    var channels = [];
    Object.getOwnPropertyNames(channelConfig).forEach(function(channelName){
        if(!channelConfig[channelName].disabled) {
            channels.push(channelName);
        }
    });
    return channels;
};

/**
 * Gets the power level scheme for a channel.
 * @param  {String} channel The channel to get power levels for.
 * @return {Object}         An object describing the power level scheme.
 */
ConfigManager.prototype.getChannelPowerLevels = function (channel) {
    var serverConfig = this.getServerConfig();
    var globalConfig = this.getGlobalConfig();
    var channelConfig = this.getChannelConfig();

    if(channelConfig && channelConfig[channel] && channelConfig[channel].powerLevels) {
        return channelConfig[channel].powerLevels;
    }

    if(serverConfig && serverConfig.powerLevels) {
        return serverConfig.powerLevels;
    }

    if(globalConfig && globalConfig.powerLevels) {
        return globalConfig.powerLevels;
    }

    return {
        "root": 9001,
        "serverMod": 9000,
        "channelOp": 900,
        "channelMod": 90,
        "normal": 1,
        "banned": -1
    }
};

/**
 * Whether or not the user has permission.
 * @param  {Context} context        The context to check for.
 * @param  {String}  minPowerLevel  The minimum power level.
 * @return {Boolean}                Whether or not the user has permission.
 */
ConfigManager.prototype.hasPermission = function (context, minPowerLevel) {
    var usermask = context.usermask;
    var channel = context.channel;

    var perms = this.getPermissions(usermask);

    //if we didn't get any permissions, the user is "normal".
    if(!perms || !perms.permissions) { return this.getChannelPowerLevels(channel).normal >= this.getChannelPowerLevels(channel)[minPowerLevel]}

    //get user's levels of each type.
    var channelPowerLevel = this.getPermissions(usermask).permissions[channel];
    var globalPowerLevel = this.getPermissions(usermask).permissions["global"];

    //if we didn't succeed in getting one of them, it should be "normal".
    if(!channelPowerLevel) {channelPowerLevel = this.getChannelPowerLevels(channel).normal;}
    if(!globalPowerLevel) {globalPowerLevel = this.getChannelPowerLevels("global").normal;}

    //compare user's levels to channel levels.
    var hasChannelLevel = (channelPowerLevel >= this.getChannelPowerLevels(channel)[minPowerLevel]);
    var hasGlobalLevel = (globalPowerLevel >= this.getChannelPowerLevels("global")[minPowerLevel]);

    //return proper value based on type of permission needed.
    if(minPowerLevel === "root" || minPowerLevel === "serverMod") {
        return (hasGlobalLevel || hasChannelLevel);
    } else {
        return hasChannelLevel;
    }
};

/**
 * Whether or not a user is banned in a channel.
 * @param  {String}  user    The usermask of the user.
 * @param  {String}  channel The channel.
 * @return {Boolean}         Whether or not the user is banned.
 */
ConfigManager.prototype.isBanned = function (user, channel) {
    var perms = this.getPermissions(user);
    // if the user doesn't have a permissions object, they are not banned.
    // if the user doesn't have a config for this channel, they are not banned.
    if(!perms) {return false;}
    if(!perms[channel]) {return false;}
    var channelBanned = (perms[channel] <= this.getChannelPowerLevels(channel).banned);
    var globalBanned = false;

    if(perms["global"]) {globalBanned = (perms["global"] <= this.getChannelPowerLevels("global").banned);}

    // return whether or not the user is banned.
    return (globalBanned || channelBanned);
};

/**
 * Whether or not we're in a channel.
 * @param  {String}  channel The channel to check for.
 * @param  {AKP48}   AKP48   The instance of AKP48 to check.
 * @return {Boolean}         Whether or not we're in the channel.
 */
ConfigManager.prototype.isInChannel = function (channel, AKP48) {
    if(AKP48.ircClient.chans && AKP48.ircClient.chans[channel.toLowerCase()]){
        return true;
    }
    return false;
};

module.exports = ConfigManager;
