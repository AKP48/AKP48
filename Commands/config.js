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

    //The power level needed to use this command.
    this.powerLevel = 9000;

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Config.prototype.execute = function(context) {
    if(!context.arguments.length) {
        this.help(context);
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
        case "part":
        case "removechannel":
            this.removeChannel(context);
            break;
        case "blacklist":
        case "bot":
            this.botBlacklist(context);
            break;
        case "powerlevel":
            this.setUserPowerLevel(context);
        default:
            this.help(context);
    }
    
    return true;
};

Config.prototype.addChannel = function(context) {
    if(context.arguments.length < 2) {
        var oS = "Usage: "+config.getCommandDelimiter(context.getChannel(), context.getClient().uuid);
        oS += "config "+context.arguments[0] + " <channel(s)...>";
        context.getClient().getIRCClient().notice(context.getUser().getNick(), oS);
    }

    var channels = context.arguments.slice(1);

    channels.forEach(function(channel) {
        config.addChannel(channel, context.getClient().uuid);
        context.getClient().getIRCClient().join(channel, function(){
            context.getClient().getIRCClient().say(channel, "Hi! I'm "+context.getClient().getNick()+", and I'm here to help! Speaking of help... say .help to get some!");
        });
    });
};

Config.prototype.removeChannel = function(context) {
    // body...
};

Config.prototype.addServer = function(context) {
    // body...
};

Config.prototype.removeServer = function(context) {
    // body...
};

Config.prototype.botBlacklist = function(context) {
    // body...
};

Config.prototype.setUserPowerLevel = function(context) {
    // body...
};

Config.prototype.help = function(context) {
    // body...
};

module.exports = Config;