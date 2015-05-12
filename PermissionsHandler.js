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
 * Handles getting data from and saving data to the permissions files.
 * @param {Logger} logger The logger to use.
 */
function PermissionsHandler(logger) {
    this.log = logger.child({module: "PermissionsHandler"});
    this.permissions = require("./data/config/perm")(logger)
}

PermissionsHandler.prototype.addPermission = function(user, channel, permission) {
    
};

PermissionsHandler.prototype.hasPermission = function(user, channel, permission) {
    
};

PermissionsHandler.prototype.powerLevel = function(userHostmask, channel, clientUUID) {
    if(!this.permissions[clientUUID]) {
        this.log({uuid: clientUUID, perms: this.permissions}, "Client not found."); return 1;}

    if(!this.permissions[clientUUID][channel]) {
        this.log({uuid: clientUUID, channel: channel, perms: this.permissions}, "Channel not found."); return 1;}

    if(!this.permissions[clientUUID][channel].users) {
        this.log({uuid: clientUUID, channel: channel, perms: this.permissions}, "Channel has no users defined."); return 1;}

    if(!this.permissions[clientUUID][channel].users[userHostmask]) {
        this.log({uuid: clientUUID, channel: channel, user: userHostmask, perms: this.permissions}, "User not found."); return 1;}

    return this.permissions[clientUUID][channel].users[userHostmask].powerLevel;
};

PermissionsHandler.prototype.powerLevel = function(context) {
    return this.powerLevel(context.getUser().getHostmask(), context.getChannel(), context.getClient().uuid);
};

module.exports = PermissionsHandler;
