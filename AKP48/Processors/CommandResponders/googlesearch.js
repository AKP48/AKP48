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

function GoogleSearch(logger) {
    //the name of the command.
    this.name = "Google Search";

    //help text to show for this command.
    this.helpText = "Returns the first result of a Google search.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<query>";

    //ways to call this command.
    this.aliases = ['g', 'googlesearch', 'google', 'search', 'askjeeves', 'askgamingg'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

GoogleSearch.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}
    var self = this;
    var cachedResponse = context.AKP48.cache.getCached(("GoogleSearch"+context.arguments.join(" ")).sha1());
    if(cachedResponse) {
        context.AKP48.say(context.channel, cachedResponse);
        return true;
    }
    context.AKP48.getAPI("Google").search(context.arguments.join(" "), "web", function(msg) {
        var cacheExpire = (Date.now() / 1000 | 0) + 86400; //make cache expire in 1 day
        context.AKP48.cache.addToCache(("GoogleSearch"+context.arguments.join(" ")).sha1(), msg, cacheExpire);
        context.AKP48.say(context.channel, msg);
    });
    return true;
};

module.exports = GoogleSearch;