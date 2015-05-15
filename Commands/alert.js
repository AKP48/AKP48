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

// TODO: make this use various permissions, show only channels you have permissions for
function Alert() {
    //the name of the command.
    this.name = "Alert";

    //help text to show for this command.
    this.helpText = "Adds/Removes channels the bot will alert for updates. Will reply with all alerted channels on empty message.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[+|-] | [[-]channel]...";

    //ways to call this command.
    this.aliases = ['alert', 'notify'];

    // depend on git, will only enable if git is enabled
    this.dependencies = ['git'];

    //The power level needed to use this command.
    this.powerLevel = 9000;

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Alert.prototype.execute = function(context) {
    var results = [];

    function _add(channel) {
        channel = channel || context.getChannel().name;
        var index = _index(channel);
        if (index === -1) {
            context.getClient().alert.push(channel);
            results.push("+"+channel);
        }
    }
    function _remove(channel) {
        channel = channel || context.getChannel().name;
        var index = _index(channel);
        if (index !== -1) {
            context.getClient().alert.splice(index, 1);
            results.push("-"+channel);
        }
    }
    function _index(channel) {
        var alert = context.getClient().alert;
        for (i = 0; i < alert.length; i++) {
            if (alert[i] == channel) {
                return i;
            }
        }
        return -1;
    }

    var nick = context.getUser().getNick();
    if (context.getArguments().length == 0) {
        context.getClient().getIRCClient().notice(nick, "Currently alerting: " + (context.getClient().alert.join(", ") || "none"));
    } else {
        context.getArguments().each(function (arg) {
            if (arg.startsWith("-")) {
                _remove(arg.substring(1));
            } else {
                if (arg.startsWith("+")) {
                    arg = arg.substring(1);
                }
                _add(arg);
            }
        });
        var message = results.join(", ");
        context.getClient().getIRCClient().notice(nick, "Alert changes: " + (message || "none"));
    }
    return true;
};

module.exports = Alert;
