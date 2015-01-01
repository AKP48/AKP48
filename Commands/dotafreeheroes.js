function DOTAFreeHeroes() {
    //the name of the command.
    this.name = "DOTA Free Heroes";

    //help text to show for this command.
    this.helpText = "Shows the free hero rotation for DOTA 2.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['dotafreeheroes', 'dota2freeheroes', 'dota2fh'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

DOTAFreeHeroes.prototype.execute = function(context) {
    context.client.say(context, "All of them.");
};

module.exports = DOTAFreeHeroes;