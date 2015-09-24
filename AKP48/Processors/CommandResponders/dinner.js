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

function Dinner(logger) {
    //the name of the command.
    this.name = "Dinner";

    //help text to show for this command.
    this.helpText = "Tells you what to eat for dinner.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[vegetarian|veg|v]";

    //ways to call this command.
    this.aliases = ['dinner', 'wtfdinner', 'whatthefuckshouldifuckinghavefordinner', 'whatthefuckshouldifuckingmakefordinner'];
}

Dinner.prototype.execute = function(context) {
    var veg = false;
    if(context.arguments[0] && context.arguments[0].startsWith('v')) {
        veg = true;
    }

    context.AKP48.getAPI("Dinner").getDinner(veg, function(string) {
        context.AKP48.say(context.channel, string);
    })

    return true;
};

module.exports = Dinner;
