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

function AddServer() {
    //the name of the command.
    this.name = "Add Server";

    //help text to show for this command.
    this.helpText = "Connect to a new server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<name> <serverAddress> <nick> <opNick> <channel> <mcBotName> <commandDelimiter>";

    //ways to call this command.
    this.aliases = ['addserver'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'root.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

AddServer.prototype.execute = function(context) {
    if(context.arguments.length !== 6) {return false;}

    var created = context.client.clientManager.createClient({
                    name: context.arguments[0],
                    server: context.arguments[1],
                    nick: context.arguments[2],
                    ops: [context.arguments[3]],
                    banned: [],
                    channels: [context.arguments[4]],
                    mcBot: context.arguments[5],
                    delimiter: context.arguments[6],
                });

    context.getClient().getClientManager().save();

    var nick = context.getUser().getNick();
    if(!created) {
        context.client.getIRCClient().say(nick, "There was a problem creating the client!");
    } else {
        context.client.getIRCClient().say(nick, "Client created!");
    }
    return true;
};

module.exports = AddServer;
