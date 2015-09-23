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

 var jf = require('jsonfile');
 jf.spaces = 4;

/**
 * The custom command database interface.
 */
function CCD(logger) {
    this.customCommands = require("../data/config/customCommands.json");
    this.log = logger.child({module: "Custom Command Dictionary"});

    var self = this;

    setTimeout(function() {
        self.loadCommands();
    }, 5000); //load custom commands in 5 seconds.
}

CCD.prototype.loadCommands = function () {
    this.log.info("Loading custom commands!");
    for (var i = 0; i < this.customCommands.length; i++) {
        if(!this.loadSingleCommand(this.customCommands[i])) {
            this.log.error(this.customCommands[i], "Could not load command!");
        }
    }
};

CCD.prototype.loadSingleCommand = function (cmd) {
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
        message = message.replace(/\[user\]/g, context.nick);

        if(context.arguments.length) {
            message = context.arguments.join(" ") + ": " + message;
        }

        context.AKP48.ircClient.say(context.channel, message);
        return true;
    }

    var instancedCommand = new cmd(name, msg, server, channel);

    getClientManager().getCommandProcessor().aliasedCommands[name] = instancedCommand;
    return true;
};

CCD.prototype.addCommand = function (cmd) {
    this.customCommands[cmd.name] = cmd;
    this.save();
    return this.loadSingleCommand(cmd);
};

CCD.prototype.removeCommand = function (server, channel, name) {
    //remove command from config
    commands = this.customCommands;
    for (var i = 0; i < commands.length; i++) {
        if(commands[i].server == server && commands[i].channel == channel && commands[i].name == name) {
            this.customCommands.splice(i, 1);
        }
    }

    //remove command from running server
    commands = getClientManager().getCommandProcessor().aliasedCommands[name];
    for (var i = 0; i < commands.length; i++) {
        if(commands[i].server == server && commands[i].channel == channel && commands[i].name == name) {
            getClientManager().getCommandProcessor().aliasedCommands.splice(i, 1);
        }
    }

    //save config
    this.save();

    return true;
};

CCD.prototype.save = function () {
    var file = "./data/config/customCommands.json";
    jf.writeFileSync(file, this.customCommands);
};

module.exports = CCD;
