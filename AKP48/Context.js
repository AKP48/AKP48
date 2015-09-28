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
 * A message context.
 * @param {Object} message The message object.
 * @param {Object} AKP48   The AKP48 instance.
 * @param {Logger} logger  The logger.
 */
function Context(message, AKP48, logger) {
    this.AKP48 = AKP48;
    this.message = message;
    this.nick = message.nick;
    this.to = message.to;
    this.channel = message.to;
    this.text = message.text;
    this.fullText = message.text;
    this.usermask = message.prefix;
    this.userPowerLevel = 1;
    this.command = "";
    this.arguments = [];
    this.commandDelimiterUsed = ""
    this.isPm = false;
    this.isBot = false;
    this.isMcBot = false;
    this.hasCommand = false;
    this.isAction = message.isAction;
    this.isContext = false;

    this.isProxied = message.isProxied;
    this.originalNick = message.originalNick;

    if(!this.initialize(this.nick, this.to, this.text, AKP48)) {
        this.isContext = false;
    }
}

Context.prototype.initialize = function (nick, to, text, AKP48) {
    //Before we do anything else, check to see if we sent this message.
    //We can safely toss this out if we are the sender.
    if(nick === AKP48.client.nick){
        this.log.debug({
            reason: "Captured message was sent from self."
        }, "Context failed to build.");
        return false;
    }

    //if the channel name is the same as our nickname, it's a PRIVMSG.
    if(to === AKP48.client.nick) {
        //set private message and channel fields.
        this.isPM = true;
        this.channel = nick;
    }

    //get perms info for the user
    var perms = AKP48.configManager.getPermissions(this.usermask);

    if(perms) {
        this.isBot = perms.isBot;
        this.isMcBot = perms.isMcBot;
        if(perms.permissions && perms.permissions[this.channel]) {
            this.userPowerLevel = perms.permissions[this.channel];
        }
    }

    //if the message is from a Minecraft bot, figure out who the user should be.
    if(this.isMcBot){
        //find nick
        var start = this.text.indexOf('(');
        var end = this.text.indexOf(')');

        //get the nickname
        this.nick = this.text.substring(start + 1, end);

        //set usermask
        this.usermask = this.nick+"!"+this.message.user+"@"+this.message.host;

        //refresh perms info, now that we know the real user...
        perms = AKP48.configManager.getPermissions(this.usermask);
        //...and get their power level, if possible.
        if(perms && perms.permissions && perms.permissions[this.channel]) {
            this.userPowerLevel = perms.permissions[this.channel];
        }
    }

    //process the text to prepare it.
    //if the user is from a Minecraft bot
    if(this.isMcBot) {
        //cut off their name from the string.
        this.text = this.text.substring(this.text.indexOf(')')+2);
    }

    //safe default for delimiters.
    var delimiters = ['.'];

    //get the channel configuration
    var channelConfig = AKP48.configManager.getChannelConfig();

    //if we have a config for this channel...
    if(channelConfig[this.channel]) {
        //grab the command delimiter list from there.
        delimiters = channelConfig[this.channel].commandDelimiters;
    }

    //for each possible command delimiter, check to see if we have a command, and if so, process the text accordingly.
    for (var i = 0; i < delimiters.length; i++) {
        if(this.text.substring(0, delimiters[i].length) === delimiters[i]) {
            this.commandDelimiterUsed = delimiters[i];
            //attempt to find the command
            var end = this.text.indexOf(' ');
            this.command = this.text.substring(delimiters[i].length, end).toLowerCase();

            //if there wasn't a space, we don't have a command yet.
            //that means that the command is one word, and we'll just get rid of the delimiter.
            if(end === -1) {
                this.command = this.text.substring(delimiters[i].length);
            } else {
                //if there was a space, we've got a command that has parameters after it,
                //and we need to store those parameters.
                var args = this.text.substring(end+1).split(' ');
                //remove any blank arguments
                var j;
                while((j = args.indexOf('')) !== -1) {
                    args.splice(j, 1);
                }
                this.arguments = args;
            }
        }
    }

    //if we have gotten a command, we need to set the field saying so.
    if(this.command.length && !this.message.isAction) {
        this.hasCommand = true;
    }

    //last thing to do: if we got here, the context has been successfully created.
    this.isContext = true;

    return true;
};

module.exports = Context;
