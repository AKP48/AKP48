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

function Credits() {
    //the name of the command.
    this.name = "Credits";

    //help text to show for this command.
    this.helpText = "Gives a link to the credits page.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['credits'];

    //dependencies that this module has.
    this.dependencies = ['googl'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Credits.prototype.execute = function(context) {
    context.commands['googl'].shortenURL(context, "https://github.com/AKPWebDesign/AKP48/blob/master/CREDITS.md");
    return true;
};

module.exports = Credits;