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

var c = require('irc-colors');
var request = require('request-json');

function MinecraftServerStatus(logger) {
    //the name of the command.
    this.name = "Minecraft Server Status";

    //help text to show for this command.
    this.helpText = "Shows the status of Minecraft's login and session servers.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['minecraftserverstatus', 'mcserverstatus', 'mcstatus'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

MinecraftServerStatus.prototype.execute = function(context) {
    var apiClient = request.newClient("https://status.mojang.com/");
    var self = this;
    var cachedResponse = getClientManager().getCache().getCached(("MinecraftServerStatus").sha1());
    if(cachedResponse) {
        context.getClient().say(context, cachedResponse);
        return true;
    }

    apiClient.get("/check", function(err, res, body) {
        if(err) {self.client.getIRCClient().say(self.channel, "There was an error retrieving the Minecraft server status!"); return true;}
        var skins = body[4]['skins.minecraft.net'];
        var auth = body[3]["auth.mojang.com"];
        var session = body[1]["session.minecraft.net"];
        var website = body[0]["minecraft.net"];

        var outputString = "Minecraft Server Status: ";

        switch(website) {
            case "green":
                outputString += c.green("Website: Online")+" · ";
                break;
            case "yellow":
                outputString += c.yellow("Website: Having Trouble")+" · ";
                break;
            case "red":
                outputString += c.red("Website: Offline")+" · ";
        }

        switch(auth) {
            case "green":
                outputString += c.green("Auth Server: Online")+" · ";
                break;
            case "yellow":
                outputString += c.yellow("Auth Server: Having Trouble")+" · ";
                break;
            case "red":
                outputString += c.red("Auth Server: Offline")+" · ";
        }

        switch(session) {
            case "green":
                outputString += c.green("Session Server: Online")+" · ";
                break;
            case "yellow":
                outputString += c.yellow("Session Server: Having Trouble")+" · ";
                break;
            case "red":
                outputString += c.red("Session Server: Offline")+" · ";
        }

        switch(skins) {
            case "green":
                outputString += c.green("Skins: Online");
                break;
            case "yellow":
                outputString += c.yellow("Skins: Having Trouble");
                break;
            case "red":
                outputString += c.red("Skins: Offline");
        }

        var cacheExpire = (Date.now() / 1000 | 0) + 30; //make cache expire in 30 seconds
        getClientManager().getCache().addToCache(("MinecraftServerStatus").sha1(),outputString, cacheExpire);

        context.getClient().say(context, outputString);
    });
    return true;
};

module.exports = MinecraftServerStatus;