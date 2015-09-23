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

var CommandProcessor = require('./CommandProcessor');
var ActionProcessor = require('./ActionProcessor');
var MessageProcessor = require('./MessageProcessor');

/**
 * Processes Contexts, based on what needs to be done.
 * @param {Context} context The context to process.
 */
function ContextProcessor(context, logger) {
    this.process(context, logger);
}

ContextProcessor.prototype.process = function (context, logger) {
    if(context.hasCommand) {
        return new CommandProcessor(context, logger);
    }

    if(context.isAction) {
        return new ActionProcessor(context, logger);
    }

    return new MessageProcessor(context, logger);
};

module.exports = ContextProcessor;
