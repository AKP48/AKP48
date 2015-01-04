function ChangeDelimiter() {
    //the name of the command.
    this.name = "Change Delimiter";

    //help text to show for this command.
    this.helpText = "Changes the command delimiter for this server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<delimiter>";

    //ways to call this command.
    this.aliases = ['changedelimiter', 'cd'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

ChangeDelimiter.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}

    console.log(context.arguments[0]);
    context.client.delimiter = context.arguments[0];
    context.client.clientManager.saveConfig();
    context.client.getIRCClient().say(context.nick, "Delimiter changed!");
    console.log("Delimiter changed! -> "+context.arguments[0]);
    context.commands.reload.execute();
    return true;
};

module.exports = ChangeDelimiter;