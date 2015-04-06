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

var request = require('request-json');

function MCNameHistory() {
    //the name of the command.
    this.name = "Minecraft Name History";

    //help text to show for this command.
    this.helpText = "Gets the name history of a player on Minecraft.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['mcnamehistory'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

MCNameHistory.prototype.execute = function(context) {
    context.apiClient = request.newClient("https://api.mojang.com/");

    if(!context.arguments[0]) {return false;}

    context.name = context.arguments[0];

    //TODO: make this follow redirects.
    //TODO: make this just generally work better. (show previous times and things of that nature.)
    //Example names to use: PlasmaPod, ezfe.

    context.apiClient.get("/users/profiles/minecraft/"+context.name, function(err, res, body) {
        if(err || body.error == "Not Found") {context.getClient().say(context, "There is no player with the name "+context.name+"!"); return true;}

        context.apiClient.get("/user/profiles/"+body.id+"/names", function(error, response, bodyy) {
            if(error || body.error == "Not Found" || body.length < 4) {context.getClient().say(context, "There was an error finding previous names for "+context.name+"!"); return true;}

            var outputString = "Previous names found for "+context.name+": ";
            for (var i = bodyy.length - 1; i >= 0; i--) {
                outputString += bodyy[i].name + " · ";
            };

            outputString = outputString.substring(0, outputString.length - 3);
            context.getClient().say(context, outputString);
        });
    });
    return true;
};

module.exports = MCNameHistory;