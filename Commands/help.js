function Help() {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['help', 'halp'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Help.prototype.execute = function(context) {
    for (var i = 0; i < context.commands.length; i++) {
        context.client.getIRCClient().say(context.nick, context.commands[i].name + ": " + context.commands[i].helpText);
        for (var j = 0; j < context.commands[i].aliases.length; j++) {
            context.client.getIRCClient().say(context.nick, context.client.delimiter + context.commands[i].aliases[j] + context.commands[i].helpText);
        };
    };
    return true;
};

module.exports = Help;