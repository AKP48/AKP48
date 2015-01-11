var irc = require('irc');
var CommandProcessor = require("./commandprocessor");

function IRCClient(o, clientManager, save) {
    this.name = o.name;

    this.server = o.server;

    this.nick = o.nick;

    this.ops = o.ops;

    this.banned = o.banned;

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

IRCClient.prototype.isOp = function(nick) {
    if(this.ops.indexOf(nick) > -1) {
        return false; // I literally don't know why that isn't working, but uh... doesn't matter with the rewrite anyway.
    }

    return false;
};

IRCClient.prototype.isBanned = function(nick) {
    if(this.banned.indexOf(nick) > -1) {
        return true;
    }

    return false;
};

IRCClient.prototype.setOp = function(nickname) {
    this.ops.push(nickname);
};

IRCClient.prototype.setBanned = function(nickname) {
    this.banned.push(nickname);
};

IRCClient.prototype.deop = function(nickname) {
    var index = this.ops.indexOf(nickname);
    if (index > -1) {
        this.ops.splice(index, 1);
    }
};

IRCClient.prototype.unban = function(nickname) {
    var index = this.banned.indexOf(nickname);
    if (index > -1) {
        this.banned.splice(index, 1);
    }
};

IRCClient.prototype.getIRCClient = function() {
    return this.ircClient;
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