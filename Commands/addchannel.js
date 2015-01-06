function AddChannel() {
    //the name of the command.
    this.name = "Add Channel";

    //help text to show for this command.
    this.helpText = "Connects to a new channel.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<channelName>";

    //ways to call this command.
    this.aliases = ['addchannel', 'addchan'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

AddChannel.prototype.execute = function(context) {
    if(context.arguments.length !== 1) {return false;}
    context.client.addChannel(context.arguments[0]);
    return true;
};

module.exports = AddChannel;