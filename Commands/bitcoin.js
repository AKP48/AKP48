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

function Bitcoin() {
    //the name of the command.
    this.name = "Bitcoin";

    //help text to show for this command.
    this.helpText = "Converts Bitcoin to another currency.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[currency] [quantity]";

    //ways to call this command.
    this.aliases = ['bitcoin', 'btc'];

    //dependencies that this module has.
    this.dependencies = ['currency'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Bitcoin.prototype.execute = function(context) {
    var arguments = ['BTC', 'USD', '1'];

    //if we got arguments
    if(context.arguments.length) {
        //other currency
        if(context.arguments[0]) {
            arguments[1] = context.arguments[0];
        }

        //quantity
        if(context.arguments[1]) {
            arguments[2] = context.arguments[1];
        }
    }

    context.arguments = arguments;

    //just piggy-back on the currency function a bit.
    context.commands.currency.execute(context);
    return true;
};

module.exports = Bitcoin;