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

function Help(logger) {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[command]";

    //ways to call this command.
    this.aliases = ['help', 'halp'];
}

Help.prototype.execute = function(context) {
    var commandText = "";
    var sendTo = "";
    if(context.arguments.length) {
        commandText = context.arguments[0];
        if(commandText.startsWith(context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0])) {
            commandText = commandText.substring(context.AKP48.configManager.getChannelConfig()[context.channel].commandDelimiters[0].length, commandText.length);
        }
    }
    var markdown = "";
    //for each command
    context.commands.each(function (command) {
            //to tell us whether or not to send this message.
            var send = true;

            //if we need to check the power level...
            if(command.powerLevel) {
                //if user doesn't have permission to see the command, don't send the command.
                if(!context.AKP48.configManager.hasPermission(context, command.powerLevel)) {
                    send = false;
                }
            }

            if(send) {
                markdown += "##" + command.name + "  \n";
                markdown += "*" + command.helpText + "*  \n";

                var chanConfig = context.AKP48.configManager.getChannelConfig();
                var commandDelimiter = ((chanConfig[context.channel] && chanConfig[context.channel].commandDelimiters) ?
                                                            chanConfig[context.channel].commandDelimiters[0] : ".");

                markdown += "**Usage:** " + commandDelimiter + command.aliases[0] +
                            " " + command.usageText.replace(/</, "&lt;").replace(/>/, "&gt;").replace(/\r?\n/, " | ") + "  \n";

                if(command.aliases.length > 1) {
                    markdown += "**Aliases:** ";
                    for (var i = 0; i < command.aliases.length; i++) {
                        if(command.aliases[i] == commandText) {
                            sendTo = command.name;
                        }
                        if(i != 0) {
                            markdown += command.aliases[i] + ", ";
                        }
                    };
                    markdown = markdown.slice(0, -2);
                    markdown += "  \n";
                } else {
                    if(command.aliases[0] == commandText) {
                        sendTo = command.name;
                    }
                }
            }
    });

    var self = this;
    var cachedResponse = context.AKP48.cache.getCached(("GistMarkdown"+markdown).sha1());
    if(cachedResponse) {
        if(context.isBot) {
            context.AKP48.client.say(context.channel, cachedResponse);
        } else {
            context.AKP48.client.notice(context.nick, cachedResponse);
        }
        return true;
    }

    //create gist of response
    context.AKP48.getAPI("Gist").create({
        description: "Help for " + context.AKP48.client.nick,
        files: {
            "help.md": {
                "content": markdown
            }
        }
    }, function(url) {
        if(!url){return;}
        if(sendTo) {
            url += "#" + encodeURI(sendTo.toLowerCase().replace(/\s/g, "-"));
        }
        context.AKP48.getAPI("Google").shorten_url(url, function(uri) {
            if(!uri) {uri = url};
            var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
            context.AKP48.cache.addToCache(("GistMarkdown"+markdown).sha1(), uri, cacheExpire);
            if(context.isBot) {
                context.AKP48.client.say(context.channel, uri);
            } else {
                context.AKP48.client.notice(context.nick, uri);
            }
        });
    });

    return true;
};

module.exports = Help;
