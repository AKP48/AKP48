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
    name: 'AKP48 Git API Module',
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

var getRepoInfo = require('git-repo-info');
var isRepo = -1;

function Git() {
    //TODO: things.
}

/**
 * Fetch code from all remotes.
 */
Git.prototype.fetch = function() {
    if(exec('git fetch').code) {
        return log.error("Attempted git fetch failed!");
    } else {
        log.debug("Fetched");
    }
    return true;
};

/**
 * Get commit hash.
 * @return {String}        The commit SHA.
 */
Git.prototype.getCommit = function() {
    return getRepoInfo().sha;
};

/**
 * Get the current branch.
 * @return {String}        The current git branch.
 */
Git.prototype.getBranch = function() {
    return getRepoInfo().branch;
};

Git.prototype.isRepo = function() {
    if (isRepo === -1) {
        isRepo = getRepoInfo._findRepo(".") !== null;
    }
    return isRepo;
}

/**
 * Get the current tag.
 * @return {String}        The current git tag.
 */
Git.prototype.getTag = function() {
    return getRepoInfo().tag;
};

Git.prototype.checkout = function(branch) {
    if (!branch || !this.fetch()) {
        return;
    }
    if (this.getBranch() !== branch) {
        if (exec('git checkout -q '.append(branch)).code) {
            return log.error("Attempted git reset failed!");
        } else {
            log.debug("Checked out ".append(branch));
        }
    }
    if ((this.getBranch() || this.getTag()) && exec('git reset -q origin/'.append(branch).append(' --hard')).code) {
        return log.error("Attempted git reset failed!");
    } else {
        log.debug("Reset to ".append(branch));
    }
    return true;
};

module.exports = Git;
