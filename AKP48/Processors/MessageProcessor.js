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
 * Processes Message Contexts.
 * @param {Context} context The context to process.
 * @param {Logger}  logger  The logger.
 */
function MessageProcessor(context, logger) {
    this.initialize(logger);
    this.process(context);
}

/**
 * Initialize this MessageProcessor.
 * @param  {logger} logger The logger to use.
 */
MessageProcessor.prototype.initialize = function (logger) {
    this.handlers = require('./MessageResponders')(logger, false);
    this.fullMsgHandlers = require('./MessageResponders')(logger, true);
};

/**
 * Process a Message Context.
 * @param  {Context} context The Context to process.
 */
MessageProcessor.prototype.process = function (context) {
    if(!context.isContext || context.isBot) {
        return;
    }

    //TODO: check permissions.
    this.executeAllResponders(context);
};

/**
 * Execute all responders for a given context.
 * @param  {Context} context The context to execute responders for.
 */
MessageProcessor.prototype.executeAllResponders = function(context) {
    var things = context.fullText.split(" ");
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
        handler.execute(context.fullText, context);
        return true;
    });
}

module.exports = MessageProcessor;
