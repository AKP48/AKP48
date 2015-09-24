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

XKCD.prototype.getComic = function(id, callback, context) {
    this.log.debug({comic: id}, "Getting comic from XKCD.");
    var self = this;
    this.client.get('/'+id+'/info.0.json',  function(err, res, body) {
        if(!err) {callback(self.constructComicString(body), context, false); return;}
        callback(null);
    });
};

XKCD.prototype.getLatestComic = function(callback, context) {
    this.log.debug("Getting latest comic from XKCD.");
    var self = this;
    this.client.get('/info.0.json',  function(err, res, body) {
        if(!err) {callback(self.constructComicString(body), context, true); return;}
        callback(null);
    });
}

XKCD.prototype.constructComicString = function(comic) {
    var oS = c.pink("[XKCD] ");

    oS = oS.append("\""+comic.safe_title+"\", comic number " + comic.num + ", released on ");

    oS = oS.append(comic.year+"-"+comic.month+"-"+comic.day);

    if(comic.alt) {
        var _alt = comic.alt;
        _alt = _alt.replace(/\u00e2\u0080\u0099/g, '\'');
        //this line shortens the string to the first 250 characters, but breaks on whole words.
        alt = _alt.replace(/^(.{250}[^\s]*).*/, "$1");

        //if the two aren't equal, that means we truncated something. Add an ellipsis.
        if(alt !== _alt){
            alt += "…";
        }

        oS = oS.append(" · Alt text: \""+alt+"\"");
    }

    return oS;
};

module.exports = XKCD;
// Name of this API. Will be used to reference the API from other modules.
module.exports.apiName = "XKCD";
