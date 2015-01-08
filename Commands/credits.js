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

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Credits.prototype.execute = function(context) {
    context.getClient().say(context, "http://akpwebdesign.com/IRCBot/credits.html");
    return true;
};

module.exports = Credits;