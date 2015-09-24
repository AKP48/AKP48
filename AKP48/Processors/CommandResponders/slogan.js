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

function Slogan() {
    //the name of the command.
    this.name = "Sloganizer";

    //help text to show for this command.
    this.helpText = "Creates a slogan for an object.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[noun]";

    //ways to call this command.
    this.aliases = ['slogan', 's', 'sl'];

    //slogans.
    this.slogans = [];
}

Slogan.prototype.execute = function(context) {
    var object = context.nick;

    if(context.arguments[0] !== undefined) {
        object = context.arguments.join(" ");
    }

    // Special case for a friend. <3
    if(object.toLowerCase() === "cazif") {
        context.AKP48.say(context.channel, "<cazif> likes men.".replace(/<cazif>/g, object));
        return true;
    }

    if(!this.slogans.length) {
        var self = this;
        require('fs').readFile('./data/slogans.txt', function(err, data) {
            if(err) {console.error(err);}
            self.slogans = data.toString().split("\n");
            var item = self.slogans[Math.floor(Math.random()*self.slogans.length)];
            context.AKP48.say(context.channel, item.replace(/<text>/g, object));
        });
    } else {
        var item = this.slogans[Math.floor(Math.random()*this.slogans.length)];
        context.AKP48.say(context.channel, item.replace(/<text>/g, object));
    }
    return true;
};

module.exports = Slogan;
