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
var request = require('request-json');
var c = require('irc-colors');

function XKCD(logger) {
    // XKCD client.
    this.client = request.createClient('https://xkcd.com/');

    // Logger.
    this.log = logger.child({module: "XKCD API"});
}

XKCD.prototype.getComic = function(id, callback) {
    this.log.debug({comic: id}, "Getting comic from XKCD.");
    var self = this;
    this.client.get('/'+id+'/info.0.json',  function(err, res, body) {
        if(!err) {callback(self.constructComicString(body)); return;}
        callback(null);
    });
};

XKCD.prototype.getLatestComic = function(callback) {
    this.log.debug("Getting latest comic from XKCD.");
    var self = this;
    this.client.get('/info.0.json',  function(err, res, body) {
        if(!err) {callback(self.constructComicString(body)); return;}
        callback(null);
    });
}

XKCD.prototype.constructComicString = function(comic) {
    var oS = c.pink("[XKCD] ");

    oS = oS.append("\""+comic.safe_title+"\", comic number " + comic.num + ", released on ");

    oS = oS.append(comic.year+"-"+comic.month+"-"+comic.day);

    if(comic.alt) {oS = oS.append(" | Alt text: \""+comic.alt+"\"");}

    return oS;
};

module.exports = XKCD;
