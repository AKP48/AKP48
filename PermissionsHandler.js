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
 * Handles getting data from and saving data to the permissions files.
 * @param {Logger} logger The logger to use.
 */
function PermissionsHandler(logger) {
    this.log = logger.child({module: "PermissionsHandler"});
    this.permissions = require("./data/config/perm")(logger);
}

PermissionsHandler.prototype.setPowerLevel = function(userHostmask, channel, clientUUID, powerLevel) {
    if(!this.permissions[clientUUID]) {
        this.permissions[clientUUID] = {};
    }

    if(!this.permissions[clientUUID][channel]) {
        this.permissions[clientUUID][channel] = {};
    }

    if(!this.permissions[clientUUID][channel].users) {
        this.permissions[clientUUID][channel].users = {};
    }

    if(!this.permissions[clientUUID][channel].users[userHostmask]) {
        this.permissions[clientUUID][channel].users[userHostmask] = {};
    }

    this.permissions[clientUUID][channel].users[userHostmask].powerLevel = powerLevel;

    this.save();
};

PermissionsHandler.prototype.powerLevel = function(userHostmask, channel, clientUUID) {
    var userPL = config.powerLevels[clientUUID]["user"];

    if(!this.permissions[clientUUID]) {return userPL;}
    if(!this.permissions[clientUUID][channel]) {return userPL;}
    if(!this.permissions[clientUUID][channel].users) {return userPL;}
    if(!this.permissions[clientUUID][channel].users[userHostmask]) {return userPL;}

    return this.permissions[clientUUID][channel].users[userHostmask].powerLevel;
};

PermissionsHandler.prototype.powerLevelFromContext = function(context) {
    var uuid = context.getClient().uuid;
    var channel = context.getChannel();
    var user = context.getUser().getHostmask();

    return this.powerLevel(user, channel, uuid);
};

PermissionsHandler.prototype.addChannel = function(channel, clientUUID) {
    if(!this.permissions[clientUUID]) {
        this.permissions[clientUUID] = {};
    }

    this.permissions[clientUUID][channel] = {
        "users": {}
    }
};

PermissionsHandler.prototype.removeChannel = function(channel, clientUUID) {
    if(!this.permissions[clientUUID]) {
        return;
    }

    if(this.permissions[clientUUID][channel]) {
        delete this.permissions[clientUUID][channel];
    }
};

PermissionsHandler.prototype.save = function() {
    for(var server in this.permissions) {
        if (this.permissions.hasOwnProperty(server)) {
            var file = './data/config/perm/' + server + '.json';
            jf.writeFileSync(file, this.permissions[server]);
        }
    }
};

module.exports = PermissionsHandler;
