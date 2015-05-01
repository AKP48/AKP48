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
 * A context.
 */
function Context() {
    // The user this context is for.
    this.user = null;

    // The channel this context is for.
    this.channel = null;

    // The client this context is for.
    this.client = null;

    // The full original message text.
    this.fullMessage = "";

    // Whether or not this context is for a private message.
    this.isPm = false;

    // The CommandProcessor being used to respond to this context.
    this.commandProcessor = null;

    // The command being requested in this context.
    this.command = null;

    // The arguments being requested in this context.
    this.arguments = [];
}

Context.prototype.setUser = function(user) {
    this.user = user;
};

Context.prototype.getUser = function() {
    return this.user;
};

Context.prototype.setChannel = function(channel) {
    this.channel = channel;
};

Context.prototype.getChannel = function() {
    return this.channel;
};

Context.prototype.setClient = function(client) {
    this.client = client;
};

Context.prototype.getClient = function() {
    return this.client;
};

Context.prototype.setFullMessage = function(message) {
    this.fullMessage = message.toString();
};

Context.prototype.getFullMessage = function() {
    return this.fullMessage;
};

Context.prototype.setIsPm = function(isPm) {
    this.isPm = isPm;
};

Context.prototype.setCommandProcessor = function(commandProcessor) {
    this.commandProcessor = commandProcessor;
};

Context.prototype.getCommandProcessor = function() {
    return this.commandProcessor;
};

Context.prototype.setCommand = function(command) {
    this.command = command.toLowerCase();
};

Context.prototype.getCommand = function() {
    if(!this.commandExists()){return false;}
    return this.commands[this.command];
};

Context.prototype.setArguments = function(args) {
    this.arguments = args;
};

Context.prototype.getArguments = function() {
    return this.arguments;
};

Context.prototype.commandExists = function() {
    return (this.commands[this.command] !== undefined && typeof this.commands[this.command].execute === 'function');
};

module.exports = Context;

module.exports.build = function build(message, client) {
    //Before we do anything else, check to see if we sent this message.
    //We can safely toss this out if we are the sender.
    if(message.nick === client.getNick()){
        this.log.debug({
            reason: "Captured message was sent from self."
        }, "Context failed to build.");
        return false;
    }

    //Make ourselves a new Context...
    var context = new Context();

    //set the client first, as it's the easiest.
    context.setClient(client);

    //temporary var for the channel.
    var channel = message.args[0];

    //if the channel name is the same as our nickname, it's a PRIVMSG.
    if(channel == client.getNick()) {
        channel = "global";

        //set isPm
        context.setIsPm(true);
    }

    //set the channel in the context.
    context.setChannel(channel);

    var nick = message.nick;
    var prefix = message.prefix;

    //if the message is from a Minecraft bot, figure out who the user should be.
    if(config.isMcBot(message.nick, context.getChannel, client.uuid)){
        //find nick
        var start = message.args[1].indexOf('(');
        var end = message.args[1].indexOf(')');

        //get the nickname
        nick = message.args[1].substring(start + 1, end);

        //set hostmask
        prefix = nick+"!"+message.user+"@"+message.host;
    }

    var user = User.build(message, context, {});

    //now we have a user.
    context.setUser(user);

    //set full message
    context.setFullMessage(message.args[1]);

    //set command processor
    context.setCommandProcessor(client.getCommandProcessor());

    //set commands
    context.setCommands(context.getCommandProcessor().aliasedCommands);

    var messageString = message.args[1];

    //process the command and arguments out of the message.

    //if the user is from a Minecraft bot
    if(!user.isRealIRCUser) {
        //cut off their name from the string.
        messageString = messageString.substring(messageString.indexOf(')')+2);
    }

    //if we have a command
    if(messageString.substring(0, channel.getCommandDelimiter().length) === channel.getCommandDelimiter()) {

        //find command
        var end = messageString.indexOf(' ');
        context.setCommand(messageString.substring(channel.getCommandDelimiter().length,end).toLowerCase());

        //if there wasn't actually a space, we won't have gotten a command.
        //instead, we'll just chop off the delimiter now.
        if(end === -1) {
            context.setCommand(messageString.substring(channel.getCommandDelimiter().length));
        } else {
            //otherwise, we can cut off the command and save the arguments.
            var args = messageString.substring(end+1).split(' ');

            //remove any blank arguments
            var i;
            while((i = args.indexOf('')) !== -1) {
                args.splice(i, 1);
            }
            context.setArguments(args);
        }
    }

    return context;
};
