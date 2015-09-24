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

function BaseCommand() {
    //the name of the command.
    this.name = "Base Command";

    //help text to show for this command.
    this.helpText = "Base command. Does nothing, simply a placeholder to copy from when making a new command.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['base'];

    //dependencies that this module has.
    this.dependencies = ['moduleThatWillNeverBeHereSoThatThisCommandWillNeverLoad'];
}

BaseCommand.prototype.execute = function(context) {
    //add content here.
    return true;
};

module.exports = BaseCommand;
