function ChangeDelimiter() {
    //the name of the command.
    this.name = "Change Delimiter";

    //help text to show for this command.
    this.helpText = "Changes the command delimiter for this server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<delimiter>";

    //ways to call this command.
    this.aliases = ['changedelimiter', 'cd'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

ChangeDelimiter.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}

    context.getClient().say(context, "NYI");
    return true;

    console.log(context.arguments[0]);
    context.client.delimiter = context.arguments[0];
    context.getClient().getClientManager().save();
    context.client.getIRCClient().say(context.nick, "Delimiter changed!");
    console.log("Delimiter changed! -> "+context.arguments[0]);
    context.commands.reload.execute();
    return true;
};

module.exports = ChangeDelimiter;