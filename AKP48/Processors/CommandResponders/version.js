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

var Git = require("../../APIs/git");

function Version(logger) {
    //the name of the command.
    this.name = "Version";

    //help text to show for this command.
    this.helpText = "Gets the version of the bot that is running.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['version', 'ver', 'v'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    // Base version
    this.version_base = require('../../../package.json').version;

    //Git API
    this.git = new Git(logger);

    this.version = this.buildVersion();
}

Version.prototype.execute = function(context) {
    //if the user is a global op, send them the version the files are on, which may not be the version the server is running.
    // if (config.getPerms().powerLevel(context.getUser().getHostmask(), "global", context.getClient().uuid) >= config.powerLevels[context.getClient().uuid]["root"]) {
    //     context.getClient().getIRCClient().notice(context.getUser().getNick(), "Server: "+this.buildVersion());
    // }

    context.AKP48.say(context.channel, "v"+this.version);
    return true;
};

Version.prototype.buildVersion = function() {
    var version = this.version_base;
    var git = this.git;
    if (git.isRepo()) {
        var gitSHA = git.getCommit().substring(0, 7);
        var tagOrBranch = git.getBranch() || git.getTag();

        if (gitSHA) {
            version += "+".append(gitSHA);
        }
        if (tagOrBranch) {
            version += "-".append(tagOrBranch);
        }
    }
    return version;
};

module.exports = Version;
