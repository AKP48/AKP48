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
 * Load all command responders.
 * @param  {Logger}   logger The logger to pass to loaded command responders.
 * @return {Object[]}        An array of command responders.
 */
var loadResponders = function(logger) {
    var commands = [];
    var _log = logger.child({module: "CommandResponder Loader"});
    require('fs').readdirSync(__dirname + '/').each(function(file) {
        if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
            _log.trace("Loading " + file);
            var name = file.replace('.js', '');

            //set up logger
            var log = logger.child({module: "CommandResponders/"+name});

            var loadModule = require('./' + file);
            var tempModule = new loadModule(log);

            commands[name] = tempModule;
        }
    });
    return commands;
};

module.exports = loadResponders;
