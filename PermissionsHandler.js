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

PermissionsHandler.prototype.powerLevel = function(userHostmask, channel, clientUUID) {
    if(!this.permissions[clientUUID]) {
        this.log.warn({uuid: clientUUID}, "Client not found."); return 1;}

    if(!this.permissions[clientUUID].perms) {
        this.log.warn({uuid: clientUUID, perms: this.permissions[clientUUID]}, "Client has no channels defined."); return 1;}

    if(!this.permissions[clientUUID].perms[channel]) {
        this.log.warn({uuid: clientUUID, channel: channel, perms: this.permissions[clientUUID]}, "Channel not found."); return 1;}

    if(!this.permissions[clientUUID].perms[channel].users) {
        this.log.warn({uuid: clientUUID, channel: channel, perms: this.permissions[clientUUID]}, "Channel has no users defined."); return 1;}

    if(!this.permissions[clientUUID].perms[channel].users[userHostmask]) {
        this.log.warn({uuid: clientUUID, channel: channel, user: userHostmask, perms: this.permissions[clientUUID]}, "User not found."); return 1;}

    return this.permissions[clientUUID].perms[channel].users[userHostmask].powerLevel;
};

PermissionsHandler.prototype.powerLevelFromContext = function(context) {
    var uuid = context.getClient().uuid;
    var channel = context.getChannel();
    var user = context.getUser().getHostmask();

    return this.powerLevel(user, channel, uuid);
};

module.exports = PermissionsHandler;
