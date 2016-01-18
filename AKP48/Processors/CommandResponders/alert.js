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
    this.name = i18n.getString("alert_name");

    //help text to show for this command.
    this.helpText = i18n.getString("alert_help");

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = i18n.getString("alert_usage");

    //ways to call this command.
    this.aliases = ['alert', 'notify'];

    // depend on git, will only enable if git is enabled
    this.dependencies = ['git'];

    //The required power level for this command.
    this.powerLevel = "root";
}

Alert.prototype.execute = function(context) {
    var results = [];

    function _add(channel) {
        channel = channel;
        var index = _index(channel);
        if (index === -1) {
            context.AKP48.alert.push(channel);
            results.push("+"+channel);
        }
    }
    function _remove(channel) {
        channel = channel;
        var index = _index(channel);
        if (index !== -1) {
            context.AKP48.alert.splice(index, 1);
            results.push("-"+channel);
        }
    }
    function _index(channel) {
        var alert = context.AKP48.alert;
        for (i = 0; i < alert.length; i++) {
            if (alert[i] == channel) {
                return i;
            }
        }
        return -1;
    }

    var nick = context.nick;
    var noneString = i18n.getString("none");

    if (context.arguments.length == 0) {
        context.AKP48.client.notice(nick, i18n.getString("alert_current") + (context.AKP48.alert.join(", ") || noneString));
    } else {
        context.arguments.each(function (arg) {
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
        context.AKP48.client.notice(nick, i18n.getString("alert_changes") + (message || noneString));
    }
    return true;
};

module.exports = Alert;
