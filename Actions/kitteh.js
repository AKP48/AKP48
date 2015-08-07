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

var chance = new (require('chance'));

function KittehActionHandler(logger) {
    //the name of the handler.
    this.name = "Kitteh Action Handler";

    //whether or not to allow this handler in a private message.
    this.allowPm = true;

    //the regex used to match this handler
    this.regex = /pets/i;

    // the amount of times we should respond with this handler, 0 is no limit
    this.limit = 1;

    //logger
    this.log = logger;

    this.timer = 0;

    this.sadResponses = [
        'I want to be petted! :\'(',
        'Nobody ever pets me...',
        'Why don\'t you love me, <name>?',
        'Nobody loves me... :('
    ];

    this.neutralResponses = [
        'is uninterested.',
        'sniffs <name>\'s hand.',
        'looks at <name> with a confused look on his face.',
        'stares at <name>.'
    ];

    this.happyResponses = [
        'wags his tail.',
        'jumps on <name>\'s lap and-- SQUIRREL!',
        'chases his tail.',
        'pants heavily.'
    ];

    setInterval(function(){this.timer--;if(this.timer < 0){this.timer = 0}}, 1000);
}

KittehActionHandler.prototype.execute = function(word, context) {
    var action = word.split(" ").slice(1).join(" ").toLowerCase().trim().slice(0,-1);
    if(action === "pets ^o^") {
        if(chance.integer({min:1, max:100}) < 42 && this.timer <= 1) {
            context.getClient().getIRCClient().say(context.getChannel(),
                this.sadResponses.randomElement().replace(/<name>/i, context.getUser().getNick()));
            this.setPettingTimer();
        }
    }

    var randNumber = chance.integer({min:1, max:1000});

    if(action === "pets akp48" && this.timer <= 1) {
        if(randNumber <= 242) {
            context.getClient().getIRCClient().say(context.getChannel(),
                this.happyResponses.randomElement().replace(/<name>/i, context.getUser().getNick()));
        } else if (randNumber > 642) {
            context.getClient().getIRCClient().say(context.getChannel(),
                this.neutralResponses.randomElement().replace(/<name>/i, context.getUser().getNick()));
        }
    }
};

KittehActionHandler.prototype.setPettingTimer = function() {
    this.timer = 42;
};

module.exports = KittehActionHandler;