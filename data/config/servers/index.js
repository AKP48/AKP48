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

/**
 * Load all server files.
 * @return {Object}        Server configurations.
 */
var loadServers = function(logger) {
    var servers = [];
    var _log = logger.child({module: "Server Loader"});
    require('fs').readdirSync(__dirname + '/').each(function(file) {
        if (file.match(/.+\.json/g) !== null && !file.startsWith("example.")) {
            _log.trace("Loading " + file);
            var uuid = file.replace('.json', '');

            servers[uuid] = require('./' + file);
        }
    });
    return servers;
};

module.exports = loadServers;
