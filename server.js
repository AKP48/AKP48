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
var config = require('./config.json');

var streams = [{
    stream: process.stdout,
    level: (config.log.level || 'info')
}];

if(config.log && config.log.logToFile) {
    streams.push({
        type: 'rotating-file',
        level: (config.log.level || 'info'),
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    });
}

var log = bunyan.createLogger({
    name: 'AKP48',
    module: 'Server',
    streams: streams,
    serializers: {
        err: bunyan.stdSerializers.err
    }
});

log.info("Starting server.");

var ClientManager = require('./ClientManager');

log.info("Initializing polyfill...");
require('./polyfill.js')(log);

log.info("Creating Client Manager.");
var clientmanager = new ClientManager(config, log);

//todo: better exception handling plz
if(config.productionMode) {
    process.on('uncaughtException', function(err) {
        log.fatal({err: err}, "Exception caught: %s", err);
    });
}