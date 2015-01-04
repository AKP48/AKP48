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

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

HowsItFeel.prototype.execute = function(context) {
    context.client.say(context, "Feels bad, man.");
    return true;
};

module.exports = HowsItFeel;