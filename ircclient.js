var irc = require('irc');
var CommandProcessor = require("./commandprocessor");

function IRCClient(o, clientManager, save) {
    this.name = o.name;

    this.server = o.server;

    this.nick = o.nick;

    this.users = o.users;

    if(!this.users) {this.users = [];}

    this.channels = o.channels;

    this.password = o.password;

    if(this.password) {
        if(!this.password.length) {this.password = undefined;}
    }

    this.ircClient = new irc.Client(this.server, this.nick, { channels: this.channels, realName: this.nick, password: this.password, userName: this.nick });

    this.mcBot = o.mcBot;

    this.delimiter = o.delimiter;

    this.clientManager = clientManager;

    this.saveConfig = save;

    this.commandProcessor = new CommandProcessor();

    //flood protection
    this.chatters = [];

    var self = this;

    this.ircClient.on('message', function(nick, to, text, message) {
        self.commandProcessor.process(nick, to, text, self);
    });
}

IRCClient.prototype.say = function(context, message) {
    this.getIRCClient().say(context.channel, context.nick + ": " + message);
};

IRCClient.prototype.reload = function() {
    CommandProcessor = require("./commandprocessor")

    this.commandProcessor = new CommandProcessor();
};

IRCClient.prototype.getIRCClient = function() {
    return this.ircClient;
};

IRCClient.prototype.getUser = function(nick) {
    //attempt to get the user requested.
    var index = this.users.indexOf(nick);

    //if the user doesn't exist, return false.
    if(index == -1) {return false;}

    //otherwise, return the user.
    return this.users[index];
};

IRCClient.prototype.getUserPermissions = function(nick) {
    //piggyback on the getUser command.
    return this.getUser(nick).permissions;
};

IRCClient.prototype.getConfig = function() {
    if(!this.saveConfig) {return false;};

    var config = {};

    config.name = this.name;
    config.server = this.server;
    config.password = this.password;
    config.nick = this.nick;
    config.channels = this.channels;
    config.delimiter = this.delimiter;
    config.ops = this.ops;
    config.banned = this.banned;
    config.mcBot = this.mcBot;

    return config;
};

IRCClient.prototype.addChannel = function(channel) {
    var index = this.channels.indexOf(channel);
    if (index > -1) {
        return;
    }

    var self = this;

    this.getIRCClient().join(channel, function() {
        self.channels.push(channel);
        self.clientManager.saveConfig();
    });
}

IRCClient.prototype.removeChannel = function(channel) {
    var index = this.channels.indexOf(channel);
    if (index > -1) {
        this.channels.splice(index, 1);

        var self = this;

        this.getIRCClient().part(channel, "Goodbye.", function() {
            self.clientManager.saveConfig();
        });
    }
};

IRCClient.prototype.disconnect = function(msg) {
    this.getIRCClient().disconnect(msg);
};

module.exports = IRCClient;