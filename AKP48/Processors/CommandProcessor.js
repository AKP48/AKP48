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
 * Processes Command Contexts.
 * @param {Command} context The context to process.
 * @param {Logger}  logger  The logger.
 * @param  {Object}   AKP48  The running instance of AKP48.
 */
function CommandProcessor(context, logger, AKP48) {
    this.log = logger.child({module: "CommandProcessor"});
    this.commands = {};
    this.aliasedCommands = {};
    this.initialize(AKP48);
    this.process(context);
}

/**
 * Initializes the CommandProcessor with everything needed to process commands.
 * @param  {Object}   AKP48  The running instance of AKP48.
 */
CommandProcessor.prototype.initialize = function (AKP48) {
    this.log.debug("Loading commands...");
    this.commands = require('./CommandResponders')(this.log, AKP48);

    this.log.debug("Initializing command aliases...");
    // This first loop is simply to remove any modules with missing dependencies,
    // as they will probably error out and not work. This ensures that the commands
    // they provide will not be executable, and will not show up in the help list.
    this.commands.each(function (command, property) {
        // if dependencies are defined...
        if(command !== undefined && command.dependencies !== undefined) {
            //for each dependency...
            for (var i = 0; i < command.dependencies.length; i++) {
                //if dependency doesn't exist...
                var dependency = command.dependencies[i];
                if(this.commands[dependency] === undefined) {
                    //disable it.
                    this.log.debug({command: property, reason: "Missing dependency", missingDependency: dependency}, "Command Module disabled.");
                    delete this.commands[property];
                    break;
                }
            }
        }
    }, this);

    // This loop is the one that actually adds all of the aliases for each command
    // and allows them to be executed.
    this.commands.each(function (command) {
        //for each of the command's aliases
        command.aliases.each(function (alias) {
            this.log.trace("Aliased " + alias.append(" to ").append(command.name));
            this.aliasedCommands[alias] = command;
        }, this);
    }, this);

    this.log.debug("Command aliases initialized.");
};

CommandProcessor.prototype.process = function (context) {
    if(context.isBot) {
        this.log.trace("Dropping command, user is a bot.");
        return;
    }

    if(!this.aliasedCommands[context.command] || !(typeof this.aliasedCommands[context.command].execute === "function")) {
        this.log.trace("Dropping command, didn't get a valid command.");
        return;
    }

    if(context.AKP48.configManager.isBanned(context.usermask, context.channel)) {
        this.log.trace("Dropping command, user is banned.");
        return;
    }

    var cmd = this.aliasedCommands[context.command];

    //if the user doesn't have permission for this command...
    if(!context.AKP48.configManager.hasPermission(context, (cmd.powerLevel || "normal"))) {
        this.log.trace("Dropping command, user doesn't have permission.");
        return;
    }

    //TODO: Flood protection.

    //Add the commands object into the context, for easy access from within commands.
    context.commands = this.commands;

    if(!cmd.execute(context)) {
        this.sendUsageMessage(context);
        this.log.debug("Command execution failed, user provided incorrect arguments.");
        return false;
    } else {
        this.log.debug({user: context.usermask, command: context.command, args: context.arguments}, "Command execution succeeded.");
    }
};

/**
 * Send a usage message to a user.
 * @param  {Context} context The context that needs to be sent to.
 */
CommandProcessor.prototype.sendUsageMessage = function(context) {
    var nick = context.nick;

    //if the user is proxied, send to the original user instead.
    if(context.isProxied) {
        nick = context.originalNick;
    }

    var message = context.commandDelimiterUsed + context.command + " " + this.aliasedCommands[context.command].usageText;

    if(!context.isMcBot) {
        context.AKP48.ircClient.notice(nick, message);
    } else {
        context.AKP48.say(context.channel, message);
    }
};

module.exports = CommandProcessor;
