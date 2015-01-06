function Restart() {
    //the name of the command.
    this.name = "Restart";

    //help text to show for this command.
    this.helpText = "Gracefully restarts the client connected to this server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[message]";

    //ways to call this command.
    this.aliases = ['restart', 'rs'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
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