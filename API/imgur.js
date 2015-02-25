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
    name: 'AKP48 Imgur API Module',
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
var n = require('numeral');
var m = require('moment');

function Imgur(client_id) {
    // Imgur client id.
    this.clientID = client_id;

    // Imgur client.
    this.client = request.createClient('https://api.imgur.com/3/');
    this.client.headers['Authorization'] = "Client-ID " + this.clientID;
}

Imgur.prototype.uploadImageFromURL = function(url, callback) {
    data = {
        image: url,
        type: "URL"
    };
    log.debug({url: url}, "Uploading image URL to Imgur.");
    this.client.post('image', data, function(err, res, body) {
        if(!err) {callback(body.data.link); return;}
        callback(null);
    });
};

Imgur.prototype.getImageInfo = function(image_id, callback) {
    log.info({id: image_id}, "Getting image information from Imgur.");
    this.client.get('image/' + image_id, function(err, res, body) {
        if(!err) {
            //construct object from JSON response.
            var image = body.data;
            image.bandwidth = n(body.data.bandwidth).format('0.000 b'); // x.xxx TB
            image.size = n(body.data.size).format('0.0 b'); // x.xxx TB
            image.datetime = m.unix(body.data.datetime).fromNow(); // x hours ago
            image.type = body.data.type.replace(/image\//i, ""); // image/gif -> gif
            image.views = n(body.data.views).format('0,0'); // 1,000,000
            callback(image);

            return;
        }
        
        callback(null);
    });
};

Imgur.prototype.getGalleryInfo = function(image_id, callback) {
    log.info({id: image_id}, "Getting gallery information from Imgur.");
    this.client.get('gallery/' + image_id, function(err, res, body) {
        if(!err) {
            //construct object from JSON response.
            var image = body.data;
            image.datetime = m.unix(body.data.datetime).fromNow(); // x hours ago
            image.comment_count = n(body.data.comment_count).format('0,0'); // 1,000,000
            image.ups = n(body.data.ups).format('0,0'); // 1,000,000
            image.downs = n(body.data.downs).format('0,0'); // 1,000,000
            image.views = n(body.data.views).format('0,0'); // 1,000,000
            image.raw_score = body.data.score;
            image.score = n(body.data.score).format('0,0'); // 1,000,000
            if(!image.is_album) {
                image.bandwidth = n(body.data.bandwidth).format('0.000 b'); // x.xxx TB
                image.size = n(body.data.size).format('0.0 b'); // x.xxx TB
                image.type = body.data.type.replace(/image\//i, ""); // image/gif -> gif
            }
            image.is_gallery = true;
            callback(image);

            return;
        }
        
        callback(null);
    });
};

Imgur.prototype.getAlbumInfo = function(image_id, callback) {
    log.info({id: image_id}, "Getting album information from Imgur.");
    this.client.get('album/' + image_id, function(err, res, body) {
        if(!err) {
            //construct object from JSON response.
            var image = body.data;
            image.datetime = m.unix(body.data.datetime).fromNow(); // x hours ago
            image.is_album = true;
            callback(image);

            return;
        }
        
        callback(null);
    });
};

module.exports = Imgur;
