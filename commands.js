function Commands() {}

Commands.prototype.op = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.setOp(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Opped "+args.join(", "));
    }
}

Commands.prototype.ban = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.setBanned(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Banned "+args.join(", "));
    }
};

Commands.prototype.deop = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.deop(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Deopped "+args.join(", "));
    }
}

Commands.prototype.unban = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.unban(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Unbanned "+args.join(", "));
    }
}

Commands.prototype.nick = function(nick, args, client, channel, op, pm) {
    if(op && pm && args[0]) {
        client.getIRCClient().send("NICK", args[0]);
        client.nick = args[0];
    }
}

Commands.prototype.addserver = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 6) {
        client.getIRCClient().say(nick, "Usage: addServer <name> <serverAddress> <nick> <channel> <mcBotName> <commandDelimiter>");
        return;
    }

    var created = client.clientManager.createClient({
                    name: args[0],
                    server: args[1],
                    nick: args[2],
                    ops: [nick],
                    banned: [],
                    channels: [args[3]],
                    mcBot: args[4],
                    delimiter: args[5],
                });

    client.clientManager.saveConfig();

    if(!created) {
        client.getIRCClient().say(nick, "There was a problem creating the client!");
    } else {
        client.getIRCClient().say(nick, "Client created!");
    }

};

Commands.prototype.addchannel = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 1) {
        client.getIRCClient().say(nick, "Usage: addChannel <channelName>");
        return;
    }

    client.addChannel(args[0]);
};

Commands.prototype.removechannel = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 1) {
        client.getIRCClient().say(nick, "Usage: removeChannel <channelName>");
        return;
    }

    client.removeChannel(args[0]);
};

Commands.prototype.disconnect = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    var msg = "Goodbye.";

    if(args[0]) {
        msg = args.join(" ");
    }

    client.getIRCClient().say(nick, "Disconnecting! ("+msg+")");

    client.clientManager.removeClient(client, msg);
};

Commands.prototype.sendmessage = function(nick, args, client, channel, op, pm) {
    if(args[0] !== undefined) {
        for (var i = 0; i < client.clientManager.clients.length; i++) {
            for (var k = client.clientManager.clients[i].channels.length - 1; k >= 0; k--) {
                client.clientManager.clients[i].getIRCClient().say(client.clientManager.clients[i].channels[k], args.join(" "));
            };
        };
    }
};

Commands.prototype.changeDelimiter = function(nick, args, client, channel, op, pm) {
    if(args[0]) {
        console.log(args[0]);
        client.delimiter = args[0];
        client.clientManager.saveConfig();
        client.getIRCClient().say(nick, "Delimiter changed!");
        console.log("Delimiter changed! -> "+args[0]);
    } else {
        client.getIRCClient().say(nick, "Usage: changeDelimiter <newDelimiter>");
    }
};

Commands.prototype.restart = function(nick, args, client, channel, op, pm) {
    if(!op || !pm) {
        return;
    }

    var msg = "Goodbye.";

    if(args[0]) {
        msg = args.join(" ");
    }

    client.clientManager.shutdown(msg);
};

//export the module
module.exports = Commands;