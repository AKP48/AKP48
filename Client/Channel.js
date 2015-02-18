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
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'AKP48 Channel',
    streams: [{
        type: 'rotating-file',
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    },
    {
        stream: process.stdout
    }]
});

/**
 * A channel.
 */
function Channel() {
    // The name of this channel.
    this.name = "";

    // The channel's users.
    this.users = [];

    // The channel's Minecraft bots.
    this.mcBots = [];

    // The channel's command delimiter.
    this.commandDelimiter = ".";

    // The channel's flood protection parameters. See example.config.json for more information.
    this.floodProtectionParams = {
        "enabled": true,
        "secondsToReset": 30,
        "maxViolationLevel": 8,
        "penaltyMultiplier": 1.25
    }

    //set an interval to reset users violation levels.
    var self = this;
    setInterval(function(){self.resetViolationLevels();}, this.floodProtectionParams.secondsToReset*1000);
}

/**
 * Set the channel's name
 * @param {String} name The new name.
 */
Channel.prototype.setName = function(name) {
    this.name = name;
};

/**
 * Get the channel's name.
 * @return {String} The name.
 */
Channel.prototype.getName = function() {
    return this.name;
};

/**
 * Add a user.
 * @param {User} user The user.
 */
Channel.prototype.addUser = function(user) {
    //just return if this user is already in the array.
    if(this.users.indexOf(user) !== -1) {return;}
    this.users.push(user);
};

/**
 * Remove a user.
 * @param  {User}    user The user.
 * @return {Boolean}      Whether or not the remove was successful.
 */
Channel.prototype.removeUser = function(user) {
    //get index of user, -1 if non-existent
    var index = this.users.indexOf(user);
    if(index > -1) {
        this.users.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Get a user.
 * @param  {String}  nickOrHost The user's nick or hostmask.
 * @param  {Boolean} create     True to create user
 * @return {User}               The user, null if no user.
 */
Channel.prototype.getUser = function(nickOrHost, create) {
    for (var i = 0; i < this.users.length; i++) {
        if(this.users[i].getHostmask() === nickOrHost || this.users[i].getNick() === nickOrHost) {
            return this.users[i];
        }
    }
    if (create === true) {
        var user = new User();
        if (nickOrHost.contains("!")) {
            user.setHostmask(nickOrHost);
        } else {
            user.setNick(nickOrHost);
        }
        this.addUser(user);
        return user;
    }
    return null;
};

/**
 * Set the users
 * @param {Array} users The users.
 */
Channel.prototype.setUsers = function(users) {
    this.users = users;
};

/**
 * Get the users.
 * @return {Array} The users.
 */
Channel.prototype.getUsers = function() {
    return this.users;
};

/**
 * Add a Minecraft bot.
 * @param {String} nick The Minecraft bot's nickname.
 */
Channel.prototype.addMcBot = function(nick) {
    //just return if this Minecraft bot is already in the array.
    if(this.mcBots.indexOf(nick) !== -1) {return;}
    this.mcBots.push(nick);
};

/**
 * Remove a Minecraft bot.
 * @param  {String} nick The Minecraft bot to remove.
 * @return {Boolean}     Whether or not the remove was successful.
 */
Channel.prototype.removeMcBot = function(nick) {
    //get index of mcBot, -1 if non-existent
    var index = this.mcBots.indexOf(nick);
    if(index > -1) {
        this.mcBots.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Set the array of Minecraft bots.
 * @param {Array} mcBots The new Minecraft bots.
 */
Channel.prototype.setMcBots = function(mcBots) {
    this.mcBots = mcBots;
};

/**
 * Get the array of Minecraft bots.
 * @return {Array} The Minecraft bots.
 */
Channel.prototype.getMcBots = function() {
    return this.mcBots;
};

/**
 * Set the command delimiter.
 * @param {String} commandDelimiter The new command delimiter.
 */
Channel.prototype.setCommandDelimiter = function(commandDelimiter) {
    this.commandDelimiter = commandDelimiter;
};

/**
 * Get the command delimiter.
 * @return {String} The command delimiter.
 */
Channel.prototype.getCommandDelimiter = function() {
    return this.commandDelimiter;
};

/**
 * Ban a user.
 * @param  {User} user The user to ban.
 */
Channel.prototype.banUser = function(user) {
    //get user for sure.
    var banUser = this.getUser(user.getHostmask());
    banUser.addPermission("user.command.banned");
    log.info("User", banUser.getNick(), "banned from Channel", this.getName()+".");
};

/**
 * Unban a user.
 * @param  {User} user The user to unban.
 */
Channel.prototype.unbanUser = function(user) {
    //get user for sure.
    var unbanUser = this.getUser(user.getHostmask());
    unbanUser.removePermission("user.command.banned");
    log.info("User", banUser.getNick(), "unbanned from Channel", this.getName()+".");
};

/**
 * Check if a user has been banned.
 * @param  {User} user The user to check.
 * @return {Boolean}   Whether or not the user has been banned.
 */
Channel.prototype.isBanned = function(user) {
    //get user for sure.
    var checkUser = this.getUser(user.getHostmask());
    return checkUser.hasPermission("user.command.banned");
};

/**
 * Op a user.
 * @param  {User} user The user to op.
 */
Channel.prototype.opUser = function(user) {
    //get user for sure.
    var opUser = this.getUser(user.getHostmask());
    opUser.addPermission("chanop.command.use");
};

/**
 * Deop a user.
 * @param  {User} user The user to deop.
 */
Channel.prototype.deopUser = function(user) {
    //get user for sure.
    var deopUser = this.getUser(user.getHostmask());
    deopUser.removePermission("chanop.command.use");
};

Channel.prototype.setFloodProtectionParams = function(floodProtectionParams) {
    this.floodProtectionParams = floodProtectionParams;
};

/**
 * Perform flood protection.
 * @param  {Context} context The context to check.
 * @return {Boolean}         Whether or not the command should be executed.
 */
Channel.prototype.floodProtection = function(context) {
    //if this is a private message, or if the user is a channel operator, no flood protection.
    if(this.getName() === "global" || context.getUser().hasPermission("chanop.command.use")) {return true;}

    //if flood protection has been disabled for this channel, return true.
    if(!this.floodProtectionParams.enabled) {return true;}

    //if the user is already banned, penalize the user and return false.
    if(context.getUser().floodProtection.isBanned) {
        context.getUser().setViolationLevel(context.getUser().getViolationLevel() * this.floodProtectionParams.penaltyMultiplier);
        return false;
    }

    //if the user's violation level is higher than the maximum allowed...
    if(context.getUser().getViolationLevel() > this.floodProtectionParams.maxViolationLevel) {
        //if they are a real IRC user, NOTICE them. otherwise, just send a message in their context.
        if(context.getUser().isRealIRCUser) {
            context.getClient().getIRCClient().notice(context.getUser().getNick(), "You have been temporarily banned from using my commands for spamming too many commands in a short time. Please refrain from spamming commands in this channel, or I will make your ban longer.");
        } else {
            context.getClient().say(context, "You have been temporarily banned from using my commands for spamming too many commands in a short time. Please refrain from spamming commands in this channel, or I will make your ban longer.");
        }

        //set the fact that they're banned
        context.getUser().floodProtection.isBanned = true;

        //log that we tempbanned someone.
        log.info("User", banUser.getNick(), "automatically tempbanned from Channel", this.getName()+".");

        //return false to let the CommandProcessor know not to execute the command.
        return false;
    }

    //if the user is not banned, add to their violation level and return true.
    context.getUser().setViolationLevel(context.getUser().getViolationLevel() + 1);
    return true;
};

/**
 * Attempt to reset the violation level of all users.
 */
Channel.prototype.resetViolationLevels = function() {
    var users = this.getUsers();

    //for all users
    for (var i = 0; i < users.length; i++) {
        //subtract max violation level from their violation level
        users[i].setViolationLevel(users[i].getViolationLevel() - this.floodProtectionParams.maxViolationLevel);
    };
};

module.exports = Channel;