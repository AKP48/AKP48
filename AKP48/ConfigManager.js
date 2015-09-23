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

module.exports = ConfigManager;
