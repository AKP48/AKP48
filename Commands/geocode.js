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

var Google = require('../API/google');
var config = require('../config.json');

function Geocode(logger) {
    //the name of the command.
    this.name = "Geocode";

    //help text to show for this command.
    this.helpText = "Returns a geocoded location from Google.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<location> [2-letter region code]";

    //ways to call this command.
    this.aliases = ['geocode'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey, logger);
}

Geocode.prototype.execute = function(context) {
    if(!context.arguments.length) {
        return false;
    } else {
        var args = context.arguments;
    }

    var location = args.join(" ");
    var region = "";

    if(args[1]) {
        location = args.slice(0, args.length - 1).join(" ");
        if(args[args.length - 1].length === 2) {
            region = args[args.length - 1];
        } else {
            location += " "+args[args.length - 1];
        }
    }

    this.googleAPI.geocode(location, region, function(msg){
        context.getClient().say(context, msg);
    });
    return true;
};

module.exports = Geocode;