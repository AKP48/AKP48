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
    name: 'AKP48 Riot API Module',
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
var m = require('moment');

function Riot(api_key) {
    this.api_key = api_key;
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
    log.info("Retrieving champion list from Riot.");
    this.client.get('/api/lol/static-data/na/v1.2/champion?api_key='+this.api_key, function(err, res, body) {
        for (var property in body.data) {
            if (body.data.hasOwnProperty(property)) {
                self.champions[body.data[property].id] = body.data[property];
            }
        }
    });
};

Riot.prototype.getFreeChamps = function(callback) {
    if(m().subtract(10, 'minutes').isAfter(this.freeChamps.lastAccess)) {
        log.info("Retrieving free champions from Riot.");
        this.freeChamps = { champions: [], lastAccess: m() };
        var self = this;
        this.client.get('/api/lol/na/v1.2/champion?freeToPlay=true&api_key='+this.api_key, function(err, res, body) {
            if(err) {log.error(err); return;}
            for (var i = 0; i < body.champions.length; i++) {
                self.freeChamps.champions.push(self.champions[body.champions[i].id].name);
            };

            callback(self.freeChamps.champions.join(" | "));
        });
    } else {
        callback(this.freeChamps.champions.join(" | "));
    }
};

Riot.prototype.getServerStatus = function(region, callback) {
    var extra = '';
    if(region.toLowerCase() === "pbe") {
        extra = '.pbe';
    }
    log.info("Retrieving server status from Riot for region "+region);
    this.client.get('http://status'+extra+'.leagueoflegends.com/shards/'+region.toLowerCase(), function(err, res, body) {
        if(err) {callback("Could not get server status for that region!"); log.error(err); return;}
        var response = [];
        for (var property in body.services) {
            if (body.services.hasOwnProperty(property)) {
                var oS = body.services[property].name + ": " + body.services[property].status;
                if(body.services[property].status === "online") {
                    oS = c.green(oS);
                } else {
                    oS = c.red(oS);
                }
                response.push(oS);
            }
        }

        callback(body.name + ": " + response.join(" | "));
    });
};

module.exports = Riot;