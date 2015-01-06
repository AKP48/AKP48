function Unban() {
    //the name of the command.
    this.name = "Unban";

    //help text to show for this command.
    this.helpText = "Unbans a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['unban'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Unban.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        context.client.unban(context.arguments[i]);
    };
    context.client.clientManager.saveConfig();
    context.client.say(context, "Unbanned "+context.arguments.join(", "));
    return true;
};

module.exports = Unban;