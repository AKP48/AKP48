var c = require('irc-colors');

function Rainbow() {
    //the name of the command.
    this.name = "Rainbow";

    //help text to show for this command.
    this.helpText = "Makes text 20% cooler.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<text>";

    //ways to call this command.
    this.aliases = ['rainbow', 'r'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Rainbow.prototype.execute = function(context) {
    if(context.arguments.length) {
        var msg = context.arguments.join(' ');
        context.client.getIRCClient().say(context.channel, c.rainbow(msg));
    }
};

module.exports = Rainbow;