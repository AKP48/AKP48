function Reload() {
    //the name of the command.
    this.name = "Reload";

    //help text to show for this command.
    this.helpText = "Reloads the bot's command processor.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['reload'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

Reload.prototype.execute = function(context) {
    delete require.cache[__dirname+'/commandprocessor.js'];
    delete require.cache[__dirname+'/autoresponse.js'];
    delete require.cache[__dirname+'/commands.js'];
    delete require.cache[__dirname+'/chatter.js'];

    this.removeAPIAndCommandCache();

    context.client.say(context, "All channels reloading!");
    context.client.clientManager.reloadAll();
};

Reload.prototype.removeAPIAndCommandCache = function() {
    require('fs').readdirSync(__dirname).forEach(function(file) {
        delete require.cache[__dirname + "/" + file];
    });

    delete require.cache[__dirname];

    require('fs').readdirSync(__dirname + '/../API/').forEach(function(file) {
        delete require.cache[__dirname + '/../API/' + file];
    });
};

module.exports = Reload;