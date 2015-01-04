function かわいい() {
    //the name of the command.
    this.name = "かわいい";

    //help text to show for this command.
    this.helpText = "私わかわいいです。";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['かわいい', 'kawaii'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

かわいい.prototype.execute = function(context) {
    context.client.say(context, "ですですですですです。　：３");
    return true;
};

module.exports = かわいい;