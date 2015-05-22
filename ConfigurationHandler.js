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
    this.initialize();
}

ConfigurationHandler.prototype.initialize = function() {
    for(var server in this.serverConfig) {
        if(!this.channelConfig[server]) {
            this.channelConfig[server] = {};
        }
    }

    this.save();
};

ConfigurationHandler.prototype.getServers = function() {
    return this.serverConfig;
};

ConfigurationHandler.prototype.getGlobalConfig = function() {
    return this.globalConfig;
};

ConfigurationHandler.prototype.getAPIConfig = function() {
    return this.apiConfig;
};

ConfigurationHandler.prototype.getChannel = function (server, channel) {
    if(!this.channelConfig[server]) { return {}; }
    return this.channelConfig[server][channel];
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
    if(this.channelConfig[serverUUID]){
        if(!this.channelConfig[serverUUID][channel]){
            this.channelConfig[serverUUID][channel] = {};
        }
        var mcBots = this.channelConfig[serverUUID][channel].mcBots;
        if(mcBots) {
            return (mcBots.indexOf(nick) > -1);
        }
    } else {
        this.initialize();
    }
    
    return false;
};

ConfigurationHandler.prototype.toggleIsMcBot = function(nick, channel, serverUUID) {
    if(this.channelConfig[serverUUID]){
        if(!this.channelConfig[serverUUID][channel]){
            this.channelConfig[serverUUID][channel] = {};
        }
        var mcBots = this.channelConfig[serverUUID][channel].mcBots;
        if(mcBots) {
            if(mcBots.indexOf(nick) > -1) {
                mcBots.splice(mcBots.indexOf(nick), 1);
                return false;
            } else {
                mcBots.push(nick);
                return true;
            }
        } else {
            this.channelConfig[serverUUID][channel].mcBots = [];
            this.channelConfig[serverUUID][channel].mcBots.push(nick);
            return true;
        }
        this.save();
    } else {
        this.initialize();
        this.toggleIsMcBot(nick, channel, serverUUID);
    }
};

ConfigurationHandler.prototype.isBot = function(nick, channel, serverUUID) {
    if(this.channelConfig[serverUUID]){
        if(!this.channelConfig[serverUUID][channel]){
            this.channelConfig[serverUUID][channel] = {};
        }
        var bots = this.channelConfig[serverUUID][channel].bots;
        if(bots) {
            return (bots.indexOf(nick) > -1);
        }
    } else {
        this.initialize();
    }
    
    return false;
};

ConfigurationHandler.prototype.toggleIsBot = function(nick, channel, serverUUID) {
    if(this.channelConfig[serverUUID]){
        if(!this.channelConfig[serverUUID][channel]){
            this.channelConfig[serverUUID][channel] = {};
        }
        var bots = this.channelConfig[serverUUID][channel].bots;
        if(bots) {
            if(bots.indexOf(nick) > -1) {
                bots.splice(bots.indexOf(nick), 1);
                return false;
            } else {
                mcBots.push(nick);
                return true;
            }
        } else {
            this.channelConfig[serverUUID][channel].bots = [];
            this.channelConfig[serverUUID][channel].bots.push(nick);
            return true;
        }
        this.save();
    } else {
        this.initialize();
        this.toggleIsBot(nick, channel, serverUUID);
    }
};

ConfigurationHandler.prototype.getCommandDelimiter = function(channel, serverUUID) {
    if(this.channelConfig[serverUUID]) {
        if(!this.channelConfig[serverUUID][channel]){
            this.channelConfig[serverUUID][channel] = {};
        }
        var CD = this.channelConfig[serverUUID][channel].commandDelimiter;
        if(CD) {
            return CD;
        }
    } else {
        this.initialize();
    }
    
    return ".";
};

ConfigurationHandler.prototype.addChannel = function(channel, serverUUID) {
    if(this.channelConfig[serverUUID]) {
        if(this.channelConfig[serverUUID][channel]) {
            this.channelConfig[serverUUID][channel].disabled = false;
        } else {
            this.channelConfig[serverUUID][channel] = 
            {
                "name": channel,
                "commandDelimiter": ".",
                "mcBots": []
            };
            this.permissionsHandler.addChannel(channel, serverUUID);
        }

        this.save();
    } else {
        this.initialize();
        this.addChannel(channel, serverUUID);
    }
};

ConfigurationHandler.prototype.removeChannel = function(channel, serverUUID) {
    if(this.channelConfig[serverUUID]) {
        if(this.channelConfig[serverUUID][channel]) {
            this.channelConfig[serverUUID][channel].disabled = true;
            this.save();
        }
    } else {
        this.initialize();
    }
};

ConfigurationHandler.prototype.isInChannel = function(channel, serverUUID) {
    if(!this.channelConfig[serverUUID]) {return false;}
    if(!this.channelConfig[serverUUID][channel] && !this.channelConfig[serverUUID][channel].disabled) {return false;}
    return true;
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
