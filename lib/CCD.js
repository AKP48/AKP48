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

/**
 * The custom command database interface.
 */
function CCD(logger) {
    this.customCommands = [];
    this.log = logger.child({module: "Custom Command Dictionary"});
}

CCD.prototype.loadCommands = function () {
    for (var i = 0; i < this.customCommands.length; i++) {
        if(!this.loadSingleCommand(this.customCommands[i], context)) {
            this.log.error(this.customCommands[i], "Could not load command!");
        }
    }
};

CCD.prototype.loadSingleCommand = function (cmd, context) {
    var name = cmd.name;
    var msg = cmd.msg;
    var server = cmd.server;
    var channel = cmd.channel;

    var cmd = function(name, msg, server, channel) {
        this.name = name;
        this.msg = msg;
        this.server = server;
        this.channel = channel;
    }

    cmd.prototype.execute = function(context) {
        if(!this.server == "global") {
            if(this.server != context.getClient().uuid) {
                return true;
            }
        }

        if(!this.channel == "global") {
            if(this.channel != context.getChannel()) {
                return true;
            }
        }

        var message = this.msg.replace(/\[time\]/g, Math.floor(new Date() / 1000));

        if(context.arguments.length) {
            message = context.arguments.join(" ") + ": " + message;
        }

        context.getClient().getIRCClient().say(context.getChannel(), message);
        return true;
    }

    var instancedCommand = new cmd(name, msg, server, channel);

    //main commands cannot be taken over by an alias. aliases to main commands, however, can be realiased.
    if(context.getClient().getCommandProcessor().commands[name] == undefined) {
        context.getClient().getCommandProcessor().aliasedCommands[name] = instancedCommand;
        this.log.debug(instancedCommand, "Adding command!");
        return true;
    }

    return false;
};

CCD.prototype.addCommand = function (cmd, context) {
    // TODO: saving logic.
    return this.loadSingleCommand(cmd, context);
};

CCD.prototype.removeCommand = function (server, channel, name) {

};

module.exports = CCD;
