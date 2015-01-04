function Credits() {
    //the name of the command.
    this.name = "Credits";

    //help text to show for this command.
    this.helpText = "Gives a link to the credits page.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['credits'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Credits.prototype.execute = function(context) {
    context.client.say(context, "http://akpwebdesign.com/IRCBot/credits.html");
    return true;
};

module.exports = Credits;