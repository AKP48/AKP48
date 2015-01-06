function Daft() {
    //the name of the command.
    this.name = "Daft";

    //help text to show for this command.
    this.helpText = "Asks a user if they are daft.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['daft'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Daft.prototype.execute = function(context) {
    if(context.arguments[0] !== undefined) {
        context.client.getIRCClient().say(context.channel, context.arguments.join(" ") + ", are you daft?");
    } else {
        context.client.getIRCClient().say(context.channel, context.nick + ", are you daft?");
    }
    return true;
};

module.exports = Daft;