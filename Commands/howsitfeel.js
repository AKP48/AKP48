function HowsItFeel() {
    //the name of the command.
    this.name = "How's It Feel?";

    //help text to show for this command.
    this.helpText = "Tells you how it feels.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['howsitfeel', 'howsitfeel?'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

HowsItFeel.prototype.execute = function(context) {
    context.getClient().say(context, "Feels bad, man.");
    return true;
};

module.exports = HowsItFeel;