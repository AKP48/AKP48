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

var config = require("./data/config/config");
var apiConfig = require("./data/config/api");
var GitHooks = require("githubhook");
var Git = require("./API/git");
var Google = require("./API/google");

var c = require("irc-colors");

function GitListener(clientmanager, logger) {
    //client manager
    this.manager = clientmanager;

    //logger
    this.log = logger.child({module: "GitListener"});

    //listener
    this.githubListener = null;

    var git = config.git || {};

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
    this.googleAPI = new Google(logger, apiConfig);

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

GitListener.prototype.shouldUpdate = function(branch) {
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
GitListener.prototype.startListening = function() {
    if (this.githubListener) {
        this.log.error("Attempted to listen while already listening.");
        return;
    }

    this.log.info({repo: this.repository, port: this.port, branch: this.branch}, "Initializing GitHub Webhook listener");

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
        self.log.info({head_commit_message: data.head_commit.message, ref: ref}, "GitHub Webhook received.");
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
GitListener.prototype.handle = function (branch, data) {
    this.log.info({branch: branch}, "Handling Webhook.");
    var manager = this.manager;
    // Alert channels of update
    var commits_string = " commit".pluralize(data.commits.length).prepend(data.commits.length);
    this.googleAPI.shorten_url(data.compare, function(url) {
        var message = c.pink("[GitHub]").append(" ").append(commits_string).append(data.forced && !data.created ? " force" : "").append(" pushed to")
            .append(data.created ? " new" : "").append(" ").append(data.ref.startsWith("refs/tags/") ? "tag" : "branch").append(" ").append(c.bold(branch))
            .append(" by ").append(data.pusher.name).append(" (").append(url).append(")");

        for (var i = 0; i < data.commits.length && i < 3; i++) {
            var _c = data.commits[data.commits.length - 1 - i];
            var _m = _c.message;
            var end = _m.indexOf("\n");
            var commit_message = _c.author.username.append(": ").append(_m.substring(0, end === -1 ? _m.length : end)).prepend(c.green("[".append(_c.id.substring(0, 7)).append("] ")));
            message += "\n".append(commit_message);
        };

        this.log.info({message: message}, "Alerting clients of Git changes.");

        manager.clients.each(function (client) {
            client.alert.each(function (channel) {
                if(GLOBAL.config.isInChannel(channel, client.uuid)) {
                    client.getIRCClient().say(channel, message);
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
        var hot_files = ['server.js', 'GitListener.js', 'ClientManager.js'];

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

        this.log.info("Updating to branch: ".append(branch));

        // Fetch, Checkout
        if (!this.gitAPI.checkout(branch)) {
            return;
        }

        if (npm) {
            this.log.info("Executing npm install.");
            exec('npm install');
        }

        if (shutdown) {
            manager.shutdown("I'm updating! :3");
        } else {
            manager.softReload();
        }
    }, this);
};

module.exports = GitListener;
