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

function Shutdown() {
    //the name of the command.
    this.name = "Shutdown";

    //help text to show for this command.
    this.helpText = "Shuts down the IRC bot completely.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[message]";

    //ways to call this command.
    this.aliases = ['shutdown', 'restart', 'rs'];

    //The required power level for this command.
    this.powerLevel = "root";
}

Shutdown.prototype.execute = function(context) {
    var msg = "Goodbye.";

    if(context.arguments[0]) {
        msg = context.arguments.join(" ");
    }

    context.AKP48.instanceManager.shutdownAll(msg);
    return true;
};

module.exports = Shutdown;
