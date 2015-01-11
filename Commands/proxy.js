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

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Proxy.prototype.execute = function(context) {
    if(!(context.arguments.length >= 2)) {return false;}
    var channel = context.arguments[0];
    context.arguments.splice(0, 1);
    var text = context.arguments.join(" ");

    //if we're in the channel that was asked for
    if(context.client.channels.indexOf(channel) > -1) {
        //send the message.
        context.client.getIRCClient().say(channel, text);
        //notify sender.
        context.getClient().say(context, "\""+text + "\" successfully sent to "+channel+"!");
    } else {
        context.getClient().say(context, "Could not send to channel "+channel+"!");
    }
    return true;
};

module.exports = Proxy;