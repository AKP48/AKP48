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

var c = require('irc-colors');

function LinkHandler(logger) {
    //the name of the handler.
    this.name = "Link Handler";

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

    //logger
    this.log = logger;
}

// TODO: cache responses
LinkHandler.prototype.execute = function(word, context) {
    if(/noinfo/i.exec(word)) {
        return this.log.debug("Ignoring link due to noinfo parameter.");
    }

    this.log.debug({url: word}, "Routing link.");
    var cachedResponse = getClientManager().getCache().getCached(word.sha1());
    if(cachedResponse) {
        this.log.debug({url: word, response: cached}, "Sending response from cache.");
        context.getClient().getIRCClient().say(context.getChannel(), cachedResponse);
        return true;
    }

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

    var cached = false;

    //todo: cachedRegex.
    // if(this.cachedRegex.test(word)) {
    //     cached = true;
    // }

    return this.handleLink(word, cached, context);
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
    self.cache = this.cache;

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
                var cacheExpire = (Date.now() / 1000 | 0) + 600; //make cache expire in 10 minutes
                getClientManager().getCache().addToCache(link.sha1(), oS, cacheExpire);
                context.getClient().getIRCClient().say(context.getChannel(), oS);
            } else {
                self.log.error({res: response}, "Title unavailable for " + self.link);
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
    var self = this;
    if(id != null) {
        getClientManager().getAPI("Google").youtube_video_info(id[1], function(res){
            var cacheExpire = (Date.now() / 1000 | 0) + 86400; //make cache expire in 1 day
            getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
            context.getClient().getIRCClient().say(context.getChannel(), res);
        });
    } else {
        this.log.debug({reason: "No YouTube video ID was found."}, "Ignoring link.");
    }
};

LinkHandler.prototype.SteamPackage = function(link, context) {
    this.log.debug("Handling as Steam package.");
    var id = this.steamPkgRegex.exec(link);
    var nohist = /nohist/i.exec(link);
    var allstores = /allstores/i.exec(link);
    var self = this;
    if(id != null) {
        getClientManager().getAPI("Steam").getPkg(id[1], function(res) {
            var cacheExpire = (Date.now() / 1000 | 0) + 86400; //make cache expire in 1 day
            getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
            context.getClient().getIRCClient().say(context.getChannel(), res);
        }, nohist, allstores);
    } else {
        this.log.debug({reason: "No Steam package ID was found."}, "Ignoring link.");
    }
};

LinkHandler.prototype.SteamApp = function(link, context) {
    this.log.debug("Handling as Steam app.");
    var id = this.steamAppRegex.exec(link);
    var nohist = /nohist/i.exec(link);
    var allstores = /allstores/i.exec(link);
    var self = this;
    if(id != null) {
        getClientManager().getAPI("Steam").getGame(id[1], function(res) {
            var cacheExpire = (Date.now() / 1000 | 0) + 86400; //make cache expire in 1 day
            getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        }, nohist, allstores);
    } else {
        this.log.debug({reason: "No Steam app ID was found."}, "Ignoring link.");
    }
};

LinkHandler.prototype.Twitter = function(link, context) {
    //Don't do anything for now. Simply ignore Twitter links.
    this.log.debug({reason: "Twitter"}, "Ignoring link.");
}

LinkHandler.prototype.ImgurLink = function(link, context) {
    this.log.debug("Handling as imgur link.");
    var id = this.imgurRegex.exec(link);
    var self = this;
    var cacheExpire = (Date.now() / 1000 | 0) + 21600; //make cache expire in 6 hours
    if(id != null) {
        //id[1] == direct image.
        if(id[1]) {
            this.log.debug("Handling as direct image.");
            getClientManager().getAPI("Imgur").getImageInfo(id[1], function(image) {
                if(image) {
                    getClientManager().getCache().addToCache(link.sha1(), self.constructImgurString(image), cacheExpire);
                    context.getClient().getIRCClient().say(context.getChannel(), self.constructImgurString(image));
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
                        getClientManager().getAPI("Imgur").getGalleryInfo(info[1], function(image) {
                            if(image) {
                                getClientManager().getCache().addToCache(link.sha1(), self.constructImgurString(image), cacheExpire);
                                context.getClient().getIRCClient().say(context.getChannel(), self.constructImgurString(image));
                            }
                        });
                    }

                    if(info[0] == "a") {
                        this.log.debug("Handling as album.");
                        getClientManager().getAPI("Imgur").getAlbumInfo(info[1], function(image) {
                            if(image) {
                                getClientManager().getCache().addToCache(link.sha1(), self.constructImgurString(image), cacheExpire);
                                context.getClient().getIRCClient().say(context.getChannel(), self.constructImgurString(image));
                            }
                        });
                    }

                    if(info[0] == "r") {
                        this.log.debug("Handling as subreddit image.");
                        getClientManager().getAPI("Imgur").getSubredditInfo(info[2], info[1], function(image) {
                            if(image) {
                                getClientManager().getCache().addToCache(link.sha1(), self.constructImgurString(image), cacheExpire);
                                context.getClient().getIRCClient().say(context.getChannel(), self.constructImgurString(image));
                            }
                        });
                    }
                } else {
                    //if info is only one part, we know it has to be a direct image.
                    this.log.debug("Handling as direct image.");
                    getClientManager().getAPI("Imgur").getImageInfo(info[0], function(image) {
                        if(image) {
                            getClientManager().getCache().addToCache(link.sha1(), self.constructImgurString(image), cacheExpire);
                            context.getClient().getIRCClient().say(context.getChannel(), self.constructImgurString(image));
                        }
                    });
                }
            }
        }
    } else {
        this.log.debug({reason: "No imgur ID was found."}, "Ignoring link.");
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
    var self = this;
    if(id != null) {
        getClientManager().getAPI("XKCD").getComic(id[1], function(res){
            if(res){
                var cacheExpire = (Date.now() / 1000 | 0) + 1576800000; //make cache expire in 50 years
                getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
                context.getClient().getIRCClient().say(context.getChannel(), res);
            }
        });
    } else {
        if(this.XKCDRegex.homepage.exec(link) != null) {
            getClientManager().getAPI("XKCD").getLatestComic(function(res){
                if(res) {
                    var cacheExpire = (Date.now() / 1000 | 0) + 21600; //make cache expire in 6 hours
                    getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
                    context.getClient().getIRCClient().say(context.getChannel(), res);
                }
            });
        }
    }
};

LinkHandler.prototype.MALLink = function(link, context) {
    var self = this;
    getClientManager().getAPI("MAL").getInfo(link, function(res){
        var cacheExpire = (Date.now() / 1000 | 0) + 21600; //make cache expire in 6 hours
        getClientManager().getCache().addToCache(link.sha1(), res, cacheExpire);
        context.getClient().getIRCClient().say(context.getChannel(), res);
    });
}

module.exports = LinkHandler;
