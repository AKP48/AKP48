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

var path = require('path');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'AKP48 AutoResponseProcessor',
    streams: [{
        type: 'rotating-file',
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    },
    {
        stream: process.stdout
    }]
});

function AutoResponseProcessor() {
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
    if(!context) {return false;}

    //if user isn't banned
    if(!context.getChannel().isBanned(context.getUser())) {
        //process the message
        this.executeAll(context);
    }
};

/**
 * Execute all handlers for a given context.
 * @param  {Context} context The context to execute handlers for.
 */
AutoResponseProcessor.prototype.executeAll = function(context) {
    var things = context.getFullMessage().split(" ");
    var responses = 0;
    for (var i = 0; i < things.length; i++) {
        // This loop runs through all handlers and attempts to execute them.
        for (var property in this.handlers) {
            //if the property exists
            if (this.handlers.hasOwnProperty(property)) {
                //if the handler's regex matches, execute handler.
                if(things[i].search(this.handlers[property].regex) != -1 && responses < 3) {
                        this.handlers[property].execute(things[i], context);
                        log.info("AutoResponse handler executed: ", {user: context.getUser(), command: this.handlers[property].name, fullMsg: context.getFullMessage()});
                        responses++;
                }
            }
        }
    };
}

//export the module
module.exports = AutoResponseProcessor;