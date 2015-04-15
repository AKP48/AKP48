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
 * A context.
 */
function Context() {
    // The user this context is for.
    this.user = null;

    // The channel this context is for.
    this.channel = null;

    // The client this context is for.
    this.client = null;

    // The full original message text.
    this.fullMessage = "";

    // Whether or not this context is for a private message.
    this.isPm = false;

    // The CommandProcessor being used to respond to this context.
    this.commandProcessor = null;

    // The commands available to this context.
    this.commands = null;

    // The command being requested in this context.
    this.command = null;

    // The arguments being requested in this context.
    this.arguments = [];
}

Context.prototype.setUser = function(user) {
    this.user = user;
};

Context.prototype.getUser = function() {
    return this.user;
};

Context.prototype.setChannel = function(channel) {
    this.channel = channel;
};

Context.prototype.getChannel = function() {
    return this.channel;
};

Context.prototype.setClient = function(client) {
    this.client = client;
};

Context.prototype.getClient = function() {
    return this.client;
};

Context.prototype.setFullMessage = function(message) {
    this.fullMessage = message.toString();
};

Context.prototype.getFullMessage = function() {
    return this.fullMessage;
};

Context.prototype.setIsPm = function(isPm) {
    this.isPm = isPm;
};

Context.prototype.setCommandProcessor = function(commandProcessor) {
    this.commandProcessor = commandProcessor;
};

Context.prototype.getCommandProcessor = function() {
    return this.commandProcessor;
};

Context.prototype.setCommands = function(commands) {
    this.commands = commands;
};

Context.prototype.getCommands = function() {
    return this.commands;
};

Context.prototype.setCommand = function(command) {
    this.command = command.toLowerCase();
};

Context.prototype.getCommand = function() {
    if(!this.commandExists()){return false;}
    return this.commands[this.command];
};

Context.prototype.setArguments = function(arguments) {
    this.arguments = arguments;
};

Context.prototype.getArguments = function() {
    return this.arguments;
};

Context.prototype.commandExists = function() {
    return (this.commands[this.command] !== undefined && typeof this.commands[this.command].execute === 'function');
};

module.exports = Context;