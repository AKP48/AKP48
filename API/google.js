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
var google = require('googleapis');

function Google(api_key, logger) {
    this.api_key = api_key;
    this.client = request.createClient('https://www.googleapis.com/');
    this.urlshortener = google.urlshortener({ version: 'v1', auth: this.api_key });
    this.youtube = google.youtube({version: 'v3', auth: this.api_key});
    this.log = logger.child({module: "Google API"});
}

/**
 * Shorten a URL using Goo.gl.
 * @param  {String}   url      The URL to shorten.
 * @param  {Function} callback The callback to call after shortening.
 * @param  {Object}   thisArg  Optional. Value to use as this when executing callback.
 */
Google.prototype.shorten_url = function(url, callback, thisArg) {
    this.log.info("Shortening URL using goo.gl.");
    this.urlshortener.url.insert({ resource: { longUrl: url } }, function (err, response) {
      callback.call(thisArg, response.id);
    });
};

/**
 * Get information about a YouTube video.
 * @param  {String[]} video_ids The array of video ids.
 * @param  {Integer}  maxLines  The maximum amount of lines to send.
 * @param  {Function} callback  The callback to call when finished.
 */
Google.prototype.youtube_video_info = function(video_id, callback) {
    var self = {};
    self.client = this.client;
    self.api_key = this.api_key;
    self.youtube = this.youtube;

    var params = {
        id: video_id,
        part: 'snippet,contentDetails,statistics'
    }

    this.log.info("Retrieving information about YouTube video "+video_id+" from Google.");

    this.youtube.videos.list(params, function(err, response){
        if(response.items[0]) {
            var video = response.items[0];

            params = {
                id: video.snippet.channelId,
                part: 'snippet'
            }

            self.youtube.channels.list(params, function(err, response) {
                var d = m.duration(video.contentDetails.duration);
                var definition = video.contentDetails.definition;
                var dimension = video.contentDetails.dimension;
                var publishedAt = m(video.snippet.publishedAt).format("MMMM Do, YYYY");
                var timeString = n((d.hours()*60*60)+(d.minutes()*60)+d.seconds()).format("00:00:00");
                var outputString = c.black("[") + c.bold("You") + c.red("Tube") + c.black("] ");
                outputString += video.snippet.title + " by " + response.items[0].snippet.title;
                if(timeString !== "0:00:00" || definition === 'hd' || dimension === '3d') {
                    outputString += " (";

                    if(timeString !== "0:00:00") {
                        outputString += c.bold(timeString);
                    }

                    if(dimension === '3d') {
                        outputString += c.bold(" 3D");
                    }

                    if(definition === 'hd') {
                        outputString += c.bold(" HD");
                    }

                    outputString += ")";
                }
                outputString += " | ";
                outputString += "Views: " + n(video.statistics.viewCount).format("0,0");
                outputString += " | ";
                outputString += c.green("Likes: " + n(video.statistics.likeCount).format("0,0"));
                outputString += " | ";
                outputString += c.red("Dislikes: " + n(video.statistics.dislikeCount).format("0,0"));
                outputString += " | ";
                outputString += "Published on " + publishedAt;
                callback(outputString);
            });
        }
    });
};

/**
 * Use the Google Geocoding API to find a location.
 * @param  {String}   location The location to search for.
 * @param  {String}   region   The 2-letter region code to use.
 * @param  {Function} callback The callback to call when finished.
 */
Google.prototype.geocode = function(location, region, callback) {
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+location;

    if(region) {
        url += "&region="+region;
    }

    url += "&key="+this.api_key;

    this.log.info("Getting geocoding information for location "+location+" from Google.");

    this.client.get(url, function(err, res, body){
        if(body.results[0]) {
            var outputString = body.results[0].formatted_address;
            outputString += " | Lat: " + n(body.results[0].geometry.location.lat).format("0.000");
            outputString += " | Long: " + n(body.results[0].geometry.location.lng).format("0.000");
        } else {
            outputString = c.red("No results found!");
        }

        callback(outputString);
    });
};

/**
 * Search for a term on Google.
 * @param  {String}   query    The string to search for.
 * @param  {String}   type     images or web.
 * @param  {Function} callback The callback to call when finished.
 */
Google.prototype.search = function(query, type, callback) {
    var url = 'http://ajax.googleapis.com/ajax/services/search/'+type+'?v=1.0&safe=high&q='+encodeURIComponent(query);
    var self = this;
    this.log.info("Searching Google for "+query+".");
    this.client.get(url, function(err, res, body){
        if(err) {this.log.error(err);}
        if(body.responseData) {
            if(body.responseData.results[0]) {
                var outputString = "Title: \"" + body.responseData.results[0].titleNoFormatting;
                self.shorten_url(body.responseData.results[0].url, function(smallUrl) {
                    outputString += "\" | URL: " + smallUrl;
                    callback(outputString);
                });
            }
        } else {
            this.log.error("Something went wrong!", {response: body});
        }
    });
}

module.exports = Google;
