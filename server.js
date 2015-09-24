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
 * This is the main entry point for AKP48. This module handles hot-reloading so that everything can be hot-reloaded.
 */

var fs = require('fs');
var path = require('path');
var bunyan = require('bunyan');
var validator = require('validator');
var config = require('./data/config/global');
var InstanceManager = require('./InstanceManager');
var GitProcessor = require('./GitProcessor');

if(!config.productionMode) {
    require('longjohn');
}

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

log.info("Initializing polyfill...");
require('./polyfill.js')(log);

//Initialize an InstanceManager.
var instanceManager = new InstanceManager(log);

//Initialize a GitProcessor.
var gitProcessor = new GitProcessor(log, instanceManager);

//create instances using the currently existing configuration folders.
//TODO: If none exist, use default settings.
fs.readdir(path.resolve("data/config"), function(err, files) {
    //check for error, quit now if we have any.
    if(err) {log.fatal(err); return;}

    //loop through files in the config folder.
    files.forEach(function(file) {
        //stat each file
        fs.stat(path.resolve("data/config", file), function(err, stat){
            //if error, return
            if(err) {log.fatal(err); return;}

            //if the 'file' is actually a directory, and the name is a valid UUID,
            //start an AKP48 instance using it.
            if(stat.isDirectory() && validator.isUUID(file) && file !== "00000000-0e6c-41f4-a322-29bd4d336ecc") {
                instanceManager.startInstance(file, path.resolve("data/config", file), log);
            }
        });
    });
});

//todo: better exception handling plz
if(config.productionMode) {
    process.on('uncaughtException', function(err) {
        log.fatal({err: err}, "Exception caught: %s", err);
    });
}
