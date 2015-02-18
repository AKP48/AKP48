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

function Help() {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[page]";

    //ways to call this command.
    this.aliases = ['help', 'halp'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //commands per page
    this.perPage = 8;
}

Help.prototype.execute = function(context) {

    if(!context.getUser().isRealIRCUser) {
        context.getClient().say(context, "Getting help from the Minecraft server is not yet possible! To get help, please join the IRC channel.");
        return true;
    }

    var page = 0;

    if(context.getArguments().length) {
        //check if argument 0 is a number
        if(!isNaN(+context.getArguments()[0])) {
            page += (+context.getArguments()[0] - 1);
            if(page == 0) {page = 1;}
            if(page > 99) {page = 99;}
        } else {
            //not a number. Check for a command here, I guess.
        }
    }

    //array for output
    var responses = [];

    //get the current commands
    var commands = context.getCommandProcessor().commands;

    //for each command
    for (var property in commands) {
        if (commands.hasOwnProperty(property)) {
            //if command is really there
            if(commands[property] !== undefined) {

                //to tell us whether or not to send this message.
                var send = true;

                //check permission on user
                if(!context.getUser().hasPermission(commands[property].permissionName)) {
                    send = false;
                }

                //get user from global channel
                var globalUser = context.getClient().getChannel("global").getUser(context.getUser().getNick());
                //check permission on global channel user
                if(globalUser && !globalUser.hasPermission(commands[property].permissionName)) {
                    send = false;
                }

                if(send) {
                    responses.push(commands[property].name + ": " + commands[property].helpText + " | Usage: " + context.getChannel().getCommandDelimiter() + commands[property].aliases[0] + " " + commands[property].usageText.replace(/\r?\n/, " | "));
                }
            }
        }
    }

    var numberOfPages = Math.ceil(responses.length / this.perPage);

    //number of responses to waste
    var waste = page * this.perPage;

    while(waste > 0) {
        responses.shift();
        waste--;
    }

    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Help: Page "+(page+ 1)+" of "+numberOfPages+" (use "+context.getChannel().getCommandDelimiter()+"help [page] to switch pages)");

    var self = this;
    //counter for number per page
    var j = 0;

    var interval = setInterval(function() {
        if(responses.length && j < self.perPage) {
            var i = responses.shift();
            context.client.getIRCClient().notice(context.getUser().getNick(), i);
            j++;
        } else {
            clearInterval(interval);
        }
    }, 175);

    return true;
};

module.exports = Help;