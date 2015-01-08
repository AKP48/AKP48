var Sandbox = require("sandbox");
var s = new Sandbox();

function Js() {
    //the name of the command.
    this.name = "JavaScript";

    //help text to show for this command.
    this.helpText = "Runs Javascript code.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<code>";

    //ways to call this command.
    this.aliases = ['js', '>'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Js.prototype.execute = function(context) {
    if(!context.arguments.length){return false};
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
        context.getClient().say(context, outputString);
    });
    return true;
};

module.exports = Js;