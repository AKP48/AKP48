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

function Reload() {
    //the name of the command.
    this.name = "Reload";

    //help text to show for this command.
    this.helpText = "Reloads the bot's command processor.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['reload', 'rl'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

Reload.prototype.execute = function(context) {
    delete require.cache[require.resolve('../CommandProcessor')];
    delete require.cache[require.resolve('../AutoResponseProcessor')];
    delete require.cache[require.resolve('../config.json')];

    this.removeAPIAndCommandCache();

    context.getClient().say(context, "All channels reloading!");
    context.getClient().getClientManager().reloadClients();
    return true;
};

Reload.prototype.removeAPIAndCommandCache = function() {
    require('fs').readdirSync(__dirname).forEach(function(file) {
        delete require.cache[require.resolve('./'+file)];
    });

    delete require.cache[__dirname];

    require('fs').readdirSync(__dirname + '/../API/').forEach(function(file) {
        delete require.cache[require.resolve('../API/' + file)];
    });

    require('fs').readdirSync(__dirname + '/../Regex/').forEach(function(file) {
        delete require.cache[require.resolve('../Regex/' + file)];
    });

    require('fs').readdirSync(__dirname + '/../AutoResponses').forEach(function(file) {
        delete require.cache[require.resolve('../AutoResponses/' + file)];
    });

    delete require.cache[require.resolve('../AutoResponses/')];
};

module.exports = Reload;