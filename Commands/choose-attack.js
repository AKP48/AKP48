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

function ChooseAttack() {
    //the name of the command.
    this.name = "Choose Attack";

    //help text to show for this command.
    this.helpText = "Randomly chooses an attack or something.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['choose-attack', 'choose-atk'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //randomizer
    this.chance = new Chance();

    //possible values
    this.values = [
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
}

ChooseAttack.prototype.execute = function(context) {
    context.getClient().say(context, this.values[this.chance.integer({min:0, max:this.values.length-1})]);

    return true;
};

module.exports = ChooseAttack;