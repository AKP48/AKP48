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

var User = require("./User");
var Context = require("./Context");

/**
 * Used to build various objects.
 */
function Builder(logger) {
    //logger
    this.log = logger.child({module: "Builder"});
}

/**
 * Builds a Context.
 * @param  {Message} message The IRC Message.
 * @param  {Client}  client  The Client.
 * @return {Context}         The Context, false if failed to create a Context.
 */
Builder.prototype.buildContext = function(message, client) {
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

    // TODO: Make this work again.
    //if the message is from a Minecraft bot, figure out who the user should be.
    // if(context.getChannel().getMcBots().indexOf(message.nick) !== -1){
    //     //find nick
    //     var start = message.args[1].indexOf('(');
    //     var end = message.args[1].indexOf(')');

    //     //get the nickname
    //     nick = message.args[1].substring(start + 1, end);

    //     //set hostmask
    //     prefix = nick+"!"+message.user+"@"+message.host;
    // }


    //temporary var for the user.
    var user = channel.getUser(prefix);

    //if there is no user with this hostmask
    if(user === null) {
        //create a new one and add it.
        user = User.build(message, context, {});
        channel.addUser(user);
    }

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

module.exports = Builder;
