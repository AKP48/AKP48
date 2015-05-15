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

var BibleAPI = require("./bible");
var DinnerAPI = require("./dinner");
var GistAPI = require("./gist");
var GitAPI = require("./git");
var GoogleAPI = require("./google");
var ImgurAPI = require("./imgur");
var MALAPI = require("./mal");
var RiotAPI = require("./riot");
var SteamAPI = require("./steam");
var XKCDAPI = require("./xkcd");
var config = require("../data/config/api.json");

/**
 * Load all APIs.
 * @param  {Logger} logger The logger to pass to loaded APIs.
 * @return {Object}        The APIs.
 */
var loadAPIs = function(logger) {
    var _log = logger.child({module: "API Loader"});
    var APIs = {
        Bible: new BibleAPI(logger),
        Dinner: new DinnerAPI(logger),
        Gist: new GistAPI(logger),
        Git: new GitAPI(logger),
        Google: new GoogleAPI(config.google.apiKey, logger),
        Imgur: new ImgurAPI(config.imgur.clientID, logger),
        MAL: new MALAPI(logger),
        Riot: new RiotAPI(config.riot.apiKey, logger),
        Steam: new SteamAPI(logger),
        XKCD: new XKCDAPI(logger),
    };
    return APIs;
};

module.exports = loadAPIs;