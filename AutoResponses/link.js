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
var c = require('irc-colors');

function LinkHandler() {
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

    //Google API module.
    this.google = new Google(config.google.apiKey);

    //Steam API module.
    this.steam = new Steam();

    //Imgur API module.
    this.imgur = new Imgur(config.imgur.clientID);
}

// TODO: cache responses
LinkHandler.prototype.execute = function(word, context) {
    if(this.youTubeRegex.test(word)) {
        return this.YouTubeVideo(word, context);
    }

    if(this.steamPkgRegex.test(word)) {
        return this.SteamPackage(word, context);
    }

    if(this.steamAppRegex.test(word)) {
        return this.SteamApp(word, context);
    }

    if(this.twitterRegex.test(word)) {
        return this.Twitter(word, context);
    }

    if(this.imgurRegex.test(word)) {
        return this.ImgurLink(word, context);
    }

    if(!/noinfo/i.test(word)) {
        //libraries to fetch and parse page.
        var request = require('request');
        var cheerio = require('cheerio');


        var self = {};
        self.word = word;
        request({
          uri: word,
        }, function(error, response, body) {
          if (!error && response.statusCode == 200) {
              var $ = cheerio.load(body);
              if($("title").text()) {
                var oS = c.pink("[Link] ").append(self.word).append(" -> \"");
                oS += $("title").text().replace(/\r?\n/gm, "").trim().replace(/\s{2,}/g, ' ').append("\"");
                context.getClient().getIRCClient().say(context.getChannel().getName(), oS);
              } else {
                  // TODO: make function for this...
                  context.getClient().alert.each(function (channel) {
                      context.getClient().getIRCClient().say(channel, "Title unavailable for " + word);
                  });
              }
          } else {
              // TODO: make function for this...
              context.getClient().alert.each(function (channel) {
                  context.getClient().getIRCClient().say(channel, "[".append(response.statusCode).append("] Error: ").append(error));
              });
          }
        });
    }
};

LinkHandler.prototype.YouTubeVideo = function(link, context) {
    var id = this.youTubeRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    if(id != null && noshow == null) {
        this.google.youtube_video_info(id[1], function(res){
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        });
    }
};

LinkHandler.prototype.SteamPackage = function(link, context) {
    var id = this.steamPkgRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var nohist = /nohist/i.exec(link);
    if(id != null && noshow == null) {
        this.steam.getPkg(id[1], function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        }, ((nohist != null) ? true : false));
    }
};

LinkHandler.prototype.SteamApp = function(link, context) {
    var id = this.steamAppRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var nohist = /nohist/i.exec(link);
    if(id != null && noshow == null) {
        this.steam.getGame(id[1], function(res) {
            context.getClient().getIRCClient().say(context.getChannel().getName(), res);
        }, ((nohist != null) ? true : false));
    }
};

LinkHandler.prototype.Twitter = function(link, context) {
    //Don't do anything for now. Simply ignore Twitter links.
}

LinkHandler.prototype.ImgurLink = function(link, context) {
    var id = this.imgurRegex.exec(link);
    var noshow = /noinfo/i.exec(link);
    var self = this;
    if(id != null && noshow == null) {
        //id[1] == direct image.
        if(id[1]) {
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
                    if(info[0] == "gallery") {
                        this.imgur.getGalleryInfo(info[1], function(image) {
                            if(image) {
                                context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                            }
                        });
                    }

                    if(info[0] == "a") {
                        this.imgur.getAlbumInfo(info[1], function(image) {
                            if(image) {
                                context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                            }
                        });
                    }
                } else {
                    //if info is only one part, we know it has to be a direct image.
                    this.imgur.getImageInfo(info[0], function(image) {
                        if(image) {
                            context.getClient().getIRCClient().say(context.getChannel().getName(), self.constructImgurString(image));
                        }
                    });
                }
            }
        }
    }
};

LinkHandler.prototype.constructImgurString = function(image) {
    //set up prefix
    var type = "[Imgur ";
    if(image.is_gallery) {type += "Gallery ";}
    if(image.is_album) {type += "Album] ";} else {type += "Image] ";}

    var oS = c.pink(type);
    if(image.title) { oS += "Title: \"" + image.title + "\"" + " | ";}
    if(image.width && image.height) {oS += "Dimensions: " + image.width + "px x " + image.height + "px | ";}
    if(image.type) {oS += "Type: " + image.type + " | ";}
    if(image.size) {oS += "File Size: " + image.size + " | ";}
    if(image.nsfw) {oS += c.red("NSFW") + " | ";}
    if(image.views) {oS += "Views: " + image.views + " | ";}
    if(image.ups) {oS += c.green("Upvotes: " + image.ups) + " | ";}
    if(image.downs) {oS += c.red("Downvotes: " + image.downs) + " | ";}
    if(image.score && image.raw_score) {
        if(image.raw_score > 0) {
            oS += c.green("Score: " + image.score) + " | ";
        } else {
            oS += c.red("Score: " + image.score) + " | ";
        }
    }
    if(image.comment_count) {oS += image.comment_count + " Comments | ";}
    if(image.images_count) {oS += image.images_count + " Images | ";}
    if(image.datetime || image.account_url) {
        oS += "Uploaded ";
        if(image.datetime) {oS += image.datetime;}
        if(image.account_url) {oS += " by " + image.account_url;}
        oS += ".";
    }

    return oS;
};

module.exports = LinkHandler;
