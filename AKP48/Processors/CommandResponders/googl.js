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

function Googl(logger) {
    //the name of the command.
    this.name = "Goo.gl Link Shortener";

    //help text to show for this command.
    this.helpText = "Shortens a link using the Goo.gl API.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<link>";

    //ways to call this command.
    this.aliases = ['googl'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Googl.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}
    var self = this;
    var cachedResponse = context.AKP48.cache.getCached(("Googl"+context.arguments[0]).sha1());
    if(cachedResponse) {
        context.AKP48.say(context.channel, cachedResponse);
        return true;
    }
    context.AKP48.getAPI("Google").shorten_url(context.arguments[0], function(url) {
        var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
        context.AKP48.cache.addToCache(("Googl"+context.arguments[0]).sha1(), url, cacheExpire);
        context.AKP48.say(context.channel, url);
    });
    return true;
};

Googl.prototype.shortenURL = function(context, url) {
    var self = this;
    var cachedResponse = context.AKP48.cache.getCached(("Googl"+url).sha1());
    if(cachedResponse) {
        context.AKP48.say(context.channel, cachedResponse);
        return true;
    }
    context.AKP48.getAPI("Google").shorten_url(url, function(url) {
        var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
        context.AKP48.cache.addToCache(("Googl"+url).sha1(), url, cacheExpire);
        context.AKP48.say(context.channel, url);
    });
};

module.exports = Googl;