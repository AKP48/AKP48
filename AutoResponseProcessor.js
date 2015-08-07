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

var Context = require("./Client/Context");

function AutoResponseProcessor(logger) {
    //logger
    this.log = logger.child({module: "AutoResponseProcessor"});
    this.handlers = require('./AutoResponses')(logger, false);
    this.fullMsgHandlers = require('./AutoResponses')(logger, true);
}

/**
 * Adds a handler to the group of handlers that are called for each message.
 * @param {Handler} handler The handler to add.
 */
AutoResponseProcessor.prototype.addHandler = function(handler) {
    this.handlers.push(handler);
};

/**
 * Adds a full message handler to the group of handlers that are called for each message.
 * @param {Handler} handler The handler to add.
 */
AutoResponseProcessor.prototype.addFullMsgHandler = function(handler) {
    this.fullMsgHandlers.push(handler);
};

/**
 * Process a message.
 * @param  {IRCMessage} message The message object directly from the IRC module.
 * @param  {Client}     client  The client that this message came from.
 */
AutoResponseProcessor.prototype.process = function(message, client) {
    //the context we will be sending to the handler.
    var context = Context.build(message, client);

    //if we don't get a context, something weird must have happened, and we shouldn't continue.
    //if we get a message that identifies as a bot, we shouldn't process it
    if(!context || context.getFullMessage().startsWith(client.botID)) {
        this.log.debug({
            reason: "User identifies as a bot, or a context wasn't created."
        }, "AutoResponse execution blocked.");
        return false;
    }

    //if user isn't banned
    if(!(config.getPerms().powerLevelFromContext(context) <= config.powerLevels[context.getClient().uuid]["banned"])) {
        //process the message
        this.executeAll(context);
    } else {
        this.log.debug({
            user: context.getUser().getNick(),
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
                runs[handler]++;
                responses++;
            }
            return responses < 3;
        });
    };

    // Run all full message handlers on the message.
    this.fullMsgHandlers.every(function(handler) {
        handler.execute(context.getFullMessage(), context);
        return true;
    });
}

//export the module
module.exports = AutoResponseProcessor;
