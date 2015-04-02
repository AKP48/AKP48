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

var Gist = require('../API/gist');
var Google = require('../API/google');
var config = require('../config.json');

function Help(logger) {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['help', 'halp'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //Gist API
    this.gistAPI = new Gist(logger);

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey, logger);
}

Help.prototype.execute = function(context) {
    var markdown = "";
    //for each command
    context.getCommandProcessor().commands.each(function (command) {
            //to tell us whether or not to send this message.
            var send = true;

            //check permission on user
            if(!context.getUser().hasPermission(command.permissionName)) {
                send = false;
            }

            //get user from global channel
            var globalUser = context.getClient().getChannel("global").getUser(context.getUser().getNick());
            //check permission on global channel user
            if(globalUser && !globalUser.hasPermission(command.permissionName)) {
                send = false;
            }

            if(send) {
                markdown += "##" + command.name + "  \n";
                markdown += "*" + command.helpText + "*  \n";
                markdown += "**Usage:** " + context.getChannel().getCommandDelimiter() + command.aliases[0] + " " + command.usageText.replace(/\r?\n/, " | ") + "  \n";
                if(command.aliases.length > 1) {
                    markdown += "**Aliases:** ";
                    for (var i = 0; i < command.aliases.length; i++) {
                        if(i != 0) {
                            markdown += command.aliases[i] + ", ";
                        }
                    };
                    markdown = markdown.slice(0, -2);
                    markdown += "  \n";
                }
            }
    });

    var self = this;

    //create gist of response
    this.gistAPI.create({
        description: "Help for " + context.getClient().getNick(),
        files: {
            "help.md": {
                "content": markdown
            }
        }
    }, function(url) {
        if(!url){return;}
        self.googleAPI.shorten_url(url, function(url) {
            if(!context.getUser().isRealIRCUser) {
                context.getClient().say(context, url);
            } else {
                context.client.getIRCClient().notice(context.getUser().getNick(), url);
            }
        });
    });

    return true;
};

module.exports = Help;
