function DeOp() {
    //the name of the command.
    this.name = "DeOp";

    //help text to show for this command.
    this.helpText = "Removes Op status from a person or people.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<person> [person2, person3, ...]";

    //ways to call this command.
    this.aliases = ['deop'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'chanop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

DeOp.prototype.execute = function(context) {
    for (var i = 0; i < context.arguments.length; i++) {
        //get the user
        var user = context.getChannel().getUser(context.arguments[i]);
        //if we didn't get a user, we don't need to do anything, as they aren't banned...
        if(user) {
            //unban the user.
            context.getChannel().deopUser(user);
        }
    };
    context.getClient().getIRCClient().notice(context.getUser().getNick(), "Deopped "+context.arguments.join(", "));
    context.getClient().getClientManager().save();
    return true;
};

module.exports = DeOp;