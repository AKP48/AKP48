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

function Lart() {
    //the name of the command.
    this.name = "LART";

    //help text to show for this command.
    this.helpText = "Luser Attitude Readjustment Tool";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[luser]";

    //ways to call this command.
    this.aliases = ['lart'];

    //disable this command.
    //this.dependencies = [''];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //larts.
    this.larts = [];
}

Lart.prototype.execute = function(context) {
    var object = context.getUser().getNick();

    if(context.arguments[0] !== undefined) {
        object = context.arguments.join(" ");
    }

    if(!this.larts.length) {
        var self = this;
        require('fs').readFile('./data/lart.txt', function(err, data) {
            if(err) {console.error(err);}
            self.larts = data.toString().split("\n");
            var item = self.larts[Math.floor(Math.random()*self.larts.length)];
            context.getClient().getIRCClient().say(context.getChannel(), context.getUser().getNick() + " " + item.replace(/\{user\}/g, object));
        });
    } else {
        var item = this.larts[Math.floor(Math.random()*this.larts.length)];
        context.getClient().getIRCClient().say(context.getChannel(), context.getUser().getNick() + " " + item.replace(/\{user\}/g, object));
    }
    return true;
};

module.exports = Lart;