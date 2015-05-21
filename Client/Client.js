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

var irc = require('irc');

/**
 * An IRC client.
 */
function Client(logger) {
    // The logger this client uses.
    this.log = logger.child({module: "Client"});

    // This client's UUID.
    this.uuid = "";

    // The nickname this client uses.
    this.nick = "IRCBot9000";

    // The server this client is connected to.
    this.server = "kuroi.irc.nolimitzone.com";

    // The port to use.
    this.port = 6667;

    // The username this client uses.
    this.username = "IRCBot9000";

    // The realname this client uses.
    this.realname = "IRCBot9000";

    // The password used by this client when connecting to the server.
    this.password = "";

    // The channels this client is connected to.
    this.channels = [];

    // The IRC client being used for this client.
    this.ircClient = null;

    // The ClientManager that manages this client.
    this.clientManager = null;

    // Whether or not this client is temporary. (Will not be saved on configuration saves)
    this.isTemporary = false;

    // Magic 'color' that represents a bot message
    this.botID = "\u000399";

    // Channels to alert on update
    this.alert = [];
}

/**
 * Set nickname.
 * @param {String} nick The new nickname.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setNick = function(nick) {
    this.nick = nick;
};

/**
 * Get nickname.
 * @return {String} The nickname.
 */
Client.prototype.getNick = function() {
    return this.nick;
};

/**
 * Set server address.
 * @param {String} server The new server address.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setServer = function(server) {
    this.server = server;
};

/**
 * Get server address.
 * @return {String} The server address.
 */
Client.prototype.getServer = function() {
    return this.server;
};

/**
 * Set server port.
 * @param {Integer} server The new port.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setPort = function(port) {
    this.port = port;
};

/**
 * Get server port.
 * @return {Integer} The server address.
 */
Client.prototype.getPort = function() {
    return this.port;
};

/**
 * Set real name.
 * @param {String} realname The new real name.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setRealName = function(realname) {
    this.realname = realname;
};

/**
 * Get real name.
 * @return {String} The real name.
 */
Client.prototype.getRealName = function() {
    return this.realname;
};

/**
 * Set user name.
 * @param {String} username The new username.
 * @TODO Make this work with ircClient, if created.
 */
Client.prototype.setUserName = function(username) {
    this.username = username;
};

/**
 * Get user name.
 * @return {String} The user name.
 */
Client.prototype.getUserName = function() {
    return this.username;
};

/**
 * Set server password.
 * @param {String} password The new server password.
 * @TODO Make this immutable once ircClient exists.
 */
Client.prototype.setPassword = function(password) {
    this.password = password;
};

/**
 * Get server password.
 * @return {String} The server password.
 */
Client.prototype.getPassword = function() {
    return this.password;
};

/**
 * Set channels.
 * @param {Array} channels The new channels.
 * @TODO Make this not work once ircClient has been set.
 */
Client.prototype.setChannels = function(channels) {
    this.channels = channels;
};

/**
 * Get channels.
 * @return {Array} The channels.
 */
Client.prototype.getChannels = function() {
    return this.channels;
};

/**
 * Add a channel.
 * @param {String} channel Channel to add.
 */
Client.prototype.addChannel = function(channel, callback) {
    //just return if this channel is already in the array.
    if(this.channels.indexOf(channel) == -1) {
        this.channels.push(channel);
        if(this.getIRCClient()) {
            this.getIRCClient().join(channel, callback);
        }
    }
};

/**
 * Remove a channel.
 * @param  {String} channel Channel to remove.
 * @TODO Make IRC client disconnect upon changing here.
 */
Client.prototype.removeChannel = function(channel, message, callback) {
    //get index of channel, -1 if non-existent
    var index = this.channels.indexOf(channel);
    if(index > -1) {
        this.channels.splice(index, 1);
        this.getIRCClient().part(channel, message, callback);
        return true;
    }
    return false;
};

/**
 * Whether or not the client is in a channel.
 * @param  {String}  channel The channel to check.
 * @return {Boolean}         Whether or not we're there.
 */
Client.prototype.isInChannel = function(channel) {
    if(this.channels.indexOf(channel) != -1) {
        return true;
    }
    return false;
};

/**
 * Get the IRC client that this Client uses.
 * @return {irc} The IRC client.
 */
Client.prototype.getIRCClient = function() {
    return this.ircClient;
};

/**
 * Get the ClientManager that controls this Client.
 * @return {ClientManager} The ClientManager.
 */
Client.prototype.getClientManager = function() {
    return this.clientManager;
};

/**
 * Set whether or not this Client should be temporary.
 * @param {Boolean} temporary New temporary status.
 */
Client.prototype.setTemporary = function(isTemporary) {
    this.isTemporary = temporary;
};

/**
 * Get the CommandProcessor from the ClientManager.
 * @return {CommandProcessor} The CommandProcessor.
 */
Client.prototype.getCommandProcessor = function() {
    return this.getClientManager().getCommandProcessor();
};

/**
 * Get the AutoResponseProcessor from the ClientManager.
 * @return {AutoResponseProcessor} The AutoResponseProcessor.
 */
Client.prototype.getAutoResponseProcessor = function() {
    return this.getClientManager().getAutoResponseProcessor();
};

/**
 * Get the ActionHandler from the ClientManager.
 * @return {ActionHandler} The ActionHandler.
 */
Client.prototype.getActionHandler = function() {
    return this.getClientManager().getActionHandler();
};

/**
 * Initialize the Client by creating an IRC client.
 */
Client.prototype.initialize = function(clientManager, holdIRCClient) {
    this.log.debug("Initializing client", this.getNick(), "on", this.getServer()+":"+this.getPort()+".");
    //set the client manager.
    this.clientManager = clientManager;

    //if there is a password, we use it. Otherwise, we leave it undefined, so we don't get an error from some IRC servers.
    var password = (this.getPassword().length ? this.getPassword() : undefined);

    //channels to connect to.
    var channels = [];

    //loop to get channel names
    this.getChannels().each(function (channel) {
        if(channel.isChannel()) {
            channels.push(channel);
        }
    });

    if(!holdIRCClient) {
        //create the IRC client. This automatically connects, as well.
        this.ircClient = new irc.Client(this.getServer(), this.getNick(), { channels: channels, realName: this.getRealName(), password: password, userName: this.getUserName(), port: this.getPort(), showErrors: true});
    }

    //attempt to remove eventListeners, then add new ones.
    this.ircClient.removeAllListeners('message');
    this.ircClient.removeAllListeners('action');
    this.ircClient.removeAllListeners('invite');
    this.ircClient.removeAllListeners('kick');

    var self = this;

    this.ircClient.on('message', function(nick, to, text, message) {
        //on each IRC message, run the command processor. If the command processor doesn't execute a command,
        //run the auto response processor.
        if(!self.getCommandProcessor().process(message, self)) {
            self.getAutoResponseProcessor().process(message, self);
        }
    });

    this.ircClient.on('action', function(from, to, text, message) {
        //on each IRC action, run the action handler.
        self.getActionHandler().process(message, self);
    });

    this.ircClient.on('invite', function(channel, from, message) {
        self.addChannel(channel);
        config.addChannel(channel, self.uuid);
        self.getIRCClient().join(channel, function(){
            self.getIRCClient().say(channel, "Thanks for inviting me, "+from+"! I'm glad to be here. For more information about me, say `.help`.");
            self.log.info("Joined channel "+channel+" after invite from "+from+".");
        });
    });
    
    this.ircClient.on('nick', function (oldNick, newNick) {
        if (oldNick === self.nick) {
            self.nick = newNick;
        }
    });

    this.ircClient.on('kick', function(channel, nick, by, reason, message) {
        if(nick == self.getIRCClient().nick) {
            self.removeChannel(channel);
            config.removeChannel(channel, self.uuid);
            self.log.info("Kicked from channel "+channel+" by "+by+" for \""+reason+"\".");
        }
    });

    this.ircClient.addListener('error', function(message) {
        self.log.error(message);
    });

    var botID = this.botID;
    this.ircClient._splitLongLines = function(words, maxLen, dest) {
        var ret = irc.Client.prototype._splitLongLines.call(this, words, maxLen-botID.length-1, dest);
        for (i = 0; i < ret.length; i++) {
            if (!ret[i].startsWith("\u0001")) {
                ret[i] = botID + '\u0003' + ret[i];
            }
        }
        return ret;
    };

    this.log.debug("Client", this.getNick(), "on", this.getServer()+":"+this.getPort(), "initialized.");
};

/**
 * Say a message to a context.
 * @param  {Context} context The context.
 * @param  {String}  message The message.
 */
Client.prototype.say = function(context, message) {
    var channel = (context.getChannel() === "global" ? context.getUser().getNick() : context.getChannel());
    this.getIRCClient().say(channel, context.getUser().getNick() + ": " + message);
    this.log.trace({message: message, user: context.getUser().getNick(), channel: channel}, "Sent message.");
};

/**
 * Get an object for the configuration file.
 * @return {Object} The configuration object.
 */
Client.prototype.getConfigObject = function() {
    return {
        "uuid": this.uuid,
        "nick": this.getNick(),
        "server": this.getServer(),
        "port": this.getPort(),
        "username": this.getUserName(),
        "realname": this.getRealName(),
        "password": this.getPassword()
    }
};

/**
 * Shuts down a client, sending a leave message.
 * @param  {String} msg The leave message.
 */
Client.prototype.shutdown = function(msg) {
    this.log.debug("Shutdown requested for client", this.getNick(), "on", this.getServer()+":"+this.getPort()+".");
    this.getIRCClient().disconnect(msg);
};

/**
 * Destroys this client.
 */
Client.prototype.destroy = function() {
    this.log.debug("Destroying client", this.getNick(), "on", this.getServer()+":"+this.getPort()+".");
    this.uuid = null;
    this.nick = null;
    this.server = null;
    this.port = null;
    this.username = null;
    this.realname = null;
    this.password = null;
    this.channels = null;
    this.ircClient = null;
    this.clientManager = null;
    this.isTemporary = null;
    this.botID = null;
    this.alert = null;

    delete this.uuid;
    delete this.nick;
    delete this.server;
    delete this.port;
    delete this.username;
    delete this.realname;
    delete this.password;
    delete this.channels;
    delete this.ircClient;
    delete this.clientManager;
    delete this.isTemporary;
    delete this.commandProcessor;
    delete this.autoResponseProcessor;
    delete this.botID;
    delete this.alert;

    delete this;
}

module.exports = Client;

/**
 * Build a Client.
 * @param  {Object}     options     The options that will configure the client.
 * @return {Client}                 The Client.
 */
module.exports.build = function build(options, logger) {
    //Make ourselves a new Client...
    var client = new Client(logger);

    var log = logger.child({module: "Client.build"});

    //set the options, if we get them.
    if(options.uuid) {
        client.uuid = options.uuid;
    }
    if(options.nick) {
        client.setNick(options.nick);
    }
    if(options.realname) {
        client.setRealName(options.realname);
    }
    if(options.username) {
        client.setUserName(options.username);
    }
    if(options.server) {
        client.setServer(options.server);
    }
    if(options.port) {
        client.setPort(options.port);
    }
    if(options.password) {
        client.setPassword(options.password);
    }

    var channels = (require("../data/config/channels/"+options.uuid+".json"));
    for (var key in channels) {
       if (channels.hasOwnProperty(key)) {
            var obj = channels[key];
            client.addChannel(key);
            if(obj.alert) {
                client.alert.push(key);
            }
        }
    }

    log.debug("Built client", client.getNick(), "on", client.getServer()+":"+client.getPort()+".");
    //return it.
    return client;
}
