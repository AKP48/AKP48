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

/**
 * Handles getting data from and saving data to the config files.
 * @param {Logger} logger The logger to use.
 */
function ConfigurationHandler(logger) {
    this.log = logger.child({module: "ConfigurationHandler"});

    this.permissionsHandler = new (require("./PermissionsHandler"))(logger);

    this.globalConfig = require("./data/config/config");

    this.serverConfig = require("./data/config/servers");

    this.apiConfig = require("./data/config/api");

    this.channelConfig = require("./data/config/channels");
}

ConfigurationHandler.prototype.getServers = function() {
    return this.serverConfig;
};

ConfigurationHandler.prototype.getGlobalConfig = function() {
    return this.globalConfig;
};

ConfigurationHandler.prototype.getAPIConfig = function() {
    return this.apiConfig;
};

ConfigurationHandler.prototype.getPermissionsHandler = function() {
    return this.permissionsHandler;
};

ConfigurationHandler.prototype.isMcBot = function(nick, channel, serverUUID) {
    return (this.channelConfig[serverUUID][channel].mcBots.indexOf(nick) > -1);
};

module.exports = ConfigurationHandler;
