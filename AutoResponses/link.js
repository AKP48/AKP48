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

var config = require('../config.json');
var Google = require('../API/google');
var Steam = require('../API/steam');
var Imgur = require('../API/imgur');
var XKCDApi = require('../API/xkcd');
var MALApi = require('../API/mal');
var c = require('irc-colors');

function LinkHandler(logger) {
    //the name of the handler.
    this.name = "Link Handler";

    //name of the permission needed to use this handler. All users have 'user.handler.use' by default. Banned users have 'user.handler.banned' by default.
    this.permissionName = 'user.handler.use';

    //whether or not to allow this handler in a private message.
    this.allowPm = true;

    //the regex used to match this handler
    this.regex = require("../Regex/regex-weburl");

    //YouTube video regex
    this.youTubeRegex = require("../Regex/regex-youtube");

    //Steam app regex
    this.steamAppRegex = require("../Regex/regex-steamapp");

    //Steam pkg regex
    this.steamPkgRegex = require("../Regex/regex-steampkg");

    //Twitter regex
    this.twitterRegex = require("../Regex/regex-twitter");

    //Imgur regex
    this.imgurRegex = require("../Regex/regex-imgur");

    //XKCD regex
    this.XKCDRegex = require("../Regex/regex-xkcd");

    //MAL regex
    this.MALRegex = require("../Regex/regex-mal");

    //Google API module.
    this.google = new Google(config.google.apiKey, logger);

    //Steam API module.
    this.steam = new Steam(logger);

    //Imgur API module.
    this.imgur = new Imgur(config.imgur.clientID, logger);

    //XKCD API module.
    this.XKCD = new XKCDApi(logger);

    //MAL API module.
    this.MAL = new MALApi(logger);

    //logger
    this.log = logger;
}

// TODO: cache responses
LinkHandler.prototype.execute = function(word, context) {
    this.log.debug({url: word}, "Routing link.");
    if(this.youTubeRegex.test(word)) {
        return this.YouTubeVideo(word, context);
    }

    if(this.steamPkgRegex.test(word)) {
        return this.SteamPackage(word, context);
    }

    if(this.steamAppRegex.test(word)) {
        return this.SteamApp(word, context);
    }

    if(false && this.twitterRegex.test(word)) {
        return this.Twitter(word, context);
    }

    if(this.imgurRegex.test(word)) {
        return this.ImgurLink(word, context);
    }

    if(this.XKCDRegex.all.test(word)) {
        return this.XKCDLink(word, context);
    }

    if(this.MALRegex.test(word)) {
        return this.MALLink(word, context);
    }

    if(!/noinfo/i.test(word)) {
        var cached = false;

        //todo: cachedRegex.
        // if(this.cachedRegex.test(word)) {
        //     cached = true;
        // }

        return this.handleLink(word, cached, context);

    } else {
        this.log.debug("Ignoring link due to noinfo parameter.");
    }
};

LinkHandler.prototype.handleLink = function(link, cached, context) {
    this.log.debug({url: link, cached: cached}, "Handling link.");
    var original = link;
    var search = "";

    if(cached) {
        search = link.replace(/http:\/\//gi, "");
        link = "http://webcache.googleusercontent.com/search?q=cache:<search>".replace(/<search>/g, search);
    }

    var self = {};
    self.link = link;
    self.log = this.log;

    var request = require('request');
    var cheerio = require('cheerio');
    var options = {
        url: link,
        headers: {
            'User-Agent': 'AKP48 IRC Bot (http://github.com/AKPWebDesign/AKP48)'
        }
    };

    request(options, function(error, response, body) {
        if (!error && response && response.statusCode == 200) {
            var type = response.headers['content-type'];
            if (!type.contains("text/html") && !type.contains("text/xml")) {
                return;
            }
            var $ = cheerio.load(body);
            if($("title").text()) {
                var oS = c.pink("[Link] ");
                if(cached) {
                    oS += original.append(" -> \"");
                } else {
                    oS += self.link.append(" -> \"");
                }
                oS += $("title").text().replace(/\r?\n/gm, "").trim().replace(/\s{2,}/g, ' ').append("\"");
                context.getClient().getIRCClient().say(context.getChannel().getName(), oS);
            } else {
                self.log.error({res: response}, "Title unavailable for " + word);
            }
        } else {
            if(response){
                self.log.error({err: error, res: response}, "[".append(response.statusCode).append("] Error: %s"), error);
            } else {
                self.log.error({err: error}, "Error: %s", error);
            }
        }
    });
};

LinkHandler.prototype.YouTubeVideo = function(link, context) {
    this.log.debug("Handling as YouTube video.");
    var id = this.youTubeRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    if(id != null && noshow == null) {
        this.google.youtube_video_info(id[1], function(res){
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        });
    } else {
        this.log.debug({reason: "Either no YouTube video ID was found, or the noinfo parameter was included."}, "Ignoring link.");
    }
};

LinkHandler.prototype.SteamPackage = function(link, context) {
    this.log.debug("Handling as Steam package.");
    var id = this.steamPkgRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var nohist = /nohist/i.exec(link);
    var allstores = /allstores/i.exec(link);
    if(id != null && noshow == null) {
        this.steam.getPkg(id[1], function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        }, nohist, allstores);
    } else {
        this.log.debug({reason: "Either no Steam package ID was found, or noinfo parameter was included."}, "Ignoring link.");
    }
};

LinkHandler.prototype.SteamApp = function(link, context) {
    this.log.debug("Handling as Steam app.");
    var id = this.steamAppRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var nohist = /nohist/i.exec(link);
    var allstores = /allstores/i.exec(link);
    if(id != null && noshow == null) {
        this.steam.getGame(id[1], function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        }, nohist, allstores);
    } else {
        this.log.debug({reason: "Either no Steam app ID was found, or noinfo parameter was included."}, "Ignoring link.");
    }
};

LinkHandler.prototype.Twitter = function(link, context) {
    //Don't do anything for now. Simply ignore Twitter links.
    this.log.debug({reason: "Twitter"}, "Ignoring link.");
}

LinkHandler.prototype.ImgurLink = function(link, context) {
    this.log.debug("Handling as imgur link.");
    var id = this.imgurRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var self = this;
    if(id != null && noshow == null) {
        //id[1] == direct image.
        if(id[1]) {
            this.log.debug("Handling as direct image.");
            this.imgur.getImageInfo(id[1], function(image) {
                if(image) {
                    context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                }
            });
        } else {
            //id[2] == gallery, album, or direct image.
            if(id[2]) { //sanity check
                var info = id[2].split('/');
                //if info is more than one part, we know it is either a gallery link or an album.
                if(info.length > 1) {
                    //gallery image
                    this.log.debug("Handling as gallery image.");
                    if(info[0] == "gallery") {
                        this.imgur.getGalleryInfo(info[1], function(image) {
                            if(image) {
                                context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                            }
                        });
                    }

                    if(info[0] == "a") {
                        this.log.debug("Handling as album.");
                        this.imgur.getAlbumInfo(info[1], function(image) {
                            if(image) {
                                context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                            }
                        });
                    }
                } else {
                    //if info is only one part, we know it has to be a direct image.
                    this.log.debug("Handling as direct image.");
                    this.imgur.getImageInfo(info[0], function(image) {
                        if(image) {
                            context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                        }
                    });
                }
            }
        }
    } else {
        this.log.debug({reason: "Either no imgur ID was found, or noinfo parameter was included."}, "Ignoring link.");
    }
};

LinkHandler.prototype.constructImgurString = function(image) {
    this.log.trace({img: image}, "Constructing imgur output string.");
    //set up prefix
    var type = "[Imgur ";
    if(image.is_gallery) {type += "Gallery ";}
    if(image.is_album) {type += "Album] ";} else {type += "Image] ";}

    var oS = c.pink(type);
    if(image.title) { oS += "Title: \"" + image.title + "\"" + " · ";}
    if(image.width && image.height) {oS += "Dimensions: " + image.width + "px x " + image.height + "px · ";}
    if(image.type) {oS += "Type: " + image.type + " · ";}
    if(image.size) {oS += "File Size: " + image.size + " · ";}
    if(image.nsfw) {oS += c.red("NSFW") + " · ";}
    if(image.views) {oS += "Views: " + image.views + " · ";}
    if(image.ups) {oS += c.green("Upvotes: " + image.ups) + " · ";}
    if(image.downs) {oS += c.red("Downvotes: " + image.downs) + " · ";}
    if(image.score && image.raw_score) {
        if(image.raw_score > 0) {
            oS += c.green("Score: " + image.score) + " · ";
        } else {
            oS += c.red("Score: " + image.score) + " · ";
        }
    }
    if(image.comment_count) {oS += image.comment_count + " Comments · ";}
    if(image.images_count) {oS += image.images_count + " Images · ";}
    if(image.datetime || image.account_url) {
        oS += "Uploaded ";
        if(image.datetime) {oS += image.datetime;}
        if(image.account_url) {oS += " by " + image.account_url;}
        oS += ".";
    }

    return oS;
};

LinkHandler.prototype.XKCDLink = function(link, context) {
    this.log.debug("Handling as XKCD link.");
    var id = this.XKCDRegex.comic.exec(link);
    var noshow = /noinfo/i.exec(link);
    if(id != null) {
        if(noshow == null) {
            this.XKCD.getComic(id[1], function(res){
                if(res){
                    context.getClient().getIRCClient().say(context.getChannel().getName(), res);
                }
            });
        } else {
            this.log.debug({reason: "The noinfo parameter was included."}, "Ignoring link.");
        }
    } else {
        if(this.XKCDRegex.homepage.exec(link) != null) {
            this.XKCD.getLatestComic(function(res){
                if(res) {
                    context.getClient().getIRCClient().say(context.getChannel().getName(), res);
                }
            });
        }
    }
};

LinkHandler.prototype.MALLink = function(link, context) {
    this.MAL.getInfo(link, function(res){
        context.getClient().getIRCClient().say(context.getChannel().getName(), res);
    });
}

module.exports = LinkHandler;
