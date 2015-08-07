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
var n = require('numeral');
var m = require('moment');

function Riot(logger, APIConfig) {
    this.log = logger.child({module: "Riot API"});
    this.api_key = APIConfig.riot.apiKey;
    this.client = request.createClient('https://na.api.pvp.net/');

    this.champions = [];

    this.getChampList();

    this.freeChamps = {
        champions: [],
        lastAccess: m("1992-04-29")
    };

    var self = this;

    setTimeout(function(){
        self.getChampList();
    }, 43200000);
}

Riot.prototype.getChampList = function() {
    this.champions = [];
    var self = this;
    this.log.info("Retrieving champion list from Riot.");
    this.client.get('/api/lol/static-data/na/v1.2/champion?api_key='+this.api_key, function (err, res, body) {
        if (err || !body || !body.data) return;
        body.data.each(function (data) {
            self.champions[data.id] = data;
        });
    });
};

Riot.prototype.getFreeChamps = function(callback) {
    if(m().subtract(10, 'minutes').isAfter(this.freeChamps.lastAccess)) {
        this.log.info("Retrieving free champions from Riot.");
        this.freeChamps = { champions: [], lastAccess: m() };
        var self = this;
        this.client.get('/api/lol/na/v1.2/champion?freeToPlay=true&api_key='+this.api_key, function (err, res, body) {
            if(err) { callback("Could not get free champions!"); return this.log.error(err); }
            body.champions.each(function (champ) {
                self.freeChamps.champions.push(self.champions[champ.id].name);
            });

            callback(self.freeChamps.champions.join(" · "));
        });
    } else {
        callback(this.freeChamps.champions.join(" · "));
    }
};

Riot.prototype.getServerStatus = function(region, callback) {
    var extra = '';
    if(region.toLowerCase() === "pbe") {
        extra = '.pbe';
    }
    this.log.info("Retrieving server status from Riot for region "+region);
    this.client.get('http://status'+extra+'.leagueoflegends.com/shards/'+region.toLowerCase(), function (err, res, body) {
        if(err) {callback("Could not get server status for that region!"); return this.log.error(err);}
        var response = [];
        body.services.each(function (service) {
            var oS = service.name + ": " + service.status;
            if(service.status === "online") {
                oS = c.green(oS);
            } else {
                oS = c.red(oS);
            }
            response.push(oS);
        });

        callback(body.name + ": " + response.join(" · "));
    });
};

module.exports = Riot;
// Name of this API. Will be used to reference the API from other modules.
module.exports.name = "Riot";
