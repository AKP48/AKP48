function Nick() {
    //the name of the command.
    this.name = "Nick";

    //help text to show for this command.
    this.helpText = "Changes the bot's nickname on the network.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<nickname>";

    //ways to call this command.
    this.aliases = ['nick'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

Nick.prototype.execute = function(context) {
    if(context.arguments[0]) {
        context.client.getIRCClient().send("NICK", context.arguments[0]);
        context.client.nick = context.arguments[0];
    }
    return true;
};

module.exports = Nick;