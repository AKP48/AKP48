function Nick() {
    //the name of the command.
    this.name = "Nick";

    //help text to show for this command.
    this.helpText = "Changes the bot's nickname on the network.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<nickname>";

    //ways to call this command.
    this.aliases = ['nick'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

Nick.prototype.execute = function(context) {
    if(context.arguments[0]) {
        context.client.getIRCClient().send("NICK", context.arguments[0]);
        context.client.nick = context.arguments[0];
    }
    return true;
};

module.exports = Nick;