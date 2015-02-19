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

function AutoResponseHandler() {
    //the name of the handler.
    this.name = "Generic Automatic Response Handler";

    //name of the permission needed to use this handler. All users have 'user.handler.use' by default. Banned users have 'user.handler.banned' by default.
    this.permissionName = 'user.handler.use';

    //whether or not to allow this handler in a private message.
    this.allowPm = true;

    //the regex used to match this handler
    this.regex = /^insert some regex here$/i;

    // the amount of times we should respond with this handler, 0 is no limit
    this.limit = 0;
}

AutoResponseHandler.prototype.execute = function(word, context) {
    //this function should be overridden to allow the handler to perform functions.
};

module.exports = AutoResponseHandler;