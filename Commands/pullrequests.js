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

function PullRequests() {
    //the name of the command.
    this.name = "GH Pull Requests";

    //help text to show for this command.
    this.helpText = "Gives a link to the pull requests page on GitHub.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['pr', 'prs', 'pulls', 'ghpulls', 'ghpr', 'ghprs'];

    //dependencies that this module has.
    this.dependencies = ['googl'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

PullRequests.prototype.execute = function(context) {
    context.getClient().getCommandProcessor().aliasedCommands['googl'].shortenURL(context, "https://github.com/AKPWebDesign/AKP48/pulls");
    return true;
};

module.exports = PullRequests;