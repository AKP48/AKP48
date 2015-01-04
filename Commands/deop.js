function DeOp() {
    //the name of the command.
    this.name = "DeOp";

    //help text to show for this command.
    this.helpText = "Removes Op status from a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['deop'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

DeOp.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        context.client.deop(context.arguments[i]);
    };
    context.client.clientManager.saveConfig();
    context.client.getIRCClient().say(context.nick, "Deopped "+context.arguments.join(", "));
    return true;
};

module.exports = DeOp;