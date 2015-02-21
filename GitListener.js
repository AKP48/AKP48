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
var log = bunyan.createLogger({
    name: 'AKP48 Git Webhook Listener',
    streams: [{
        type: 'rotating-file',
        path: path.resolve("./log/AKP48.log"),
        period: '1d',
        count: 7
    },
    {
        stream: process.stdout
    }]
});

// We need the shell
require('shelljs/global');

var config = require("./config.json");
var GitHooks = require("githubhook");
var Git = new (require("./API/git"))();

var c = require("irc-colors");

function GitListener(clientmanager) {
    this.manager = clientmanager;

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
}

GitListener.prototype.startListening = function() {
    if (this.githubListener) {
        log.error("Attempted to listen while already listening.");
        return;
    }

    log.info({repo: this.repository, port: this.port, branch: this.branch}, "Initializing GitHub Webhook listener");

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
        log.info({head_commit_message: data.head_commit.message, ref: ref}, "GitHub Webhook received.");
        var branch = ref.substring(ref.lastIndexOf('/') + 1);
        if (self.branch === "*" || self.branch === branch) {
            self.handle(branch, data);
        }
    });
}

GitListener.prototype.handle = function (branch, data) {
    var manager = this.manager;
    // Alert channels of update
    var commits_string = " commit".pluralize(data.commits.length).prepend(data.commits.length);
    var message = c.pink("[GitHub]").append(" ").append(commits_string).append(data.forced && !data.created ? " force" : "").append(" pushed to")
        .append(data.created ? " new" : "").append(" ").append(data.ref.startsWith("refs/tags/") ? "tag" : "branch").append(" ").append(c.bold(branch))
        .append(" by ").append(data.pusher.name);

    for (var i = 0; i < data.commits.length && i < 3; i++) {
        var _c = data.commits[data.commits.length - 1 - i];
        var _m = _c.message;
        var end = _m.indexOf("\n");
        var commit_message = _c.author.username.append(": ").append(_m.substring(0, end === -1 ? _m.length : end)).prepend(c.green("[".append(_c.id.substring(0, 7)).append("] ")));
        message += "\n".append(commit_message);
    };

    manager.clients.forEach(function (client) {
        client.alert.forEach(function (channel) {
            client.getIRCClient().say(channel, message);
        });
    });

    if (!Git.isRepo()) {
        return;
    }

    var changing_branch = branch !== Git.getBranch();
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
    
    log.info("Updating to branch: ".append(branch));
    
    // Fetch, Checkout
    if (!Git.checkout(branch)) {
        return;
    }

    if (npm) {
        exec('npm install');
    }


    setTimeout(function(){
        if (shutdown) {
            manager.shutdown("Restarting due to update.");
        } else {
            manager.softReload();
        }
    }, 50);
};

module.exports = GitListener;