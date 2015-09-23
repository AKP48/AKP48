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

function Proxy() {
    //the name of the command.
    this.name = "Proxy";

    //help text to show for this command.
    this.helpText = "Send a message to a channel as the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<channel> <text>";

    //ways to call this command.
    this.aliases = ['proxy'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Proxy.prototype.execute = function(context) {
    if(config.getPerms().powerLevelFromContext(context) < config.powerLevels[context.getClient().uuid]["root"]) {
        return true;
    }

    if(!(context.arguments.length >= 2)) {return false;}
    var channel = context.arguments[0];
    //remove channel from arguments
    context.arguments.splice(0, 1);

    var inChannel = true;
    var chan = config.getChannel(context.getClient().uuid, context.getChannel());

    if(!chan || chan.disabled) {
        var inChannel = false;
    }

    //if we're in the channel that was asked for, or we're (hopefully) sending a PM
    if(!channel.isChannel() || inChannel) {
        //check for /me
        if(context.arguments[0] == "/me") {
            //remove /me from arguments
            context.arguments.splice(0, 1);
            //send text as action
            context.getClient().getIRCClient().action(channel, context.arguments.join(" "));
            //NOTICE user a success message
            context.getClient().getIRCClient().notice(context.nick, "Action successfully sent to "+channel+"!");
        } else {
            //just send message if no /me
            context.AKP48.ircClient.say(channel, context.arguments.join(" "));
            //NOTICE user a success message
            context.getClient().getIRCClient().notice(context.nick, "Message successfully sent to "+channel+"!");
        }
    } else {
        context.AKP48.say(context.channel, "Could not send to channel "+channel+"!");
    }
    return true;
};

module.exports = Proxy;
