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
    name: 'AKP48 CommandProcessor',
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
 * The Command Processor.
 */
function CommandProcessor() {
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
    log.info("Initializing command aliases...");

    // This first loop is simply to remove any modules with missing dependencies,
    // as they will probably error out and not work. This ensures that the commands
    // they provide will not be executible, and will not show up in the help list.
    this.commands.forEach(function (command, property) {
        // if dependencies are defined...
        if(command !== undefined && command.dependencies !== undefined) {
            //for each dependency...
            for (var i = 0; i < command.dependencies.length; i++) {
                //if dependency doesn't exist...
                var dependency = command.dependencies[i];
                if(this.commands[dependency] === undefined) {
                    //disable it.
                    log.info({command: property, reason: "Missing dependency", missingDependency: dependency}, "Command Module disabled.");
                    delete this.commands[property];
                    break;
                }
            }
        }
    }, this);

    // This loop is the one that actually adds all of the aliases for each command
    // and allows them to be executed.
    this.commands.forEach(function (command) {
        //for each of the command's aliases
        command.aliases.forEach(function (alias) {
            log.info("Aliased " + alias.append(" to ").append(command.name));
            this.aliasedCommands[alias] = command;
        }, this);
    }, this);
    log.info("Command aliases initialized.");
};

/**
 * Process a message.
 * @param  {IRCMessage} message The message object directly from the IRC module.
 * @param  {Client}     client  The client that this message came from.
 * @return {Boolean}            Whether or not a command was run.
 */
CommandProcessor.prototype.process = function(message, client) {
    log.trace({message: message}, "Received message.")

    //the context we will be sending to the command.
    var context = client.getClientManager().builder.buildContext(message, client);

    //if we don't get a context, something weird must have happened, and we shouldn't continue.
    if(!context) {return false;}

    //if user isn't banned
    if(!context.getChannel().isBanned(context.getUser())) {

        //if the command exists
        if(context.commandExists()) {

            //return if this needs to be a privmsg and isn't.
            if(context.getCommand().isPmOnly && !context.isPm) {
                return false;
            }

            //return if command is not allowed as a privmsg and this is one (unless we have the root permission.)
            if(!context.getCommand().allowPm && context.isPm && !context.getUser().hasPermission("root.command.use")) {
                return false;
            }

            //check privilege
            if(!context.getUser().hasPermission(context.getCommand().permissionName) && !context.user.hasPermission("root.command.use")) {
                return false;
            }

            //do flood protection/execute the command if we haven't returned by now.
            if(context.getChannel().floodProtection(context)) {
                if(!context.getCommand().execute(context)) {
                    this.sendUsageMessage(context);
                    return false;
                } else {
                    log.info({user: context.getUser().getNick(), command: context.getCommand().name, args: "'" + context.getArguments().join("', '") + "'", fullMsg: context.getFullMessage()}, "Command executed.");
                }
                return true;
            }
        }
    }

    return false;
};

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
