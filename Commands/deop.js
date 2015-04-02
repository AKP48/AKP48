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

function DeOp() {
    //the name of the command.
    this.name = "DeOp";

    //help text to show for this command.
    this.helpText = "Removes Op status from a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "&lt;person&gt; [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['deop'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

DeOp.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        //get the user
        var user = context.getChannel().getUser(context.arguments[i]);
        //if we didn't get a user, we don't need to do anything, as they aren't banned...
        if(user) {
            //unban the user.
            context.getChannel().deopUser(user);
        }
    };
    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Deopped "+context.arguments.join(", "));
    context.getClient().getClientManager().save();
    return true;
};

module.exports = DeOp;