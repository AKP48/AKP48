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

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //randomizer
    this.chance = new Chance();

    //possible values
    this.values = [
        'Critical Fail',
        'Miserable Fail',
        'Horrible Fail',
        'Bad Fail',
        'Fail',
        'Miserable Miss',
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
    context.client.say(context, this.values[this.chance.integer({min:0, max:this.values.length-1})]);

    return true;
};

module.exports = Choose;