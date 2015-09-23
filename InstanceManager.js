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

var uuid = require('node-uuid');
var irc = require('irc');
var AKP48 = require('./AKP48/AKP48');
var ConfigManager = require('./AKP48/ConfigManager');

function InstanceManager(logger) {
    this.log = logger.child({module: "InstanceManager"});
    this.instances = [];
}

/**
 * Start an instance of AKP48.
 * @param  {UUID}   uuid         The UUID of the instance.
 * @param  {String} configFolder The configuration folder.
 * @param  {Logger} logger       The logger.
 * @param  {Object} ircClient    The IRC client to use.
 */
InstanceManager.prototype.startInstance = function (uuid, configFolder, logger, ircClient) {
    if(!uuid || uuid==null) {
        uuid = uuid.v4();
    }
    this.log.info({uuid:uuid}, "Starting instance.");

    var options = {
        instanceManager: this,
        uuid: uuid,
        configManager: new ConfigManager(logger, configFolder),
        ircClient: (ircClient || null)
    }

    this.instances[uuid] = new AKP48(options, logger);
};

/**
 * Stop an instance.
 * @param  {UUID} uuid The instance to stop.
 */
InstanceManager.prototype.stopInstance = function (uuid) {
    if(this.instances[uuid]) {
        this.log.info({uuid:uuid}, "Stopping instance.");
        this.instances[uuid].stop();
    }
};

/**
 * Reload an instance, storing the instance's IRCClient to restore on reload.
 * @param  {UUID} uuid The instance to reload.
 */
InstanceManager.prototype.reloadInstance = function (uuid) {
    this.log.info({uuid:uuid}, "Reloading instance.");
};

/**
 * Shutdown all instances.
 * @param  {String} The message to use.
 */
InstanceManager.prototype.shutdownAll = function (message) {
    //TODO: Make this happen.
};

/**
 * Reload all instances, storing their IRC clients.
 */
InstanceManager.prototype.reloadAll = function () {
    //TODO: Make this happen.
};

module.exports = InstanceManager;
