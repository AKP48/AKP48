var Commands = require('./commands');
var AutoResponse = require('./autoresponse');
var Chatter = require("./chatter");

function CommandProcessor() {
    this.cmd = new Commands();
    this.auto = new AutoResponse();
}

CommandProcessor.prototype.process = function(nick, channel, text, client, pm) {
    var args = [];
    var command = "";
    var nickname = "";

    var start = -1;
    var end = -1;

    //ignore ourself
    if(nick === client.nick) {return;}

    if(nick === client.mcBot) {

        //find user name
        start = text.indexOf('(');
        end = text.indexOf(')');
        nickname = text.substring(start + 1, end);

        //trim text down to remove username
        text = text.substring(end+2);
    } else {
        nickname = nick;
    }

    if(channel === client.nick) {
        channel = nick;
    }

    //if we have a command
    if(text.substring(0, client.delimiter.length) === client.delimiter) {

        //find command
        end = text.indexOf(' ');
        command = text.substring(client.delimiter.length,end);

        //if there wasn't actually a space, we won't have gotten a command.
        //instead, we'll just chop off the first two characters now.
        if(end === -1) {
            command = text.substring(client.delimiter.length, text.length).toLowerCase();
        } else {
            //otherwise, we can cut off the command and save the arguments.
            args = text.substring(end+1).split(' ');
        }

        if(typeof this.cmd[command] === 'function') {
            if(!client.isBanned(nickname)) {
                // Flood protection
                if((!pm || !(channel === client.nick)) && !client.isOp(nickname)) {
                    if(!client.chatters[channel]) {client.chatters[channel] = [];}
                    if(client.chatters[channel][nickname]) {
                        client.chatters[channel][nickname].floodProtect();
                        //if they have been banned
                        if(client.chatters[channel][nickname].checkBan()) {
                            //just end here
                            return;
                        }
                    } else {
                        var real = true;
                        if(nick === client.mcBot) {real = false;}
                        client.chatters[channel][nickname] = new Chatter(nickname, client, channel, real);
                    }
                }

                this.cmd[command](nickname, args, client, channel, client.isOp(nickname), pm);
            }
        } else {
            this.parseMessage(text, client, channel, pm);
        }
    } else {
        this.parseMessage(text, client, channel, pm);
    }
};

CommandProcessor.prototype.parseMessage = function(msg, client, channel, pm) {
    var youTubeRegEx = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;
    var steamAppRegEx = /(?:.+)?(?:store\.steampowered\.com\/app\/)([0-9]+)(?:.+)?/gi;
    var steamPkgRegEx = /(?:.+)?(?:store\.steampowered\.com\/sub\/)([0-9]+)(?:.+)?/gi;

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
        var steamId = msg.replace(steamAppRegEx, "$1");
        this.auto.steamApp(steamId, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }

    if(msg.search(steamPkgRegEx) != -1) {
        var steamId = msg.replace(steamPkgRegEx, "$1");
        this.auto.steamPkg(steamId, function(res) {
            client.getIRCClient().say(channel, res);
        });
    }
}

module.exports = CommandProcessor;