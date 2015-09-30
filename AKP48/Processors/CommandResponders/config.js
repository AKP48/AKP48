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

function Config() {
    //the name of the command.
    this.name = "Config";

    //help text to show for this command.
    this.helpText = "Configures the bot."; //TODO: See if we can add a lot more to this.

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<subcommand> [arguments...]";

    //ways to call this command.
    this.aliases = ['config', 'conf'];

    //The required power level for this command. TODO: Change this once config is ready.
    this.powerLevel = "serverMod";
}

Config.prototype.execute = function(context) {
    if(!context.arguments.length) {
        this.help(context);
        return true;
    }

    switch(context.arguments[0].toLowerCase()) {
        case "addserver":
        case "connect":
        case "newserver":
            this.addServer(context);
            break;
        case "removeserver":
        case "disconnect":
        case "deleteserver":
            this.removeServer(context);
            break;
        case "join":
        case "addchannel":
            this.addChannel(context);
            break;
        case "part":
        case "removechannel":
            this.removeChannel(context);
            break;
        default:
            this.help(context);
            break;
    }

    return true;
};

Config.prototype.addChannel = function(context) {
    // If the user isn't at least server op, exit now.
    if (!context.AKP48.configManager.hasPermission(context, "serverMod")) {
        return true;
    }

    if(context.arguments.length < 2) {
        var oS = "Usage: "+context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0];
        oS += "config "+context.arguments[0] + " <channel(s)...>";
        context.AKP48.client.notice(context.nick, oS);
    }

    var channels = context.arguments.slice(1);
    var joined = [];

    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        if(!context.AKP48.configManager.isInChannel(channel, context.AKP48)) {
            context.AKP48.configManager.addChannel(channel);
            context.AKP48.client.join(channel, function(){
                context.AKP48.client.say(channel, "Hi! I'm "+context.AKP48.client.nick+", and I'm here to help! Speaking of help... say .help to get some!");
            });
            joined.push(channel);
        }
    }

    if(joined.length) {
        context.AKP48.client.notice(context.nick, "Joined "+joined.join(", "));
    } else {
        context.AKP48.client.notice(context.nick, "Did not join any channels!");
    }
};

Config.prototype.removeChannel = function(context) {
    // If the user isn't at least server op, exit now.
    if (!context.AKP48.configManager.hasPermission(context, "serverMod")) {
        return true;
    }

    if(context.arguments.length < 2) {
        var oS = "Usage: "+context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0];
        oS += "config "+context.arguments[0] + " <channel(s)...>";
        context.AKP48.client.notice(context.nick, oS);
    }

    var channels = context.arguments.slice(1);

    var parted = [];

    for (var i = 0; i < channels.length; i++) {
        var channel = channels[i];
        if(context.AKP48.configManager.isInChannel(channel, context.AKP48)) {
            context.AKP48.configManager.removeChannel(channel);
            context.AKP48.client.part(channel);
            parted.push(channel);
        }
    }

    if(parted.length) {
        context.AKP48.client.notice(context.nick, "Left "+parted.join(", "));
    } else {
        context.AKP48.client.notice(context.nick, "Did not leave any channels!");
    }
};

Config.prototype.addServer = function(context) {
    // If the user isn't root, exit now.
    if (!context.AKP48.configManager.hasPermission(context, "root")) {
        return true;
    }

    // If we don't have any parameters, send the user an appropriate message and exit.
    if(context.arguments.length < 2) {
        context.AKP48.client.notice(context.nick, "Wrong command usage!"); //TODO: better message.
        return true;
    }

    //time to parse the server information.
    //format: user!nick:pass@server:port#chan#chan#chan
    var user, nick, pass, server, port = "";
    var channels = [];

    var tempParse = context.arguments[1].split("@");

    pass = tempParse[0].split(":")[1];
    user = tempParse[0].split(":")[0].split("!")[0];
    nick = tempParse[0].split(":")[0].split("!")[1];
    tempParse = tempParse[1].split("#");
    server = tempParse[0].split(":")[0];
    port = tempParse[0].split(":")[1];
    tempParse.shift();
    channels = tempParse;

    //string should be parsed. time to check and see what we got.
    //TODO: finish this.
};

Config.prototype.removeServer = function(context) {
    // If the user isn't root, exit now.
    if (!context.AKP48.configManager.hasPermission(context, "root")) {
        return true;
    }

    //TODO: remove server.
};

Config.prototype.help = function(context) {
    // If the user isn't at least server op, exit now.
    if (!context.AKP48.configManager.hasPermission(context, "serverMod")) {
        return true;
    }

    //TODO: help.
};

module.exports = Config;
