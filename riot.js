var request = require('request-json');
var c = require('irc-colors');
var n = require('numeral');

function Riot(api_key) {
    this.api_key = api_key;
    this.client = request.newClient('https://na.api.pvp.net/');
}

Riot.prototype.getFreeChamps = function(callback) {
    this.client.get('/api/lol/na/v1.2/champion?freeToPlay=true&api_key='+this.api_key, function(err, res, body) {
        console.log(body);
    });
};

module.exports = Riot;