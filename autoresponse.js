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