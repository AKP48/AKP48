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

function Reload(log) {
    //the name of the command.
    this.name = "Reload";

    //help text to show for this command.
    this.helpText = "Reloads the bot's command processor.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['reload', 'rl'];

    //logger
    this.log = log;

    //The required power level for this command.
    this.powerLevel = "root";
}

Reload.prototype.execute = function(context) {
    this.log.debug("Soft reload requested by " + context.nick);
    context.AKP48.client.notice(context.nick, "Performing soft reload!");
    context.AKP48.instanceManager.reloadInstance(context.AKP48.uuid);
    return true;
};

module.exports = Reload;
