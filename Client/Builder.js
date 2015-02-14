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
    name: 'AKP48 Builder',
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

var Channel = require("./Channel");
var Client = require("./Client");
var Context = require("./Context");
var User = require("./User");

/**
 * Used to build various objects.
 */
function Builder() {

}

/**
 * Build a Client.
 * @param  {Object}     options     The options that will configure the client.
 * @return {Client}                 The Client.
 */
Builder.prototype.buildClient = function(options) {
    //Make ourselves a new Client...
    var client = new Client();

    //set the options, if we get them.
    if(options.nick) {
        client.setNick(options.nick);
    }
    if(options.realname) {
        client.setRealName(options.realname);
    }
    if(options.username) {
        client.setUserName(options.username);
    }
    if(options.server) {
        client.setServer(options.server);
    }
    if(options.port) {
        client.setPort(options.port);
    }
    if(options.password) {
        client.setPassword(options.password);
    }
    if(options.channels) {
        client.setChannels([]);
        for (var i = 0; i < options.channels.length; i++) {
            client.addChannel(this.buildChannel(options.channels[i]));
        };
    }
    log.info("Built client", client.getNick(), "on", client.getServer()+":"+client.getPort()+".");
    //return it.
    return client;
};

/**
 * Builds a Context.
 * @param  {Message} message The IRC Message.
 * @param  {Client}  client  The Client.
 * @return {Context}         The Context, false if failed to create a Context.
 */
Builder.prototype.buildContext = function(message, client) {
    //Before we do anything else, check to see if we sent this message.
    //We can safely toss this out if we are the sender.
    if(message.nick == client.getNick()){return false;}

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

    //set channel to the channel we are trying to get.
    channel = client.getChannel(channel);

    //if the channel doesn't exist, return here.
    if(!channel) {return false;}

    //set the channel in the context.
    context.setChannel(channel);

    var nick = message.nick;
    var prefix = message.prefix;

    //if the message is from a Minecraft bot, figure out who the user should be.
    if(context.getChannel().getMcBots().indexOf(message.nick) !== -1){
        //find nick
        var start = message.args[1].indexOf('(');
        var end = message.args[1].indexOf(')');

        //get the nickname
        nick = message.args[1].substring(start + 1, end);

        //set hostmask
        prefix = nick+"!"+message.user+"@"+message.host;
    }


    //temporary var for the user.
    var user = channel.getUser(prefix);

    //if there is no user with this hostmask
    if(user === null) {
        //create a new one and add it.
        user = this.buildUser(message, context, {});
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

/**
 * Builds a User using a message and Client.
 * @param  {Message} message The IRC message to use.
 * @param  {Context} context The context to use.
 * @param  {JSON}    options The options to use.
 * @return {User}            The User.
 */
Builder.prototype.buildUser = function(message, context, options) {
    //Make ourselves a new User...
    var user = new User();

    if(message && context) {
        //if the user this came from is a Minecraft bot,
        if(context.getChannel().getMcBots().indexOf(message.nick) !== -1){
            //say so.
            user.setIsRealIRCUser(false);

            //find nick
            start = message.args[1].indexOf('(');
            end = message.args[1].indexOf(')');

            //set nick
            user.setNick(message.args[1].substring(start + 1, end));

            //set hostmask
            user.setHostmask(user.getNick()+"!"+message.user+"@"+message.host);
        } else {
            //the user is legit, so just use their nick and hostmask.
            user.setNick(message.nick);
            user.setHostmask(message.prefix);
        }
    }

    if(options.nick) {
        user.setNick(options.nick)
    }
    if(options.hostmask) {
        user.setHostmask(options.hostmask);
    }
    if(options.permissions) {
        user.setPermissions(options.permissions);
    }
    if(options.violationLevel) {
        user.setViolationLevel(options.violationLevel);
    }
    if(options.isRealIRCUser) {
        user.setIsRealIRCUser(options.isRealIRCUser);
    }

    return user;
};

/**
 * Builds a Channel.
 * @param  {Options} options The options to use
 * @return {User}            The User.
 */
Builder.prototype.buildChannel = function(options) {
    //Make ourselves a new Channel...
    var channel = new Channel();
    //set the options, if we get them.
    if(options.name) {
        channel.setName(options.name);
    }
    if(options.users) {
        for (var i = 0; i < options.users.length; i++) {
            channel.addUser(this.buildUser(null, null, options.users[i]));
        };
    }
    if(options.mcBots) {
        channel.setMcBots(options.mcBots);
    }
    if(options.commandDelimiter) {
        channel.setCommandDelimiter(options.commandDelimiter);
    }
    if(options.floodProtection) {
        channel.setFloodProtectionParams(options.floodProtection);
    }
    //return the channel
    return channel;
};

module.exports = Builder;