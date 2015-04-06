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

var DinnerAPI = require("./dinner");
var GistAPI = require("./gist");
var GitAPI = require("./git");
var GoogleAPI = require("./google");
var ImgurAPI = require("./imgur");
var MALAPI = require("./mal");
var RiotAPI = require("./riot");
var SteamAPI = require("./steam");
var XKCDAPI = require("./xkcd");
var config = require("../config.json");

/**
 * Load all APIs.
 * @param  {Logger} logger The logger to pass to loaded APIs.
 * @return {Object}        The APIs.
 */
var loadAPIs = function(logger) {
    var _log = logger.child({module: "API Loader"});
    var APIs = {
        Dinner: new DinnerAPI(logger),
        Gist: {

        },
        Git: {

        },
        Google: {

        },
        Imgur: {

        },
        MAL: {

        },
        Riot: {

        },
        Steam: {

        },
        XKCD: {

        }
    };
    return APIs;
};

module.exports = loadAPIs;