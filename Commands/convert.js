var n = require('numeral');

function Convert() {
    //the name of the command.
    this.name = "Convert";

    //help text to show for this command.
    this.helpText = "Convert temperatures. Unit must be 'c' or 'f'.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<temperature> <unit>";

    //ways to call this command.
    this.aliases = ['convert'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Convert.prototype.execute = function(context) {
    var args = context.arguments;
    var tempRegEx = /^(-?\d+(?:\.\d+)?)\s?°?([cfk])$/gi;
    var msg = args.join(" ");

    var temp = parseFloat(msg.replace(tempRegEx, "$1"));
    var tempTemp = msg.replace(tempRegEx, "$1");
    var unit = msg.replace(tempRegEx, "$2");
    var places = "0".repeat((tempTemp.indexOf(".") != -1) ? Math.min(Math.max(tempTemp.length - 1 - tempTemp.indexOf("."), 2), 20) : 2);

    if(unit === "c") {
        try {
            context.client.say(context, temp+"°C is "+n((temp*9/5) + 32).format("0[.]"+places)+"°F.");
        } catch(e) {
            context.client.say(context, "Could not convert "+temp+"°C to Fahrenheit!");
        }
        return;
    }

    if(unit === "f") {
        try {
            context.client.say(context, temp+"°F is "+n((temp - 32)*5/9).format("0[.]"+places)+"°C.");
        } catch(e) {
            context.client.say(context, "Could not convert "+temp+"°F to Fahrenheit!");
        }
        return;
    }

    if(unit === "k") {
        context.client.say(context, "I'm a Korean Pop group, not a scientist.");
    }
};

module.exports = Convert;