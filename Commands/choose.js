var Chance = require('chance');

function Choose() {
    //the name of the command.
    this.name = "Choose";

    //help text to show for this command.
    this.helpText = "Chooses from a list of items for you.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<choice1> [choice2, choice3, ...]";

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
}

Choose.prototype.execute = function(context) {

    if(!context.arguments.length) {return false;}

    if(context.arguments.length == 1) {context.client.say(context, "The choice is yours!"); return true;}

    context.client.say(context, context.arguments[this.chance.integer({min:0, max:context.arguments.length-1})]);

    return true;
};

module.exports = Choose;