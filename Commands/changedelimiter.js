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

function ChangeDelimiter() {
    //the name of the command.
    this.name = "Change Delimiter";

    //help text to show for this command.
    this.helpText = "Changes the command delimiter for this server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "&lt;delimiter&gt;";

    //ways to call this command.
    this.aliases = ['changedelimiter', 'cd'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

ChangeDelimiter.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}

    context.getClient().say(context, "NYI");
    return true;

    console.log(context.arguments[0]);
    context.client.delimiter = context.arguments[0];
    context.getClient().getClientManager().save();
    context.client.getIRCClient().say(context.getUser().getNick(), "Delimiter changed!");
    console.log("Delimiter changed! -> "+context.arguments[0]);
    context.commands.reload.execute();
    return true;
};

module.exports = ChangeDelimiter;
