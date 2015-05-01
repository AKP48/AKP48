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

module.exports = PermissionsHandler;
