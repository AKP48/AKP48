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

var chance = new (require("chance"))();

function AlienHandler(logger) {
    //the name of the handler.
    this.name = "Alien Handler";

    //whether or not to allow this handler in a private message.
    this.allowPm = true;

    //the regex used to match this handler
    this.regex = null;

    //whether or not this handler runs on the only full message
    this.fullMsgOnly = true;

    // the amount of times we should respond with this handler, 0 is no limit
    this.limit = 1;

    //logger
    this.log = logger;
}

AlienHandler.prototype.execute = function(message, context) {
	var msg = "ayy lmao";

	if(chance.bool({likelihood: 25})) {
		msg = "ayy lamo"
	}

    if(message.toLowerCase().includes("ayy")) {
        context.AKP48.say(context.channel, msg);
    }
};

module.exports = AlienHandler;
