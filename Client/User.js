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

    // The user's power level.
    this.powerLevel = 0;

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
 * Set power level.
 * @param {Number} powerLevel The power level.
 */
User.prototype.setPowerLevel = function(powerLevel) {
    this.powerLevel = powerLevel;
};

/**
 * Get power level.
 * @return {Number} The power level.
 */
User.prototype.getPowerLevel = function() {
    return this.powerLevel;
};

/**
 * Set isRealIRCUser.
 * @param {Boolean} isRealIRCUser Whether or not the user is a Real IRC User™.
 */
User.prototype.setIsRealIRCUser = function(isRealIRCUser) {
    this.isRealIRCUser = isRealIRCUser;
};

module.exports = User;

/**
 * Builds a User using a message and Client.
 * Message and Context are optional
 * @param  {Message} message The IRC message to use.
 * @param  {Context} context The context to use.
 * @param  {JSON}    options The options to use.
 * @return {User}            The User.
 */
module.exports.build = function build(message, context, options) {
    //Make ourselves a new User...
    var user = new User();

    //TODO: Make this work.
    // if(message && context) {
    //     //if the user this came from is a Minecraft bot,
    //     if(context.getChannel().getMcBots().indexOf(message.nick) !== -1){
    //         //say so.
    //         user.setIsRealIRCUser(false);

    //         //find nick
    //         start = message.args[1].indexOf('(');
    //         end = message.args[1].indexOf(')');

    //         //set nick
    //         user.setNick(message.args[1].substring(start + 1, end));

    //         //set hostmask
    //         user.setHostmask(user.getNick()+"!"+message.user+"@"+message.host);
    //     } else {
    //         //the user is legit, so just use their nick and hostmask.
    //         user.setNick(message.nick);
    //         user.setHostmask(message.prefix);
    //     }
    // } else if (message && !options) {
    //     options = message;
    // }

    if(options.nick) {
        user.setNick(options.nick)
    }
    if(options.hostmask) {
        user.setHostmask(options.hostmask);
    }
    if(options.powerLevel) {
        user.setPowerLevel(options.powerLevel);
    }
    if(options.isRealIRCUser) {
        user.setIsRealIRCUser(options.isRealIRCUser);
    }

    return user;
}
