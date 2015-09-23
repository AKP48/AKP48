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

function Bible(logger) {
    // Bible client.
    this.client = request.createClient('http://labs.bible.org/');

    // Logger.
    this.log = logger.child({module: "Bible API"});
}

Bible.prototype.getBibleVerses = function(verses, context, callback) {
    this.log.debug({verses: verses}, "Getting Bible verses.");
    this.client.get('/api/?type=json&passage=' + verses, function(err, res, body) {
        if(!err) {callback(body, context); return;}
        callback(null, context);
    });
};

module.exports = Bible;
// Name of this API. Will be used to reference the API from other modules.
module.exports.apiName = "Bible";
