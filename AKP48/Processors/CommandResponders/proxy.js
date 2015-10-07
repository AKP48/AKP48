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

var Context = require('../../Context');
var Message = require('../../Message');
var ContextProcessor = require('../ContextProcessor');

function Proxy(logger) {
    //the name of the command.
    this.name = "Proxy";

    //help text to show for this command.
    this.helpText = "Send a message to a channel as the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<channel> <text>";

    //ways to call this command.
    this.aliases = ['proxy'];

    //The required power level for this command.
    this.powerLevel = "root";

    //logger for proxy contexts.
    this.logger = logger;
}

Proxy.prototype.execute = function(context) {
    if(!(context.arguments.length >= 2)) {return false;}

    var channel = context.arguments[0];
    //remove channel from arguments
    context.arguments.splice(0, 1);

    //Check to see if we want an action
    if(context.arguments[0] == "/me") {
        //if so, send an action
        context.arguments.splice(0, 1);
        context.AKP48.client.action(channel, context.arguments.join(" "));
        //tell the user we were successful.
        context.AKP48.client.notice(context.nick, "Attempted to send action to "+channel+"!");
    } else {

        //if not, create context from message.
        var message = new Message(context.nick, context.to, context.arguments.join(" "), context.message.user,
                                  context.message.host, context.message.prefix, false, true);
        var context = new Context(message, context.AKP48, this.logger);

        //if the context is a command, process it, otherwise, send the message to the proper channel.
        if(context.hasCommand && context.isContext) {
            return new ContextProcessor(context, this.logger);
            context.AKP48.client.notice(context.nick, "Attempted to run command in "+channel+"!");
        } else {
            context.AKP48.client.say(channel, context.text);
            //tell the user we were successful.
            context.AKP48.client.notice(context.nick, "Attempted to send message to "+channel+"!");
        }
    }
    return true;
};

module.exports = Proxy;
