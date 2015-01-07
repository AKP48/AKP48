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
    this.command = "";

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
    this.fullMessage = message;
};

Context.prototype.getFullMessage = function() {
    return this.fullMessage;
};

Context.prototype.setIsPm = function(isPm) {
    this.isPm = isPm;
};

Context.prototype.setCommandProcessor = function(commandProcssor) {
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
    this.command = command;
};

Context.prototype.getCommand = function() {
    return this.command;
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