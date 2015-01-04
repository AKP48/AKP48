function Disconnect() {
    //the name of the command.
    this.name = "Disconnect";

    //help text to show for this command.
    this.helpText = "Disconnects from the current server";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[message]";

    //ways to call this command.
    this.aliases = ['disconnect', 'dc'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

Disconnect.prototype.execute = function(context) {
    var msg = "Goodbye.";

    if(context.arguments[0]) {
        msg = context.arguments.join(" ");
    }

    context.client.getIRCClient().say(nick, "Disconnecting! ("+msg+")");

    context.client.clientManager.removeClient(client, msg);
    return true;
};

module.exports = Disconnect;