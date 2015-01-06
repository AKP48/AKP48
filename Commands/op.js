function Op() {
    //the name of the command.
    this.name = "Op";

    //help text to show for this command.
    this.helpText = "Gives Op status to a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['op'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Op.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        context.client.setOp(context.arguments[i]);
    };
    context.client.clientManager.saveConfig();
    context.client.say(context, "Opped "+context.arguments.join(", "));
    return true;
};

module.exports = Op;