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

// We need the shell
require('shelljs/global');

var GitHooks = require("githubhook");
var path = require('path');
var Git = require("./AKP48/APIs/git");
var Google = require("./AKP48/APIs/google");

var c = require("irc-colors");

function GitProcessor(logger, instanceManager) {
    //instance manager
    this.instanceManager = instanceManager;

    this.config = require(path.resolve("data/config", "global.json"));

    //logger
    this.log = logger.child({module: "GitProcessor"});

    //listener
    this.githubListener = null;

    var git = this.config.git || {};

    //port to listen on
    this.port = git.port ? git.port : 4269;

    //path to listen at
    this.path = git.path ? git.path : "/github/callback";

    //secret to use
    this.secret = git.secret ? git.secret : "";

    //repo to listen for
    this.repository = git.repository ? git.repository : "AKP48";

    //branch to listen for
    this.branch = git.branch ? git.branch : "master";

    this.autoUpdate = git.autoUpdate;

    if(git.listenForChanges) {
        this.startListening();
    }

    //google API module for using Google APIs.
    this.googleAPI = new Google(logger, this.config.api);

    //git API module.
    this.gitAPI = new Git(logger);
}

function compare(original, other) {
    if (other === "*" || original === other) { // Checking here saves pain and effort
        return true;
    } else if (other.startsWith("!") || other.startsWith("-")) { // We should update to all except the specified
        // Should we do a compare?
        //return !compare(original, other.substring(1));
        return original !== other.substring(1);
    }

    var star = other.indexOf("*"), star2 = other.lastIndexOf("*"), string;
    if (star !== -1) {
        if (star2 > star) {
            return original.contains(other.substring(star + 1, star2 - 1));
        }
        if (star === 0) {
            return original.endsWith(other.substring(star + 1));
        } else {
            return original.startsWith(other.substring(star - 1));
        }
    }

    return false;
}

GitProcessor.prototype.shouldUpdate = function(branch) {
    if (Array.isArray(this.branch)) { // We update only if it is listed
        for (var x = 0; x < this.branch.length; x++) {
            var _branch = this.branch[x];
            if (compare(branch, _branch)) {
                return true;
            }
        }
        return false;
    }

    return compare(branch, this.branch);
};

/**
 * Start listening for GH Webhooks.
 */
GitProcessor.prototype.startListening = function() {
    if (this.githubListener) {
        this.log.error(i18n.getString("gitProcessor_noListen"));
        return;
    }

    this.log.info({repo: this.repository, port: this.port, branch: this.branch}, i18n.getString("gitProcessor_initListener"));

    this.githubListener = GitHooks({
        path: this.path,
        port: this.port,
        secret: this.secret
    });

    this.githubListener.listen();

    var self = this;
    this.githubListener.on("push:"+this.repository, function (ref, data) {
        if (data.deleted) {
            return;
        }
        self.log.info({head_commit_message: data.head_commit.message, ref: ref}, i18n.getString("gitProcessor_receiveWebhook"));
        var branch = ref.substring(ref.indexOf('/', 5) + 1);
        if (self.shouldUpdate(branch)) {
            self.handle(branch, data);
        }
    });
}

/**
 * Handle a GH Webhook.
 * @param  {String} branch The branch this Webhook is for.
 * @param  {Object} data   The Webhook.
 */
GitProcessor.prototype.handle = function (branch, data) {
    this.log.info({branch: branch}, i18n.getString("gitProcessor_handleWebhook"));
    var manager = this.instanceManager;
    // Alert channels of update
    var commits_string = i18n.getString("gitProcessor_commit").pluralize(data.commits.length, i18n.getString("gitProcessor_commits")).prepend(data.commits.length + " ");
    this.googleAPI.shorten_url(data.compare, function(url) {
        if(!url){url = data.compare;}
        var message = c.pink("[GitHub]").append(" ").append(commits_string).append(data.forced && !data.created ? " " + i18n.getString("gitProcessor_force") : "").append(" "+i18n.getString("gitProcessor_pushedTo"))
            .append(data.created ? " "+i18n.getString("gitProcessor_new") : "").append(" ").append(data.ref.startsWith("refs/tags/") ? i18n.getString("gitProcessor_tag") : i18n.getString("gitProcessor_branch")).append(" ").append(c.bold(branch))
            .append(" "+i18n.getString("gitProcessor_by")+" ").append(data.pusher.name).append(" (").append(url).append(")");

        for (var i = 0; i < data.commits.length && i < 3; i++) {
            var _c = data.commits[data.commits.length - 1 - i];
            var _m = _c.message;
            var end = _m.indexOf("\n");
            var commit_message = _c.author.username.append(": ").append(_m.substring(0, end === -1 ? _m.length : end)).prepend(c.green("[".append(_c.id.substring(0, 7)).append("] ")));
            message += "\n".append(commit_message);
        };

        this.log.info({message: message}, i18n.getString("gitProcessor_alert"));

        manager.instances.each(function (instance) {
            instance.getAlertChannels().each(function(channel){
                if(instance.isInChannel(channel)) {
                    if(instance.client) {
                        instance.client.say(channel, message);
                    }
                }
            });
        });

        if (!this.gitAPI.isRepo()) {
            return;
        }

        var changing_branch = branch !== this.gitAPI.getBranch();
        var update = this.autoUpdate && (data.commits.length !== 0 || changing_branch);

        if (!update) {
            return;
        }

        var shutdown = changing_branch;
        var npm = changing_branch;
        var hot_files = ['server.js', 'GitProcessor.js', 'InstanceManager.js', 'i18n.js'];

        if (!shutdown) {
            data.commits.some(function (commit) {
                commit.modified.some(function (file) {
                    if (hot_files.indexOf(file) !== -1) {
                        shutdown = true;
                    } else if (file === 'package.json') {
                        npm = true;
                    }
                    return shutdown;
                });
                return shutdown;
            });
        }

        this.log.info(i18n.getString("gitProcessor_updateToBranch").append(branch));

        // Fetch, Checkout
        if (!this.gitAPI.checkout(branch)) {
            return;
        }

        //attempt to update submodules.
        this.gitAPI.updateSubmodules();

        if (npm) {
            this.log.info(i18n.getString("gitProcessor_npmInstall"));
            exec('npm install');
        }

        if (shutdown) {
            manager.shutdownAll(i18n.getString("gitProcessor_updating"));
        } else {
            manager.reloadAll();
        }
    }, this);
};

module.exports = GitProcessor;
