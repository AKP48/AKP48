var irc = require('irc');
var c = require('irc-colors');
var n = require('numeral');
var config = require('./config.json');
var Google = require('./google');
var request = require('request-json');

function AutoResponse() {
    this.google = new Google(config.google.apiKey);
}

AutoResponse.prototype.youtube = function(videoId, callback) {
    this.google.youtube_video_info(videoId, function(res){
        callback(res);
    });
}

AutoResponse.prototype.steamApp = function(appId, callback) {
    var apiClient = request.newClient("https://store.steampowered.com/");

    var self = {};
    self.appId = appId;
    self.callback = callback;

    apiClient.get("/api/appdetails?filters=basic,price_overview,genres&appids="+appId, function(err, res, body) {
        if(err) {return;}

        if(!body[appId].success){return;}

        var name = body[appId].data.name;
        var isFree = body[appId].data.is_free;

        var currency = "";
        var initialPrice = 0;
        var finalPrice = 0;
        var discountPercent = 0;

        var bEarlyAccess = false;
        var bPreOrder = false;
        var bDLC = false;

        var bComingSoon = false;
        var releaseDate = "Unknown";


        if(body[appId].data.price_overview) {
            currency = body[appId].data.price_overview.currency;
            initialPrice = body[appId].data.price_overview.initial;
            finalPrice = body[appId].data.price_overview['final'];
            discountPercent = body[appId].data.price_overview.discount_percent;
        }

        if(body[appId].data.genres) {
            for (var i = body[appId].data.genres.length - 1; i >= 0; i--) {
                if(body[appId].data.genres[i].id === "70" && body[appId].data.genres[i].description === "Early Access") {
                    bEarlyAccess = true;
                }
            };
        }

        if(body[appId].data['fullgame']) {
            bDLC = true;
        }

        if(body[appId].data.release_date) {
            if(body[appId].data.release_date.coming_soon) {
                bComingSoon = true;
                if(body[appId].data.release_date.date !== "") {
                    releaseDate = body[appId].data.release_date.date;
                }
            }
        }

        var headerString = "[Steam";
        if(bEarlyAccess) {headerString += " Early Access";}
        if(bDLC) {headerString += " DLC, "+body[appId].data['fullgame'].name;}
        headerString += "] ";

        var outputString = c.pink(headerString);
        outputString += name + " ";

        if(isFree) {
            outputString += c.green("Free");
        } else {
            if(body[appId].data.price_overview) {
                if(discountPercent) {
                    outputString += "("+c.gray(n(initialPrice/100).format('0.00') + " " + currency)+") - ";
                    outputString += c.green(n(finalPrice/100).format('0.00') + " " + currency + " " + c.underline("-"+discountPercent+"%"));
                } else {
                    outputString += "("+c.green(n(finalPrice/100).format('0.00') + " " + currency)+")";
                }
            } else {
                outputString += "(N/A)";
            }
        }

        if(bComingSoon) {
            outputString += " - Release: " + releaseDate;
        }

        self.callback(outputString);
    });
}

AutoResponse.prototype.steamPkg = function(appId, callback) {
    var apiClient = request.newClient("https://store.steampowered.com/");

    var self = {};
    self.appId = appId;
    self.callback = callback;

    apiClient.get("/api/packagedetails?packageids="+appId, function(err, res, body) {
        if(err) {return;}

        if(!body[appId].success){return;}

        var name = body[appId].data.name;
        var currency = body[appId].data.price.currency;

        var currency = "";
        var initialPrice = 0;
        var finalPrice = 0;
        var indivPrice = 0;
        var discountPercent = 0;

        if(body[appId].data.price) {
            currency = body[appId].data.price.currency;
            initialPrice = body[appId].data.price.initial;
            finalPrice = body[appId].data.price['final'];
            indivPrice = body[appId].data.price.individual;
            discountPercent = body[appId].data.price.discount_percent;
        }

        var outputString = c.pink("[Steam Bundle] ");
        outputString += name;

        if(body[appId].data.price) {
            if(discountPercent) {
                outputString += " ("+c.gray(n(initialPrice/100).format('0.00') + " " + currency)+") - ";
                outputString += c.green(n(finalPrice/100).format('0.00') + " " + currency + " " + c.underline("-"+discountPercent+"%"));
            } else {
                outputString += " ("+c.green(n(finalPrice/100).format('0.00') + " " + currency)+")";
            }

            outputString += " - ";
            outputString += c.green(n((indivPrice - finalPrice)/100).format('0.00') + " " + currency + " Saved");

        } else {
            outputString += "(N/A)";
        }

        self.callback(outputString);
    });
}

AutoResponse.prototype.tempConvert = function(temp, unit, callback) {
    if(unit === "c") {
        callback(temp+"°C is "+n((temp*9/5) + 32).format("0.00")+"°F.");
        return;
    }

    if(unit === "f") {
        callback(temp+"°F is "+n((temp - 32)*5/9).format("0.00")+"°C.");
        return;
    }
};

//export the module
module.exports = AutoResponse;