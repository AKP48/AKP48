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

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Rainbow.prototype.execute = function(context) {
    if(context.arguments.length) {
        var msg = context.arguments.join(' ');
        context.getClient().getIRCClient().say(context.getChannel().getName(), c.rainbow(msg));
    }
    return true;
};

module.exports = Rainbow;