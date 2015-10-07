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
var path = require('path');

function InstanceManager(logger) {
    this.log = logger.child({module: "InstanceManager"});
    this.instances = {};
}

/**
 * Start an instance of AKP48.
 * @param  {UUID}   uuid         The UUID of the instance.
 * @param  {String} configFolder The configuration folder.
 * @param  {Logger} logger       The logger.
 * @param  {Object} client       The client to use.
 */
InstanceManager.prototype.startInstance = function (uuid, configFolder, logger, client) {
    var AKP48 = require('./AKP48/AKP48');
    var ConfigManager = require('./AKP48/ConfigManager');
    logger = (logger || this.log);

    if(!uuid || uuid==null) {
        uuid = uuid.v4();
    }
    this.log.info({uuid:uuid}, i18n.getString("instanceManager_startInstance"));

    var options = {
        instanceManager: this,
        uuid: uuid,
        configManager: new ConfigManager(logger, configFolder),
        client: (client || null)
    }

    if(!options.configManager.getServerConfig().disabled) {
        this.instances[uuid] = new AKP48(options, logger);
    }
};

/**
 * Stop an instance.
 * @param  {UUID} uuid The instance to stop.
 */
InstanceManager.prototype.stopInstance = function (uuid, message) {
    if(this.instances[uuid]) {
        this.log.info({uuid:uuid}, i18n.getString("instanceManager_stopInstance"));
        this.instances[uuid].stop(message);
        delete(this.instances[uuid]);
    }

    if(!Object.keys(this.instances).length) {
        var self = this;
        setTimeout(function(){
            self.log.info(i18n.getString("instanceManager_shutdown"));
            process.exit(0);
        }, 500);
    }
};

/**
 * Reload an instance, storing the instance's IRCClient to restore on reload.
 * @param  {UUID} uuid The instance to reload.
 */
InstanceManager.prototype.reloadInstance = function (uuid) {
    if(this.instances[uuid].clientType === "discord") {
        this.stopInstance(uuid, "");
        this.startInstance(uuid, path.resolve("data/config", uuid), this.log);
    } else {
        this.log.info({uuid:uuid}, i18n.getString("instanceManager_reload"));
        new (require('./AKP48/Helpers/hotreload'))(this.log).clearCache();
        var tempClient = this.instances[uuid].client.getRawClient();
        this.instances[uuid].destroy();
        delete this.instances[uuid];
        this.startInstance(uuid, path.resolve("data/config", uuid), this.log, tempClient);
    }
};

/**
 * Shutdown all instances.
 * @param  {String} The message to use.
 */
InstanceManager.prototype.shutdownAll = function (message) {
    var self = this;
    this.instances.each(function(instance){
        self.stopInstance(instance.uuid, message);
    });
};

/**
 * Reload all instances, storing their IRC clients.
 */
InstanceManager.prototype.reloadAll = function () {
    var self = this;
    this.instances.each(function(instance){
        self.reloadInstance(instance.uuid);
    });
};

InstanceManager.prototype.getInstance = function (uuid) {
    if(this.instances[uuid]) {
        return this.instances[uuid];
    }

    return null;
};

module.exports = InstanceManager;
