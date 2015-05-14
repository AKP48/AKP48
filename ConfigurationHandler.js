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

var jf = require('jsonfile');
jf.spaces = 4;

/**
 * Handles getting data from and saving data to the config files.
 * @param {Logger} logger The logger to use.
 */
function ConfigurationHandler(cm, logger) {
    this.log = logger.child({module: "ConfigurationHandler"});

    this.clientManager = cm;

    this.permissionsHandler = new (require("./PermissionsHandler"))(logger);

    this.globalConfig = require("./data/config/config");

    this.serverConfig = require("./data/config/servers")(logger);

    this.apiConfig = require("./data/config/api");

    this.channelConfig = require("./data/config/channels")(logger);

    this.powerLevels = this.getPowerLevels();
    this.verifyPowerLevels(this.powerLevels);
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

ConfigurationHandler.prototype.getPowerLevels = function() {
    var powerLevels = {};

    for (var uuid in this.serverConfig) {
        if (this.serverConfig.hasOwnProperty(uuid)) {
            if(this.serverConfig[uuid].powerLevels) {
                powerLevels[uuid] = this.serverConfig[uuid].powerLevels;
            }
        }
    };

    return powerLevels;
};

ConfigurationHandler.prototype.setPowerLevels = function(pl) {
    for(var uuid in pl) {
        if (pl.hasOwnProperty(uuid)) {
            this.serverConfig[uuid].powerLevels = pl[uuid];
        }
    }

    this.powerLevels = pl;

    this.save();
};

ConfigurationHandler.prototype.verifyPowerLevels = function(pl) {
    var uuids = [];
    var servers = this.getServers();
    for (var server in servers) {
        if (servers.hasOwnProperty(server)) {
            if(!pl[server]){
                uuids.push(server);
            }
        }
    };

    if(uuids.length){this.setUpPowerLevels(uuids);}
};

ConfigurationHandler.prototype.setUpPowerLevels = function(uuids) {
    var pl = {};
    for (var i = 0; i < uuids.length; i++) {
        pl[uuids[i]] = {
            banned: -1,
            user: 1,
            channelMod: 100,
            channelOp: 1000,
            serverOp: 5000,
            root: 9000
        };
    };

    this.setPowerLevels(pl);
};

ConfigurationHandler.prototype.getPermissionsHandler = function() {
    return this.permissionsHandler;
};

ConfigurationHandler.prototype.getPerms = function() {
    return this.permissionsHandler;
};

ConfigurationHandler.prototype.isMcBot = function(nick, channel, serverUUID) {
    var mcBots = this.channelConfig[serverUUID][channel].mcBots;
    if(mcBots) {
        return (mcBots.indexOf(nick) > -1);
    }
    return false;
};

ConfigurationHandler.prototype.getCommandDelimiter = function(channel, serverUUID) {
    var CD = this.channelConfig[serverUUID][channel].commandDelimiter;
    if(CD) {
        return CD;
    }
    return ".";
};

ConfigurationHandler.prototype.save = function() {     
    var globalFile = './data/config/config.json';
    var apiFile = './data/config/api.json';
     
    jf.writeFileSync(globalFile, this.globalConfig);
    jf.writeFileSync(apiFile, this.apiConfig);
    
    for(var server in this.serverConfig) {
        if (this.serverConfig.hasOwnProperty(server)) {
            var file = './data/config/servers/' + server + '.json';
            jf.writeFileSync(file, this.serverConfig[server]);
        }
    }

    for(var server in this.channelConfig) {
        if (this.channelConfig.hasOwnProperty(server)) {
            var file = './data/config/channels/' + server + '.json';
            jf.writeFileSync(file, this.channelConfig[server]);
        }
    }

    this.permissionsHandler.save();
};

module.exports = ConfigurationHandler;
