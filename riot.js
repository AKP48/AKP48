var request = require('request-json');
var c = require('irc-colors');
var n = require('numeral');
var m = require('moment');

function Riot(api_key) {
    this.api_key = api_key;
    this.client = request.newClient('https://na.api.pvp.net/');

    this.champions = [];

    this.getChampList();

    this.freeChamps = {
        champions: [],
        lastAccess: m("1992-04-29")
    };

    setTimeout(function(){
        this.getChampList();
    }, 43200000);
}

Riot.prototype.getChampList = function() {
    this.champions = [];
    var self = this;
    this.client.get('/api/lol/static-data/na/v1.2/champion?api_key='+this.api_key, function(err, res, body) {
        for (var property in body.data) {
            if (body.data.hasOwnProperty(property)) {
                self.champions[body.data[property].id] = body.data[property];
            }
        }
    });
};

Riot.prototype.getFreeChamps = function(callback) {
    console.log(this.champions);
    if(m().subtract(6, 'hours').isAfter(this.freeChamps.lastAccess)) {
        this.freeChamps = { champions: [], lastAccess: m() };
        var self = this;
        this.client.get('/api/lol/na/v1.2/champion?freeToPlay=true&api_key='+this.api_key, function(err, res, body) {
                for (var i = 0; i < body.champions.length; i++) {
                    self.freeChamps.champions.push(self.champions[body.champions[i].id].name);
                };

                callback(self.freeChamps.champions.join(" | "));
            });
    } else {
        callback(this.freeChamps.champions.join(" | "));
    }
};

module.exports = Riot;