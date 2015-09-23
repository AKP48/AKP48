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

function HotReloadHelper(logger) {
    this.log = logger.child({module: "HotReload"});
}

/**
 * Clears the require cache.
 */
HotReloadHelper.prototype.clearCache = function () {
    this.log.debug("Clearing require cache.");
    //for each property in require.cache
    for (var prop in require.cache) {
        //if it's really a property of the cache
        if(require.cache.hasOwnProperty(prop)){
            //delete it and log that we've done so.
            this.log.trace("Deleting " + prop + " from require cache.");
            delete require.cache[prop];
        }
    }
};

module.exports = HotReloadHelper;
