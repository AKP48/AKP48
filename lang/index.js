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
 * Loads language files.
 * @return {Object}        Language file contents.
 */
function languageLoader() {
    var languages = {};
    var files = require('fs').readdirSync(__dirname + '/');
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if(file.match(/.+\.json/g) !== null) {
            var locale = file.split('.')[0];
            var fileStr = file.split('.')[1];
            languages[locale] = {};
            languages[locale][fileStr] = require('./' + file);
        }
    }

    return languages;
}

module.exports = languageLoader();
