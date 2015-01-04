function Ban() {
    //the name of the command.
    this.name = "Ban";

    //help text to show for this command.
    this.helpText = "Bans a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['ban'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

Ban.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        context.client.setBanned(context.arguments[i]);
    };
    context.client.clientManager.saveConfig();
    context.client.getIRCClient().say(context.nick, "Banned "+context.arguments.join(", "));
    return true;
};

module.exports = Ban;