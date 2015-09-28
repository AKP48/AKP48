/**
 * Copyright (C) 2015  Austin Peterson, Alan Hamid (feildmaster)
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

// TODO: only enable if we're in a git repo
function Git(logger) {
    //the name of the command.
    this.name = "Git";

    //help text to show for this command.
    this.helpText = "Allows controlling of the repository this bot is running off.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "checkout <branch> | fetch";

    //ways to call this command.
    this.aliases = ['git'];

    //dependencies that this module has.
    this.dependencies = [];
}

Git.prototype.execute = function(context) {
    if(config.getPerms().powerLevelFromContext(context) < config.powerLevels[context.getClient().uuid]["root"]) {
        return true;
    }

    var args = context.arguments;
    if (args.length < 1) {
        return false;
    }
    var message = "";

    switch (args.splice(0, 1)[0].toLowerCase()) {
        case "checkout":
            if (args.length != 1) {
                return false;
            }
            var branch = args.splice(0,1)[0];
            var nick = context.nick;
            if (context.AKP48.getAPI("Git").checkout(branch)) {
                message = "Checked out ".append(branch);
            } else {
                message = "Encountered an error while checking out ".append(branch);
            }
            break;
        case "fetch":
            if (args.length) {
                return false;
            }
            if (context.AKP48.getAPI("Git").fetch()) {
                message = "Fetched head";
            } else {
                message = "Error while fetching head";
            }
        default: return false;
    }
    if (message) context.AKP48.client.notice(nick, message);

    return true;
};

module.exports = Git;
