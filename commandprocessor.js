var Commands = require('./Commands');
var AutoResponse = require('./autoresponse');
var Chatter = require("./chatter");

function CommandProcessor() {
    this.auto = new AutoResponse();

    //command list for help purposes, leaves out aliases.
    this.commands = require('./Commands');

    //full command list with aliases included.
    this.aliasedCommands = {};
    this.initCommandAliases();
}

CommandProcessor.prototype.initCommandAliases = function() {
    //loop to remove modules without fulfilled dependencies.
    for (var property in this.commands) {
        if (this.commands.hasOwnProperty(property)) {
            //if dependencies are defined
            if(this.commands[property] !== undefined && this.commands[property].dependencies !== undefined) {
                //for each dependency
                for (var i = 0; i < this.commands[property].dependencies.length; i++) {
                    //if dependency doesn't exist
                    if(this.commands[this.commands[property].dependencies[i]] === undefined) {
                        //disable it.
                        console.log(property + "module does not have all required dependencies! Disabling " + property + " module!");
                        delete this.commands[property];
                        break;
                    }
                };
            }
        }
    }

    //loop to put in aliases
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

    //the original message
    context.originalMessage = text;

    //these help in our string parsing.
    var start = -1;
    var end = -1;

    //ignore ourself
    if(nick === client.nick) {return;}

    //if the message came from our minecraft bot...
    if(nick === client.mcBot) {

        //save into context
        context.isMcBot = true;

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

    //parse the message for auto response system
    this.parseMessage(context.originalMessage, context.client, context.channel, context.isPm);

    //if we have a command
    if(text.substring(0, client.delimiter.length) === client.delimiter) {

        //create blank arguments
        context.arguments = [];

        //find command
        end = text.indexOf(' ');
        context.command = text.substring(client.delimiter.length,end);

        //if there wasn't actually a space, we won't have gotten a command.
        //instead, we'll just chop off the delimiter now.
        if(end === -1) {
            context.command = text.substring(client.delimiter.length, text.length);
        } else {
            //otherwise, we can cut off the command and save the arguments.
            context.arguments = text.substring(end+1).split(' ');

            //remove any blank arguments
            var i;
            while((i = context.arguments.indexOf('')) !== -1) {
                context.arguments.splice(i, 1);
            }
        }

        //lowercase the command
        context.command = context.command.toLowerCase();

        //put commands into context.
        context.commands = this.aliasedCommands;

        //if the command exists
        if(this.aliasedCommands[context.command] !== undefined) {
            if(typeof this.aliasedCommands[context.command].execute === 'function') {

                //easier access
                var command = this.aliasedCommands[context.command];

                //flood protection
                if(!client.isBanned(context.nick)) {

                    //return if this needs to be a privmsg and isn't.
                    if(command.isPmOnly && !context.isPm) {
                        return;
                    }

                    //return if this needs to be run by an OP and we aren't one.
                    if(command.requireOP && !context.client.isOp(context.nick)) {
                        return;
                    }

                    //return if command is not allowed as a privmsg and this is one (unless we're op.)
                    if(!command.allowPm && context.isPm && !context.client.isOp(context.nick)) {
                        return;
                    }

                    //do flood protection/execute the command if we haven't returned by now.
                    if(this.floodProtection(context)) {
                        if(!command.execute(context)) {
                            this.sendUsageMessage(context, command);
                        }
                    }
                }
            }
        }
    }
};

CommandProcessor.prototype.parseMessage = function(msg, client, channel, pm) {
    var youTubeRegEx = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
    var steamAppRegEx = /(?:store\.steampowered\.com\/app\/)([0-9]+)/gi;
    var steamPkgRegEx = /(?:store\.steampowered\.com\/sub\/)([0-9]+)/gi;

    if(msg.search(youTubeRegEx) != -1) {
        var youTubeIds = [];
        var result = [];
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
        var result = [];
        while((result = steamAppRegEx.exec(msg)) !== null) {
            steamIds.push(result[1]);
        }
        this.auto.steamApp(steamIds, 3, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamPkgRegEx) != -1) {
        var steamIds = [];
        var result = [];
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
            if(context.isMcBot) {real = false;}
            context.client.chatters[context.channel][context.nick] = new Chatter(context, real);
        }
    }

    return true;
};

CommandProcessor.prototype.sendUsageMessage = function(context, command) {
    if(!context.isMcBot) {
        context.channel = context.nick;
    }
    context.client.say(context, context.client.delimiter + context.command + " " + command.usageText);
};

module.exports = CommandProcessor;