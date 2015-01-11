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
 * A user.
 */
function User() {
    // The user's nickname.
    this.nick = "";

    // The user's full hostmask.
    this.hostmask = "";

    // The user's permissions.
    this.permissions = ["user.command.use"];

    // The user's flood protection violation level.
    this.violationLevel = 0;

    // Whether or not this user is a Real IRC User™.
    this.isRealIRCUser = true;
}

/**
 * Set nickname.
 * @param {String} nick The nickname.
 */
User.prototype.setNick = function(nick) {
    this.nick = nick;
};

/**
 * Get nickname.
 * @return {String} The nickname.
 */
User.prototype.getNick = function() {
    return this.nick;
};

/**
 * Set hostmask.
 * @param {String} hostmask The hostmask.
 */
User.prototype.setHostmask = function(hostmask) {
    this.hostmask = hostmask;
};

/**
 * Get hostmask.
 * @return {String} The hostmask.
 */
User.prototype.getHostmask = function() {
    return this.hostmask;
};

/**
 * Set permissions.
 * @param {Array} permissions The permissions.
 */
User.prototype.setPermissions = function(permissions) {
    this.permissions = permissions;
};

/**
 * Get permissions.
 * @return {Array} The permissions.
 */
User.prototype.getPermissions = function() {
    return this.permissions;
};

/**
 * Add a permission.
 * @param {String} permission The permission.
 */
User.prototype.addPermission = function(permission) {
    //just return if this permission is already in the array.
    if(this.permissions.indexOf(permission) !== -1) {return;}
    this.permissions.push(permission);
};

/**
 * Remove a permission.
 * @param  {String} permission The permission.
 * @return {Boolean}           True if permission added, false if permission already there.
 */
User.prototype.removePermission = function(permission) {
    //get index of permission, -1 if non-existent
    var index = this.permissions.indexOf(permission);
    if(index > -1) {
        this.permissions.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Whether or not the user has a permission.
 * @param  {String}  permission The permission to check.
 * @return {Boolean}            If the user has the permission.
 */
User.prototype.hasPermission = function(permission) {
    //get index of permission, -1 if non-existent
    if(this.permissions.indexOf(permission) > -1) {
        return true;
    }
    return false;
};

/**
 * Set violation level.
 * @param {Double} violationLevel Violation level.
 */
User.prototype.setViolationLevel = function(violationLevel) {
    this.violationLevel = violationLevel;
};

/**
 * Get violation level.
 * @return {Double} Violation level.
 */
User.prototype.getViolationLevel = function() {
    return this.violationLevel;
};

/**
 * Set isRealIRCUser.
 * @param {Boolean} isRealIRCUser Whether or not the user is a Real IRC User™.
 */
User.prototype.setIsRealIRCUser = function(isRealIRCUser) {
    this.isRealIRCUser = isRealIRCUser;
};

module.exports = User;