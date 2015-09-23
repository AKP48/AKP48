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
 * Processes Action Contexts.
 * @param {Action} context The context to process.
 * @param {Logger}  logger  The logger.
 */
function ActionProcessor(context, logger) {
    this.initialize(logger);
    this.process(context);
}

ActionProcessor.prototype.initialize = function (logger) {
    this.handlers = require('./ActionResponders')(logger);
};

/**
 * Process the Context.
 * @param  {Context} context The Context to process.
 */
ActionProcessor.prototype.process = function (context) {
    if(!context.isContext || context.isBot) {
        return;
    }

    //TODO: Check permissions
    this.executeAllResponders(context);
};

/**
 * Execute all handlers for a given context.
 * @param  {Context} context The context to execute handlers for.
 */
ActionProcessor.prototype.executeAllResponders = function(context) {
    // This loop runs through all handlers and attempts to execute them.
    this.handlers.each(function (handler) {
        //if the handler's regex matches, execute handler.
        if (context.fullText.search(handler.regex) != -1) {
            handler.execute(context.fullText, context);
        }
    });
}


module.exports = ActionProcessor;
