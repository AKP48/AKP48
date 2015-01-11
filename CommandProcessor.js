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

var Commands = require('./Commands');
var AutoResponse = require('./autoresponse');
var Chatter = require("./chatter");

function CommandProcessor() {
    this.auto = new AutoResponse();

    //command list for help purposes, leaves out aliases.
    this.commands = require('./Commands');

    //full command list with aliases included.
    this.aliasedCommands = {};
    this.initCommandAliases();
}

CommandProcessor.prototype.initCommandAliases = function() {
    //loop to remove modules without fulfilled dependencies.
    for (var property in this.commands) {
        if (this.commands.hasOwnProperty(property)) {
            //if dependencies are defined
            if(this.commands[property] !== undefined && this.commands[property].dependencies !== undefined) {
                //for each dependency
                for (var i = 0; i < this.commands[property].dependencies.length; i++) {
                    //if dependency doesn't exist
                    if(this.commands[this.commands[property].dependencies[i]] === undefined) {
                        //disable it.
                        console.log(property + " module does not have all required dependencies! Disabling " + property + " module!");
                        delete this.commands[property];
                        break;
                    }
                };
            }
        }
    }

    //loop to put in aliases
    for (var property in this.commands) {
        if (this.commands.hasOwnProperty(property)) {
            for (var i = 0; i < this.commands[property].aliases.length; i++) {
                this.aliasedCommands[this.commands[property].aliases[i]] = this.commands[property];
            };
        }
    }
};

CommandProcessor.prototype.process = function(message, client) {
    //the context we will be sending to the command.
    var context = client.getClientManager().builder.buildContext(message, client);

    //parse the message for auto response system
    this.parseMessage(context.getFullMessage(), context.getClient(), context.getChannel(), context.isPm);

    //if the command exists
    if(context.commandExists()) {

        //if user isn't banned
        if(!context.getChannel().isBanned(context.getUser())) {

            //return if this needs to be a privmsg and isn't.
            if(context.getCommand().isPmOnly && !context.isPm) {
                return;
            }

            //return if command is not allowed as a privmsg and this is one (unless we have the root permission.)
            if(!context.getCommand().allowPm && context.isPm && !context.getUser().hasPermission("root.command.use")) {
                return;
            }

            //check privilege
            if(!context.getUser().hasPermission(context.getCommand().permissionName) && !context.user.hasPermission("root.command.use")) {
                return;
            }

            //do flood protection/execute the command if we haven't returned by now.
            if(this.floodProtection(context)) {
                if(!context.getCommand().execute(context)) {
                    this.sendUsageMessage(context, context.getCommand());
                }
            }
        }
    }
};

CommandProcessor.prototype.parseMessage = function(msg, client, channel, pm) {
    var youTubeRegEx = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
    var steamAppRegEx = /(?:store\.steampowered\.com\/app\/)([0-9]+)/gi;
    var steamPkgRegEx = /(?:store\.steampowered\.com\/sub\/)([0-9]+)/gi;

    if(msg.search(youTubeRegEx) != -1) {
        var youTubeIds = [];
        var result = [];
        while((result = youTubeRegEx.exec(msg)) !== null) {
            youTubeIds.push(result[1]);
        }
        //TODO: better handling of maximum links.
        this.auto.youtube(youTubeIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamAppRegEx) != -1) {
        var steamIds = [];
        var result = [];
        while((result = steamAppRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamApp(steamIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamPkgRegEx) != -1) {
        var steamIds = [];
        var result = [];
        while((result = steamPkgRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamPkg(steamIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }
}

/**
 * Perform flood protection.
 * @param  {Object} context The IRC context that this message came from.
 * @return {Boolean}         Whether or not the message should be sent.
 */
CommandProcessor.prototype.floodProtection = function(context) {
    // if((!context.pm || !(context.channel === context.client.nick)) && !context.channel.isOp(context.user)) {
    //     if(!context.client.chatters[context.channel]) {context.client.chatters[context.channel] = [];}
    //     if(context.client.chatters[context.channel][context.nick]) {
    //         context.client.chatters[context.channel][context.nick].floodProtect();
    //         //if they have been banned
    //         if(context.client.chatters[context.channel][context.nick].checkBan()) {
    //             //just end here
    //             return false;
    //         }
    //     } else {
    //         context.client.chatters[context.channel][context.nick] = new Chatter(context, !context.isMcBot);
    //     }
    // }

    return true;
};

CommandProcessor.prototype.sendUsageMessage = function(context, command) {
    if(!context.isMcBot) {
        context.channel = context.nick;
    }
    context.client.say(context, context.client.delimiter + context.command + " " + command.usageText);
};

module.exports = CommandProcessor;