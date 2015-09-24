/**
 * Copyright (C) 2015  Alan Hamid (feildmaster)
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

function Me() {
    //the name of the command.
    this.name = "Me";

    //help text to show for this command.
    this.helpText = "Acts in your place. Include channel parameter for private messages only";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[#channel] text";

    //ways to call this command.
    this.aliases = ['me'];
}

Me.prototype.execute = function(context) {
    var channel = context.channel;

    //if we don't have any arguments, return.
    if(!context.arguments.length) {return false;}

    if (context.arguments[0].isChannel()) {
      if (!context.isPm) {
        return false;
      }
      channel = context.arguments.splice(0,1);
    } else if (context.isPm) {
      return false;
    }

    context.AKP48.ircClient.action(channel, context.arguments.join(" "));

    return true;
};

module.exports = Me;
