function RemoveChannel() {
    //the name of the command.
    this.name = "Remove Channel";

    //help text to show for this command.
    this.helpText = "Disconnect from a channel.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<channelName>";

    //ways to call this command.
    this.aliases = ['removechannel', 'removechan', 'rmchan'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

RemoveChannel.prototype.execute = function(context) {
    if(context.arguments.length !== 1) {return false;}
    context.client.removeChannel(context.arguments[0]);
    return true;
};

module.exports = RemoveChannel;