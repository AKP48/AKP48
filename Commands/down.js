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

function Down() {
    //the name of the command.
    this.name = "Down For Everyone?";

    //help text to show for this command.
    this.helpText = "Checks if a website appears to be down. Example: 'down google.com'";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<website> [port]";

    //ways to call this command.
    this.aliases = ['down', 'isup'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Down.prototype.execute = function(context) {
    if(!context.arguments.length){return false;}

    var host = context.arguments[0];
    var port = 80;
    var path = '/';
    var urlRegEx = /^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6})(.+)*\/?$/gi;
    var result = [];

    if((result = urlRegEx.exec(context.arguments[0])) !== null) {
        host = result[2];
        if(result[1] == "https://") {
            context.getClient().say(context, "I can't do secure sites (https://), but I'll try to access the site normally for you.");
        }
    }

    if(!result) {return false;}

    if(context.arguments[1]) {
        if(+context.arguments[1] <= 65536){
            port = +context.arguments[1];
        }
    }

    var http = require('http');
    var options = {method: 'HEAD', host: host, port: port, path: path};
    var req = http.request(options, function(res) {
        context.getClient().say(context, host + " seems up to me.")
      }
    );

    if(port != 80) {host = host+":"+port;}

    req.on('socket', function (socket) {
        myTimeout = 1500; // millis
        socket.setTimeout(myTimeout);
        socket.on('timeout', function() {
            req.abort();
        });
    });

    req.on('error', function(err) {
        console.log(err);
        switch(err.code) {
            case 'ENOTFOUND':
                context.getClient().say(context, "I couldn't find "+host+".");
                break;
            case 'ECONNREFUSED':
                context.getClient().say(context, host+" refused my connection.");
                break;
            case 'ETIMEDOUT':
                context.getClient().say(context, "My connection to "+host+" timed out.");
                break;
            case 'ECONNRESET':
                context.getClient().say(context, "Either my connection to "+host+" was reset, or that site took too long to respond. I'd say it's probably down.");
                break;
            default:
                context.getClient().say(context, "I had trouble visiting "+host+", but I'm not sure why.");
                break;
        }
    });
    req.end();
    return true;
};

module.exports = Down;