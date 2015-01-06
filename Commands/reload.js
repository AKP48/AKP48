function Reload() {
    //the name of the command.
    this.name = "Reload";

    //help text to show for this command.
    this.helpText = "Reloads the bot's command processor.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['reload'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'netop.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;
}

Reload.prototype.execute = function(context) {
    delete require.cache[require.resolve('../commandprocessor')];
    delete require.cache[require.resolve('../autoresponse')];
    delete require.cache[require.resolve('../chatter')];

    this.removeAPIAndCommandCache();

    context.client.say(context, "All channels reloading!");
    context.client.clientManager.reloadAll();
    return true;
};

Reload.prototype.removeAPIAndCommandCache = function() {
    require('fs').readdirSync(__dirname).forEach(function(file) {
        delete require.cache[require.resolve('./'+file)];
    });

    delete require.cache[__dirname];

    require('fs').readdirSync(__dirname + '/../API/').forEach(function(file) {
        delete require.cache[require.resolve('../API/' + file)];
    });
};

module.exports = Reload;