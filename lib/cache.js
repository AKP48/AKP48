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

var m = require('moment');

function Cache(logger) {
    this.cache = {};

    // Logger.
    this.log = logger.child({module: "Cache"});
}

Cache.prototype.addToCache = function(key, data, expires) {
    if(typeof expires != "number") {
        this.log.trace({key: key, reason: "expires is not a number."}, "Not added to cache.");
        return false;
    }
    if(expires <= (Date.now() / 1000 | 0)) {
        this.log.trace({key: key, reason:"expires is in the past."}, "Not added to cache.");
        return false;
    }
    this.log.trace({key: key, data: data, expires: expires, expiresEnglish: m(expires).fromNow()}, "Added to cache.");
    this.cache[key] = {data: data, expires: expires};
    return true;
};

Cache.prototype.getCached = function(key) {
    if(!this.cache[key]) {
        this.log.trace({key: key}, "Cache miss.");
        return undefined;
    }

    if(this.cache[key].expires < (Date.now() / 1000 | 0)) {
        this.log.trace({key: key, data: this.cache[key].data, expires: this.cache[key].expires, expiresEnglish: m(this.cache[key].expires).fromNow()}, "Removed from cache.");
        delete this.cache[key];
        return undefined;
    }

    this.log.trace({key: key, data: this.cache[key].data, expires: this.cache[key].expires, expiresEnglish: m(this.cache[key].expires).fromNow()}, "Fetched from cache.");
    return this.cache[key].data;
};

module.exports = Cache;