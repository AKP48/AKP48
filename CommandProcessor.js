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

/**
 * The Command Processor.
 */
function CommandProcessor() {
    this.auto = new AutoResponse();

    //command list for help purposes, leaves out aliases.
    this.commands = require('./Commands');

    //full command list with aliases included.
    this.aliasedCommands = {};
    this.initCommandAliases();
}

/**
 * Initializes the aliasedCommands variable.
 *
 * This method is what allows us to use the various aliases that are
 * included in different commands.
 */
CommandProcessor.prototype.initCommandAliases = function() {

    // This first loop is simply to remove any modules with missing dependencies,
    // as they will probably error out and not work. This ensures that the commands
    // they provide will not be executible, and will not show up in the help list.
    for (var property in this.commands) {
        //ensure that the property exists in our object.
        if (this.commands.hasOwnProperty(property)) {
            //if dependencies are defined...
            if(this.commands[property] !== undefined && this.commands[property].dependencies !== undefined) {
                //for each dependency...
                for (var i = 0; i < this.commands[property].dependencies.length; i++) {
                    //if dependency doesn't exist...
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

    // This loop is the one that actually adds all of the aliases for each command
    // and allows them to be executed.
    for (var property in this.commands) {
        //if the property exists
        if (this.commands.hasOwnProperty(property)) {
            //for each of the command's aliases
            for (var i = 0; i < this.commands[property].aliases.length; i++) {
                //add the original command to the aliasedCommands array with the alias as it's name.
                this.aliasedCommands[this.commands[property].aliases[i]] = this.commands[property];
            };
        }
    }
};

/**
 * Process a message.
 * @param  {IRCMessage} message The message object directly from the IRC module.
 * @param  {Client}     client  The client that this message came from.
 */
CommandProcessor.prototype.process = function(message, client) {
    //the context we will be sending to the command.
    var context = client.getClientManager().builder.buildContext(message, client);

    //parse the message for auto response system
    this.parseMessage(context);

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
            if(context.getChannel().floodProtection(context)) {
                if(!context.getCommand().execute(context)) {
                    this.sendUsageMessage(context);
                }
            }
        }
    }
};

/**
 * Parse a message for automatically sent content.
 *
 * This is the method that handles sending information for
 * YouTube and Steam links. This method will be being changed soon.
 *
 * @param  {Context} context The context.
 */
CommandProcessor.prototype.parseMessage = function(context) {
    var youTubeRegEx = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
    var steamAppRegEx = /(?:store\.steampowered\.com\/app\/)([0-9]+)/gi;
    var steamPkgRegEx = /(?:store\.steampowered\.com\/sub\/)([0-9]+)/gi;

    var msg = context.getFullMessage();

    if(msg.search(youTubeRegEx) != -1) {
        var youTubeIds = [];
        var result = [];
        while((result = youTubeRegEx.exec(msg)) !== null) {
            youTubeIds.push(result[1]);
        }
        //TODO: better handling of maximum links.
        this.auto.youtube(youTubeIds, 3, function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        });
    }

    if(msg.search(steamAppRegEx) != -1) {
        var steamIds = [];
        var result = [];
        while((result = steamAppRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamApp(steamIds, 3, function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        });
    }

    if(msg.search(steamPkgRegEx) != -1) {
        var steamIds = [];
        var result = [];
        while((result = steamPkgRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamPkg(steamIds, 3, function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        });
    }
}

/**
 * Send a usage message to a user.
 * @param  {Context} context The context that needs to be sent to.
 */
CommandProcessor.prototype.sendUsageMessage = function(context) {
    var message = context.getChannel().getCommandDelimiter() + context.getCommand().aliases[0] + " " + context.getCommand().usageText;
    if(context.getUser().isRealIRCUser) {
        context.getClient().getIRCClient().notice(context.getUser().getNick(), message);
    } else {
        context.getClient().say(context, message);
    }
};

module.exports = CommandProcessor;