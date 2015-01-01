var request = require('request-json');
var c = require('irc-colors');
var n = require('numeral');

function Steam() {
    this.client = request.newClient('https://store.steampowered.com/');
}

Steam.prototype.getGame = function(appId, callback) {

    var self = {};
    self.appId = appId;
    self.callback = callback;

    this.client.get("/api/appdetails?filters=basic,price_overview,genres&appids="+appId, function(err, res, body) {
        if(err) {return;}

        if(!body[self.appId].success){return;}

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
};

Steam.prototype.getPkg = function(appId, callback) {

    var self = {};
    self.appId = appId;
    self.callback = callback;

    this.client.get("/api/packagedetails?packageids="+appId, function(err, res, body) {
        if(err) {return;}

        if(!body[self.appId].success){return;}

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
};


module.exports = Steam;