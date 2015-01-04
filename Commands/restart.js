function Restart() {
    //the name of the command.
    this.name = "Restart";

    //help text to show for this command.
    this.helpText = "Gracefully restarts the client connected to this server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[message]";

    //ways to call this command.
    this.aliases = ['restart', 'rs'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

Restart.prototype.execute = function(context) {
    var msg = "Goodbye.";

    if(context.arguments[0]) {
        msg = context.arguments.join(" ");
    }

    context.client.clientManager.shutdown(msg);
    return true;
};

module.exports = Restart;