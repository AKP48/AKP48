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

var path = require('path');
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'AKP48 Steam API Module',
    streams: [{
        type: 'rotating-file',
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    },
    {
        stream: process.stdout
    }]
});

var request = require('request-json');
var c = require('irc-colors');
var n = require('numeral');
var Google = require("./google");
var config = require('../config.json');

function Steam() {
    this.client = request.createClient('https://store.steampowered.com/');
    this.enhancedSteamAPI = request.createClient('http://api.enhancedsteam.com/');
    this.google = new Google(config.google.apiKey);
}

Steam.prototype.getGame = function(appId, callback, nohist) {

    var self = {};
    self.appId = appId;
    self.callback = callback;
    self.enhancedSteamAPI = this.enhancedSteamAPI;
    self.google = this.google;
    self.nohist = nohist;

    log.info("Getting Steam info for game "+appId+".");

    this.client.get("/api/appdetails?filters=basic,price_overview,genres&appids="+appId, function(err, res, body) {
        if(err) {log.error(err); return;}

        if(!body[self.appId].success){log.error("Something went wrong retrieving data for Steam game "+self.appId+"."); return;}

        var name = body[self.appId].data.name;
        var isFree = body[self.appId].data.is_free;

        var currency = "";
        var initialPrice = 0;
        var finalPrice = 0;
        var discountPercent = 0;

        var bEarlyAccess = false;
        var bPreOrder = false;
        var bDLC = false;

        var bComingSoon = false;
        var releaseDate = "Unknown";

        if(body[self.appId].data.price_overview) {
            isFree = false;
            currency = body[self.appId].data.price_overview.currency;
            initialPrice = body[self.appId].data.price_overview.initial;
            finalPrice = body[self.appId].data.price_overview['final'];
            discountPercent = body[self.appId].data.price_overview.discount_percent;
        }

        if(body[self.appId].data.genres) {
            for (var i = body[self.appId].data.genres.length - 1; i >= 0; i--) {
                if(body[self.appId].data.genres[i].id === "70" && body[self.appId].data.genres[i].description === "Early Access") {
                    bEarlyAccess = true;
                }
            };
        }

        if(body[self.appId].data['fullgame']) {
            bDLC = true;
        }

        if(body[self.appId].data.release_date) {
            if(body[self.appId].data.release_date.coming_soon) {
                bComingSoon = true;
                if(body[self.appId].data.release_date.date !== "") {
                    releaseDate = body[self.appId].data.release_date.date;
                }
            }
        }

        var headerString = "[Steam";
        if(bEarlyAccess) {headerString += " Early Access";}
        if(bDLC) {headerString += " DLC, "+body[self.appId].data['fullgame'].name;}
        headerString += "] ";

        var outputString = c.pink(headerString);
        outputString += name + " ";

        if(isFree) {
            outputString += "("+c.green("Free")+")";
        } else {
            if(body[self.appId].data.price_overview) {
                outputString += writeDiscount(finalPrice, currency, initialPrice, discountPercent);
            } else {
                outputString += "(N/A)";
            }
        }

        if(bComingSoon) {
            outputString += " - Release: " + releaseDate;
        }

        self.oS = outputString;

        if(!self.nohist) {
            self.enhancedSteamAPI.get("/pricev2/?search=app/" + self.appId + "&stores=steam,amazonus,impulse,gamersgate,greenmangaming,gamefly,origin,uplay,indiegalastore,gametap,gamesplanet,getgames,desura,gog,dotemu,fireflower,gameolith,humblewidgets,adventureshop,nuuvem,shinyloot,dlgamer,humblestore,indiegamestand,squenix,bundlestars&cc=us&coupon=true",
                function(err, res, body){
                    //if we get an error looking up historical low, output what we have and quit.
                    if(err) {self.callback(self.oS); return;}

                    self.oS += " - Historical low: ";
                    self.oS += c.green(body.lowest.price + " USD ");
                    self.oS += c.underline.green("-" + body.lowest.cut + "%") + " on " + body.lowest.store;

                    //This is still callback hell.
                    if(body.lowest.url) {
                        self.google.shorten_url(body.lowest.url, function(shortURL) {
                            self.oS += " (" + shortURL + "), " + body.lowest.recorded_formatted + ".";
                            self.callback(self.oS);
                        });
                    } else {
                        self.oS += ", " + body.lowest.recorded_formatted + ".";
                        self.callback(self.oS);
                    }
                });
        } else {
            callback(outputString);
        }
    });
};

Steam.prototype.getPkg = function(appId, callback, nohist) {

    var self = {};
    self.appId = appId;
    self.callback = callback;
    self.enhancedSteamAPI = this.enhancedSteamAPI;
    self.google = this.google;
    self.nohist = nohist;

    log.info("Getting Steam info for package "+appId+".");

    this.client.get("/api/packagedetails?packageids="+appId, function(err, res, body) {
        if(err) {log.error(err); return;}

        if(!body[self.appId].success){log.error("Something went wrong retrieving data for Steam package "+self.appId+"."); return;}

        var name = body[self.appId].data.name;
        var currency = body[self.appId].data.price.currency;

        var currency = "";
        var initialPrice = 0;
        var finalPrice = 0;
        var indivPrice = 0;
        var discountPercent = 0;

        if(body[self.appId].data.price) {
            currency = body[self.appId].data.price.currency;
            initialPrice = body[self.appId].data.price.initial;
            finalPrice = body[self.appId].data.price['final'];
            indivPrice = body[self.appId].data.price.individual;
            discountPercent = body[self.appId].data.price.discount_percent;
        }

        var outputString = c.pink("[Steam Bundle] ");
        outputString += name;

        if(body[self.appId].data.price) {
            outputString += writeDiscount(finalPrice, currency, initialPrice, discountPercent);
            outputString += " - ";
            outputString += c.green(formatMoney(indivPrice - finalPrice, currency) + " Saved");
        } else {
            outputString += "(N/A)";
        }

        self.oS = outputString;

        if(!self.nohist) {
            self.enhancedSteamAPI.get("/pricev2/?search=sub/" + self.appId + "&stores=steam,amazonus,impulse,gamersgate,greenmangaming,gamefly,origin,uplay,indiegalastore,gametap,gamesplanet,getgames,desura,gog,dotemu,fireflower,gameolith,humblewidgets,adventureshop,nuuvem,shinyloot,dlgamer,humblestore,indiegamestand,squenix,bundlestars&cc=us&coupon=true",
                function(err, res, body){
                    //if we get an error looking up historical low, output what we have and quit.
                    if(err) {self.callback(self.oS); return;}

                    self.oS += " - Historical low: ";
                    self.oS += c.green(body.lowest.price + " " + body[".meta"].currency +" ");

                    //This is still callback hell.
                    if(body.lowest.url) {
                        self.google.shorten_url(body.lowest.url, function(shortURL) {
                            self.oS += c.underline.green("-" + body.lowest.cut + "%") + " on " + body.lowest.store + " (" + shortURL + "), " + body.lowest.recorded_formatted + ".";
                            self.callback(self.oS);
                        });
                    } else {
                        self.oS += c.underline.green("-" + body.lowest.cut + "%") + " on " + body.lowest.store + ", " + body.lowest.recorded_formatted + ".";
                        self.callback(self.oS);
                    }
                });
        } else {
            callback(outputString);
        }
    });
};

function writeDiscount(finalPrice, currency, initialPrice, discountPercent) {
    var outputString = "";
    if(discountPercent) {
        outputString += " ("+c.gray(formatMoney(initialPrice, currency)) + ") - ";
        outputString += c.green(formatMoney(finalPrice, currency) + c.underline("-"+discountPercent+"%"));
    } else {
        outputString += " ("+c.green(formatMoney(finalPrice, currency))+")";
    }
    return outputString;
}

function formatMoney(number, currency) {
    return n(number/100).format('0.00') + " " + currency;
}

module.exports = Steam;
