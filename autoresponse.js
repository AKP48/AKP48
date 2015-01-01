var irc = require('irc');
var c = require('irc-colors');
var n = require('numeral');
var config = require('./config.json');
var Google = require('./API/google');
var Steam = require('./API/steam');
var request = require('request-json');

function AutoResponse() {
    this.google = new Google(config.google.apiKey);
    this.steam = new Steam();
}

AutoResponse.prototype.youtube = function(videoIds, maxLines, callback) {
    this.google.youtube_video_info(videoIds, maxLines, function(res, last){
        callback(res, last);
    });
}

AutoResponse.prototype.steamApp = function(appIds, maxLines, callback) {
    for (var q = 0; q < Math.min(appIds.length, maxLines); q++) {
        this.steam.getGame(appIds[q], callback);
    }
}

AutoResponse.prototype.steamPkg = function(appIds, maxLines, callback) {
    var apiClient = request.newClient("https://store.steampowered.com/");

    var self = {};
    self.appIds = appIds;
    self.callback = callback;

    for (var q = 0; q < Math.min(appIds.length, maxLines); q++) {
        this.steam.getPkg(appIds[q], callback);
    }
}

//export the module
module.exports = AutoResponse;