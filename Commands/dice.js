function Dice() {
    //the name of the command.
    this.name = "Dice";

    //help text to show for this command.
    this.helpText = "Rolls dice.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[number of rolls] [number of sides on each dice]";

    //ways to call this command.
    this.aliases = ['dice'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Dice.prototype.execute = function(context) {
    var args = context.arguments;

    var numberOfRolls;
    var numberOfSides;

    if(args[0] === undefined) {
        numberOfRolls = 1;
    } else {
        numberOfRolls = parseInt(args[0]);

        if(isNaN(numberOfRolls)) {numberOfRolls = 1}
    }

    if(args[1] === undefined) {
        numberOfSides = 6;
    } else {
        numberOfSides = parseInt(args[1]);

        if(isNaN(numberOfSides)) {numberOfSides = 6}
    }

    if(numberOfSides > 500) {numberOfSides = 500;}
    if(numberOfRolls > 50) {numberOfRolls = 50;}

    var rolls = [];

    for (var i = 0; i < numberOfRolls; i++) {
        rolls.push(Math.floor(Math.random() * (numberOfSides)) + 1);
    };

    var outputString = "";

    for (var i = 0; i < rolls.length; i++) {
        outputString += rolls[i] + " | ";
    };

    outputString = outputString.substring(0, outputString.length - 3);

    if(numberOfSides == 2) {
        outputString = outputString.replace(/1/g, 'H');
        outputString = outputString.replace(/2/g, 'T');
    }

    if(numberOfSides < 2) {
        outputString = "ಠ_ಠ";
    }

    context.getClient().say(context, outputString);
    return true;
};

module.exports = Dice;