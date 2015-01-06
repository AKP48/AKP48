function Roll() {
    //the name of the command.
    this.name = "Roll";

    //help text to show for this command.
    this.helpText = "Roll dice. See https://wiki.roll20.net/Dice_Reference for dice roll format.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<dice...>";

    //ways to call this command.
    this.aliases = ['roll'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Roll.prototype.execute = function(context) {
    var diceRegEx = /^(?:roll(?= *[^+ ]))(?: *(?: |\+) *(?:\d*[1-9]\d*|(?=d))(?:d\d*[1-9]\d*(?:x\d*[1-9]\d*)?)?)+ *$/gi;
    var diceRollRegEx = /[ +](\d+|(?=d))(?:d(\d+)(?:x(\d+))?)?(?= *(\+| |$))/gi;

    //too lazy to change regex
    var msg = "roll "+context.arguments.join(" ");
    var result;
    var dice = [];

    var countLimited = false;

    //for each group
    while((di = diceRegEx.exec(msg)) !== null) {
        //for each dice
        while((result = diceRollRegEx.exec(di)) !== null) {
            //parse out each value
            var count = (parseInt(result[1]) != 0) ? parseInt(result[1]) : 1;
            if(isNaN(count)) {count = 1;}
            if(count > 1000000) {count = 1000000; countLimited = true;}

            var maxValue = (parseInt(result[2]) != 0) ? parseInt(result[2]) : 1;
            if(isNaN(maxValue)) {maxValue = 1;}

            var multiplier = (parseInt(result[3]) != 0) ? parseInt(result[3]) : 1;
            if(isNaN(multiplier)) {multiplier = 1;}

            var isFinalValue = !("+" === result[4]);

            //add to array
            dice.push({
                count: count,
                maxValue: maxValue,
                multiplier: multiplier,
                isFinalValue: isFinalValue
            });
        }
    }

    var rolls = [];
    var roll = 0;

    //for each di
    for (var i = 0; i < dice.length; i++) {
        //for count of di
        for(var j = 0; j < dice[i].count; j++) {
            //add dice result to roll.
            roll += chance.natural({min: 1, max: dice[i].maxValue}) * dice[i].multiplier;
        }

        //if this was the last di in this group
        if(dice[i].isFinalValue) {
            //push & reset the roll
            rolls.push(roll);
            roll = 0;
        }
    }

    var outputString = "";

    //format output
    for (var i = 0; i < rolls.length; i++) {
        outputString += n(rolls[i]).format("0,0") + " | ";
    };

    outputString = outputString.substring(0, outputString.length-3);

    if(countLimited) {outputString += " | (Dice counts limited to 1,000,000.)"}

    //output string to IRC
    context.client.say(context.channel, outputString);
    return true;
};

module.exports = Roll;