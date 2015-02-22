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

function AutoResponseProcessor(logger) {
    //logger
    this.log = logger.child({module: "AutoResponseProcessor"});
    this.handlers = require('./AutoResponses');
}

/**
 * Adds a handler to the group of handlers that are called for each message.
 * @param {Handler} handler The handler to add.
 */
AutoResponseProcessor.prototype.addHandler = function(handler) {
    this.handlers.push(handler);
};

/**
 * Process a message.
 * @param  {IRCMessage} message The message object directly from the IRC module.
 * @param  {Client}     client  The client that this message came from.
 */
AutoResponseProcessor.prototype.process = function(message, client) {
    //the context we will be sending to the handler.
    var context = client.getClientManager().builder.buildContext(message, client);

    //if we don't get a context, something weird must have happened, and we shouldn't continue.
    //if we get a message that identifies as a bot, we shouldn't process it
    if(!context || context.getFullMessage().startsWith(client.botID)) {
        this.log.debug({
            user: context.getUser().getNick(), 
            fullMsg: context.getFullMessage(),
            reason: "User identifies as a bot, or a context wasn't created."
        }, "AutoResponse execution blocked.");
        return false;
    }

    //if user isn't banned
    if(!context.getChannel().isBanned(context.getUser())) {
        //process the message
        this.executeAll(context);
    } else {
        this.log.debug({
            user: context.getUser().getNick(), 
            fullMsg: context.getFullMessage(),
            reason: "User is banned."
        }, "AutoResponse execution blocked.");
    }
};

/**
 * Execute all handlers for a given context.
 * @param  {Context} context The context to execute handlers for.
 */
AutoResponseProcessor.prototype.executeAll = function(context) {
    var things = context.getFullMessage().split(" ");
    var responses = 0;
    var runs = {};
    var log = this.log;
    for (var i = 0; i < things.length && responses < 3; i++) {
        // This loop runs through all handlers and attempts to execute them.
        this.handlers.every(function (handler) {
            // Assign property if we haven't yet
            if (!runs.hasOwnProperty(handler)) {
                runs[handler] = 0;
            }

            //if the handler's regex matches, execute handler.
            if (things[i].search(handler.regex) != -1 && (!handler.limit || runs[handler] < handler.limit)) {
                handler.execute(things[i], context);
                log.info({user: context.getUser().getNick(), command: handler.name, fullMsg: context.getFullMessage()}, "AutoResponse handler executed.");
                runs[handler]++;
                responses++;
            }
            return responses < 3;
        });
    };
}

//export the module
module.exports = AutoResponseProcessor;
