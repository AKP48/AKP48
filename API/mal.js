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
var request = require('request');
var requestJSON = require('request-json');
var n = require('numeral');
var options = {
    headers: {
        'User-Agent': 'AKP48 IRC Bot (http://github.com/AKPWebDesign/AKP48)'
    }
};
var c = require('irc-colors');

function MyAnimeList(logger) {
    // Logger.
    this.log = logger.child({module: "MyAnimeList API"});
}

MyAnimeList.prototype.getInfo = function(link, callback) {
    this.log.debug({url: link}, "Getting MyAnimeList information.");

    var search = link.replace(/http:\/\//gi, "");

    //first, attempt to get info from wayback machine.
    this.log.debug({search: search}, "Figuring out where to get information from.");
    var client = requestJSON.createClient("http://archive.org/");

    var self = this;
    client.get("/wayback/available?url=" + search, function(err, res, body){
        if(err || !body.archived_snapshots.closest || !body.archived_snapshots.closest.available) {
            self.getInfoFromURL("http://webcache.googleusercontent.com/search?q=cache:" + search, "Google cache", callback); return;
        }

        self.getInfoFromURL(body.archived_snapshots.closest.url, "Wayback Machine", callback);

        return;
    });
};

MyAnimeList.prototype.getInfoFromURL = function(url, place, callback) {
    options.url = url;
    this.log.debug({url: url}, "Retrieving information from " + place + ".");

    var self = this;
    request(options, function(error, response, body) {
        if (!error && response) {
            var opts = {};
            var env = require('jsdom').env;

            env(body, function (errors, window) {
                var $ = require('./jquery')(window);

                //remove all small elements inside any sup. I don't like them.
                $("sup > small").jEach(function(i, elem) {
                    $(this).remove();
                });

                var statsBox = $("div#content > table > tbody > tr > td.borderClass > div");
                statsBox.jEach(function(i, elem) {
                    var key = $('span.dark_text', $(this)).text().trim().replace(/\:/g, "").replace(/\s/g, '_').toLowerCase();
                    if(key) {
                        $('span.dark_text', $(this)).remove();
                        if(key == "synonyms" || key == "producers" || key == "genres") {
                            var arr = $(this).text().trim().replace(/\s{2,}/g, ' ').split(', ');
                            opts[key] = arr;
                        } else {
                            opts[key] = $(this).text().trim().replace(/\s{2,}/g, ' ');
                        }
                    }
                });

                if(opts.score) {
                    opts["raw_score"] = parseFloat(opts.score.split(" ")[0]);
                    opts["score_users"] = opts.score.split(" ")[3];
                }

                self.outputString(opts, callback);
            });
        } else {
            if(response){
                self.log.error({err: error}, "[".append(response.statusCode).append("] Error: %s"), error);
                self.outputString({}, callback, "blocked");
            } else {
                self.log.error({err: error}, "Error: %s", error);
                self.outputString({}, callback, "???");
            }
        }
    });
};

MyAnimeList.prototype.outputString = function(options, callback, error) {
    var oS = c.pink("[MyAnimeList] ");

    if(!options || options.isEmpty()) {
        oS += "Sorry, but I couldn't find this one. :(";
        callback(oS);
        return;
    }

    if(error) {
        if(error == "blocked") {
            oS += "Google has blocked me from viewing this page. Sorry about that. :(";
        } else {
            oS += "Something went wrong. Sorry about that. :(";
        }

        callback(oS);
        return;
    }

    if(options.english && options.japanese) {
        oS += options.english + " (" + options.japanese + "): ";
    }

    if(options.japanese && !options.english) {
        oS += options.japanese + ": ";
    }

    if(options.english && !options.japanese) {
        oS += options.english + ": ";
    }

    if(options.type) {
        oS += c.bold("Type: ") + options.type + " · ";
    }

    if(options.episodes && options.episodes > 1) {
        oS += c.bold("Episodes: ") + n(options.episodes).format('0,0') + " · ";
    }

    if(options.duration) {
        oS += c.bold("Duration: ") + options.duration + " · ";
    }

    if(options.aired) {
        oS += c.bold("Aired: ") + options.aired + " · ";
    }

    if(options.rating) {
        var rating = options.rating.split(" ");
        oS += c.bold("Rating: ") + rating[0] + " · ";
    }

    if(options.genres) {
        if(options.genres.length == 1) {
            oS += c.bold("Genre: ") + options.genres[0] + " · ";
        } else {
            oS += c.bold("Genres: ") + options.genres.join(", ") + " · ";
        }
    }

    if(options.raw_score) {
        var color = function(score){return score};

        if (options.raw_score >= 8) {
            color = c.green;
        } else if (options.raw_score >= 6) {
            color = c.yellow;
        } else if (options.raw_score >= 4) {
            color = c.olive;
        } else if (options.raw_score >= 2) {
            color = c.maroon;
        } else { color = c.red; }


        oS += c.bold("Score: ") + color(options.raw_score);

        if(options.score_users) {
            oS += " (" + n(options.score_users).format('0,0') + " users)";
        }

        oS += " · ";
    }

    oS = oS.slice(0, -3);

    callback(oS);
};

module.exports = MyAnimeList;