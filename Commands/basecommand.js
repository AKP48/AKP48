function BaseCommand() {
    //the name of the command.
    this.name = "Base Command";

    //help text to show for this command.
    this.helpText = "Base command. Does nothing, simply a placeholder to copy from when making a new command.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['base'];

    //dependencies that this module has.
    this.dependencies = ['moduleThatWillNeverBeHereSoThatThisCommandWillNeverLoad'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

BaseCommand.prototype.execute = function(context) {
    //add content here.
    return true;
};

module.exports = BaseCommand;