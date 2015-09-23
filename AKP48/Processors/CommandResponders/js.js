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

var Sandbox = require("sandbox");
var s = new Sandbox();
var urlRegEx = require("../../Helpers/link-regex").weburl;
var request = require('request');
var Chance = require('chance');
var path = require('path');
var fs = require('fs');

function Js(logger) {
    //the name of the command.
    this.name = "JavaScript";

    //help text to show for this command.
    this.helpText = "Runs Javascript code. If first parameter is a URL, runs code contained at that URL.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<code>";

    //ways to call this command.
    this.aliases = ['js', '>'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //the maximum size of a downloaded file.
    this.maxSize = 10485760;

    //randomizer
    this.chance = new Chance();
}

Js.prototype.execute = function(context) {
    //if no args, return false
    if(!context.arguments.length){return false};

    //if first argument is a url, attempt to download file.
    if(context.arguments[0].match(urlRegEx)) {
        var self = this;
        //HEAD request to get size.
        request({url: context.arguments[0], method: "HEAD"}, function(err, headRes) {
            var size = headRes.headers['content-length'];
            //if size is too big, return.
            if (size > this.maxSize) {
                return true;
            } else {
                //if size is okay, make actual request now.
                var filename = path.join(path.resolve('/tmp'), self.chance.word({syllables: 4})+".js");
                var file = fs.createWriteStream(filename),
                    size = 0;

                var res = request({ url: context.arguments[0] });

                res.on('data', function(data) {
                    size += data.length;

                    //if size is too big...
                    if (size > this.maxSize) {
                        res.abort(); // Abort the response (close and cleanup the stream)
                        fs.unlink(filename); // Delete the file we were downloading the data to
                        return true;
                    }
                }).pipe(file);

                res.on('end', function(){
                    self.runCode(fs.readFileSync(filename, {encoding: "utf8"}), context); //run code.
                    fs.unlink(filename); //delete file after running code.
                });
            }
        });
    } else {
        //run code in sandbox, output results.
        this.runCode(context.arguments.join(" "), context);
    }

    return true;
};

/**
 * Runs JS code in a sandbox.
 * @param  {String}  code    The code to run.
 * @param  {Context} context The context to send response to.
 */
Js.prototype.runCode = function(code, context) {
    var self = this;
    s.run(code, function(output) {
        var outputString = "";
        if(output.result) {
            outputString += output.result + "; ";
        }
        if(output.console) {
            outputString += "Console: " + JSON.stringify(output.console);
        }

        //if outputString is too long
        if(outputString.length > 350) {
            //upload Gist instead.
            context.AKP48.getAPI("Gist").create({
                description: "Output of JavaScript function for "+context.getUser().getNick(),
                files: {
                    "_input.js": {
                        "content": code
                    },
                    "result.txt": {
                        "content": JSON.stringify(output.result)
                    },
                    "console.txt": {
                        "content": JSON.stringify(output.console)
                    }
                }
            }, function(url) {
                if(!url){return;}
                context.getClient().getCommandProcessor().aliasedCommands['googl'].shortenURL(context, url);
            });
            return true;
        }
        context.getClient().say(context, outputString);
    });
};

module.exports = Js;
