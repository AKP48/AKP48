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

var config = require('../config.json');
var Google = require('../API/google');

function YouTubeHandler() {
    //the name of the handler.
    this.name = "YouTube Handler";

    //name of the permission needed to use this handler. All users have 'user.handler.use' by default. Banned users have 'user.handler.banned' by default.
    this.permissionName = 'user.handler.use';

    //whether or not to allow this handler in a private message.
    this.allowPm = true;

    //the regex used to match this handler
    this.regex = /(?:https?:\/\/)?(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi;

    //Google API module.
    this.google = new Google(config.google.apiKey);
}

YouTubeHandler.prototype.execute = function(context) {
	//arrays for finding YouTube video ids
	var youTubeIds = [];
    var result = [];
    //find all ids in message.
    while((result = this.regex.exec(context.getFullMessage())) !== null) {
        youTubeIds.push(result[1]);
    }
    //TODO: better handling of maximum links.
    this.google.youtube_video_info(youTubeIds, 3, function(res){
        context.getClient().getIRCClient().say(context.getChannel().getName(), res);
    });
};

module.exports = YouTubeHandler;