function SaveConfig() {
    //the name of the command.
    this.name = "Save Configuration";

    //help text to show for this command.
    this.helpText = "Saves the current configuration of the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['saveconfig', 'saveconf'];

    //dependencies that this module has.
    //this.dependencies = [''];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'root.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

SaveConfig.prototype.execute = function(context) {
    context.getClient().getClientManager().save();
    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Saved config!");
    return true;
};

module.exports = SaveConfig;