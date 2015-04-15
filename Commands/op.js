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

function Op() {
    //the name of the command.
    this.name = "Op";

    //help text to show for this command.
    this.helpText = "Gives Op status to a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['op'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Op.prototype.execute = function(context) {
    var users = [];
    for (var i = 0; i < context.arguments.length; i++) {
        var name = context.arguments[i];
        //get the user
        var user = context.getChannel().getUser(name, true);
        if (user) {
            //op the user.
            context.getChannel().opUser(user);
            users.push(name);
        }
    }
    if (users.length == 0) {
        users.push("none");
    }

    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Opped "+users.join(", "));
    context.getClient().getClientManager().save();
    return true;
};

module.exports = Op;