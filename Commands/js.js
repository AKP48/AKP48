var Sandbox = require("sandbox");
var s = new Sandbox();

function Js() {
    //the name of the command.
    this.name = "Js";

    //help text to show for this command.
    this.helpText = "Runs Javascript code.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['js', '>'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Js.prototype.execute = function(context) {
    s.run( context.arguments.join(" "), function(output) {
        var outputString = "";
        if(output.result) {
            outputString += output.result + "; ";
        }
        if(output.console) {
            outputString += "Console: " + JSON.stringify(output.console);
        }

        if(outputString.length > 430) {
            outputString = outputString.substring(0, 426) + "...";
        }
        context.client.say(context, outputString);
        return true;
    });
};

module.exports = Js;