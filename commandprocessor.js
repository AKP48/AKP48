var Commands = require('./commands');
var AutoResponse = require('./autoresponse');
var Chatter = require("./chatter");

function CommandProcessor() {
    this.cmd = new Commands();
    this.auto = new AutoResponse();

    //command list for help purposes, leaves out aliases.
    this.commands = require('./Commands');

    //full command list with aliases included.
    this.aliasedCommands = {};
    this.initCommandAliases();
}

CommandProcessor.prototype.initCommandAliases = function() {
    for (var property in this.commands) {
        if (this.commands.hasOwnProperty(property)) {
            for (var i = 0; i < this.commands[property].aliases.length; i++) {
                this.aliasedCommands[this.commands[property].aliases[i]] = this.commands[property];
            };
        }
    }
};

CommandProcessor.prototype.process = function(nick, channel, text, client) {

    //the context we will be sending to the command.
    var context = {};

    //these help in our string parsing.
    var start = -1;
    var end = -1;

    //ignore ourself
    if(nick === client.nick) {return;}

    //if the message came from our minecraft bot...
    if(nick === client.mcBot) {

        //find nick
        start = text.indexOf('(');
        end = text.indexOf(')');

        //set nick
        context.nick = text.substring(start + 1, end);

        //trim text down to remove username
        text = text.substring(end+2);
    } else {
        context.nick = nick;
    }

    //the channel the message came from.
    context.channel = channel;
    //this command processor.
    context.commandProcessor = this;
    //the client.
    context.client = client;
    //whether or not this nick is an op.
    context.isOp = client.isOp(context.nick);

    //if this is true, then this is a private message.
    if(channel === client.nick) {
        context.channel = nick;
        context.isPm = true;
    }

    //if we have a command
    if(text.substring(0, client.delimiter.length) === client.delimiter) {

        //find command
        end = text.indexOf(' ');
        context.command = text.substring(client.delimiter.length,end);

        //if there wasn't actually a space, we won't have gotten a command.
        //instead, we'll just chop off the first two characters now.
        if(end === -1) {
            context.command = text.substring(client.delimiter.length, text.length);
        } else {
            //otherwise, we can cut off the command and save the arguments.
            context.arguments = text.substring(end+1).split(' ');
        }

        //lowercase the command
        context.command = context.command.toLowerCase();

        if(this.aliasedCommands[context.command] !== undefined) {
            if(typeof this.aliasedCommands[context.command].execute === 'function') {

                //TODO: refactor this to somewhere else.
                if(!client.isBanned(context.nick) && this.floodProtection(context)) {

                    //execute the command.
                    this.aliasedCommands[context.command].execute(context);
                }
            }
        } else {
            //this.parseMessage(text, client, channel, pm);
        }
    } else {
        //this.parseMessage(text, client, channel, pm);
    }
};

CommandProcessor.prototype.parseMessage = function(msg, client, channel, pm) {
    var youTubeRegEx = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
    var steamAppRegEx = /(?:store\.steampowered\.com\/app\/)([0-9]+)/gi;
    var steamPkgRegEx = /(?:store\.steampowered\.com\/sub\/)([0-9]+)/gi;

    if(msg.search(youTubeRegEx) != -1) {
        var youTubeIds = [];
        while((result = youTubeRegEx.exec(msg)) !== null) {
            youTubeIds.push(result[1]);
        }
        //TODO: better handling of maximum links.
        this.auto.youtube(youTubeIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamAppRegEx) != -1) {
        var steamIds = [];
        while((result = steamAppRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamApp(steamIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamPkgRegEx) != -1) {
        var steamIds = [];
        while((result = steamPkgRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamPkg(steamIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }
}

/**
 * Perform flood protection.
 * @param  {Object} context The IRC context that this message came from.
 * @return {Boolean}         Whether or not the message should be sent.
 */
CommandProcessor.prototype.floodProtection = function(context) {
    if((!context.pm || !(context.channel === context.client.nick)) && !context.client.isOp(context.nick)) {
        if(!context.client.chatters[context.channel]) {context.client.chatters[context.channel] = [];}
        if(context.client.chatters[context.channel][context.nick]) {
            context.client.chatters[context.channel][context.nick].floodProtect();
            //if they have been banned
            if(context.client.chatters[context.channel][context.nick].checkBan()) {
                //just end here
                return false;
            }
        } else {
            var real = true;
            if(context.nick === context.client.mcBot) {real = false;}
            context.client.chatters[context.channel][context.nick] = new Chatter(context.nick, context.client, context.channel, real);
        }
    }

    return true;
};

module.exports = CommandProcessor;