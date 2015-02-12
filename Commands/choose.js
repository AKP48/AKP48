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

var Chance = require('chance');

function Choose() {
    //the name of the command.
    this.name = "Choose";

    //help text to show for this command.
    this.helpText = "Chooses from a list of items for you.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[attack|feel] <item1> [item2, item3, item4...]";

    //ways to call this command.
    this.aliases = ['choose', 'pick'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //randomizer
    this.chance = new Chance();

    //possible attack values
    this.attacks = [
        'Critical Fail',
        'Dire Fail',
        'Horrible Fail',
        'Bad Fail',
        'Fail',
        'Dismal Miss',
        'Horrible Miss',
        'Bad Miss',
        'Miss',
        'Almost Glance',
        'Narrowly Glance',
        'Probably Glance',
        'Clearly Glance',
        'Glance',
        'Hit',
        'Arm Hit',
        'Leg Hit',
        'Stomach Hit',
        'Chest Hit',
        'Head Hit'
    ];

    //possible feeling values
    this.feels = [
        'ashamed',
        'very ashamed',
        'proud',
        'very proud',
        'insane',
        'daft'
    ];
}

Choose.prototype.execute = function(context) {

    if(!context.arguments.length) {return false;}

    if(context.arguments[0].toLowerCase() === "attack" || context.arguments[0].toLowerCase() === "atk") {
        return this.attack(context);
    }

    if(context.arguments[0].toLowerCase() === "feel") {
        return this.feel(context);
    }

    context.getClient().say(context, context.arguments[this.chance.integer({min:0, max:context.arguments.length-1})]);

    return true;
};

Choose.prototype.attack = function(context) {
    //redundancy just because.
    if(context.arguments.length < 2) {return false;}

    //choose person and attack.
    var atk = this.attacks[this.chance.integer({min:0, max:this.attacks.length-1})];
    var person = context.arguments[this.chance.integer({min:1, max:context.arguments.length-1})];

    //say the result.
    context.getClient().getIRCClient().say(context.getChannel().getName(), context.getUser().getNick() + " attacks " + person + ": " + atk + ".");
    return true;
};

Choose.prototype.feel = function(context) {
    //redundancy just because.
    if(!context.arguments.length) {return false;}

    //choose feeling.
    var feel = this.feels[this.chance.integer({min:0, max:this.feels.length-1})];

    //blank person for now.
    var person = "";

    //if there's at least 2 arguments, we can choose a person.
    if(context.arguments.length >= 2) {
        person = context.arguments[this.chance.integer({min:1, max:context.arguments.length-1})];
    }

    //build the string. (oS stands for outputString. I'm lazy.)
    var oS = context.getUser().getNick() + " ";

    //if we have a person, add 'thinks <person>' to the string.
    if(person !== "") {
        oS += "thinks " + person + " ";
    }

    //add feeling.
    oS += "should feel " + feel + ".";

    //say the result.
    context.getClient().getIRCClient().say(context.getChannel().getName(), oS);
    return true;
};

module.exports = Choose;