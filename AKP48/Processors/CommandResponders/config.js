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

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //this gets filled upon command execution.
    this.perms = {};
}

Config.prototype.execute = function(context) {

    //populate permissions object.
    this.perms = {
        userGlobalRoot: (config.getPerms().powerLevel(context.getUser().getHostmask(), "global", context.getClient().uuid) >= config.powerLevels[context.getClient().uuid]["root"]),
        userChannelOp: (config.getPerms().powerLevelFromContext(context) >= config.powerLevels[context.getClient().uuid]["channelOp"]),
        userChannelMod: (config.getPerms().powerLevelFromContext(context) >= config.powerLevels[context.getClient().uuid]["channelMod"]),
        userServerOp: (config.getPerms().powerLevel(context.getUser().getHostmask(), "global", context.getClient().uuid) >= config.powerLevels[context.getClient().uuid]["serverOp"])
    };

    // If we don't have any permissions, quit. We can check permissions better at the next level (subcommands).
    if(!this.perms.userGlobalRoot && !this.perms.userChannelMod && !this.perms.userChannelOp && !this.perms.userServerOp) {
        return true;
    }

    if(!context.arguments.length) {
        this.help(context);
        return true;
    }

    switch(context.arguments[0].toLowerCase()) {
        case "help":
        case "?":
            this.help(context);
            break;
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
    // If the user isn't root or server op, exit now.
    if(!this.perms.userServerOp && !this.perms.userGlobalRoot) {
        return true;
    }

    if(context.arguments.length < 2) {
        var oS = "Usage: "+context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0];
        oS += "config "+context.arguments[0] + " <channel(s)...>";
        context.getClient().getIRCClient().notice(context.nick, oS);
    }

    var channels = context.arguments.slice(1);

    channels.forEach(function(channel) {
        if(!config.isInChannel(channel, context.getClient().uuid) && channel.isChannel()) {
            config.addChannel(channel, context.getClient().uuid);
            context.getClient().getIRCClient().join(channel, function(){
                context.getClient().getIRCClient().say(channel, "Hi! I'm "+context.AKP48.ircClient.nick+", and I'm here to help! Speaking of help... say .help to get some!");
                context.getClient().getIRCClient().notice(context.nick, "Joined "+channel+".");
            });
        }
    });
};

Config.prototype.removeChannel = function(context) {
    // If the user isn't root or server op, exit now.
    if(!this.perms.userServerOp && !this.perms.userGlobalRoot) {
        return true;
    }

    if(context.arguments.length < 2) {
        var oS = "Usage: "+context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0];
        oS += "config "+context.arguments[0] + " <channel(s)...>";
        context.getClient().getIRCClient().notice(context.nick, oS);
    }

    var channels = context.arguments.slice(1);

    channels.forEach(function(channel) {
        if(config.isInChannel(channel, context.getClient().uuid) && channel.isChannel()) {
            config.removeChannel(channel, context.getClient().uuid);
            context.getClient().getIRCClient().part(channel, function(){
                context.getClient().getIRCClient().notice(context.nick, "Parted "+channel+".");
            });
        }
    });
};

Config.prototype.addServer = function(context) {
    // If the user isn't root, exit now.
    if(!this.perms.userGlobalRoot) {
        return true;
    }

    // If we don't have any parameters, send the user an appropriate message and exit.
    if(context.arguments.length < 2) {
        context.getClient().getIRCClient().notice(context.nick, "Wrong command usage!"); //TODO: better message.
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
    if(!this.perms.userGlobalRoot) {
        return true;
    }

    //TODO: remove server.
};

Config.prototype.help = function(context) {
    //TODO: help.
};

module.exports = Config;
