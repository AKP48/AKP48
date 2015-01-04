function Help() {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[page]";

    //ways to call this command.
    this.aliases = ['help', 'halp'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //commands per page
    this.perPage = 8;
}

Help.prototype.execute = function(context) {

    if(context.isMcBot) {
        context.client.say(context, "Getting help from the Minecraft server is not yet possible! To get help, please join the IRC channel.");
        return true;
    }

    var page = 0;

    if(context.arguments.length) {
        //check if argument 0 is a number
        if(!isNaN(+context.arguments[0])) {
            page += (+context.arguments[0] - 1);
            if(page == 0) {page = 1;}
            if(page > 99) {page = 99;}
        } else {
            //not a number. Check for a command here, I guess.
        }
    }

    //array for output
    var responses = [];

    //for each command
    for (var property in context.commandProcessor.commands) {
        if (context.commandProcessor.commands.hasOwnProperty(property)) {
            //if command is really there
            if(context.commandProcessor.commands[property] !== undefined) {
                if(!context.commandProcessor.commands[property].requireOp || context.client.isOp(context.nick)) {
                    responses.push(context.commandProcessor.commands[property].name + ": " + context.commandProcessor.commands[property].helpText + " | Usage: " + context.client.delimiter + context.commandProcessor.commands[property].aliases[0] + " " + context.commandProcessor.commands[property].usageText);
                }
            }
        }
    }

    var numberOfPages = Math.ceil(responses.length / this.perPage);

    //number of responses to waste
    var waste = page * this.perPage;

    while(waste > 0) {
        responses.shift();
        waste--;
    }

    context.client.getIRCClient().say(context.nick, "Help: Page "+(page+ 1)+" of "+numberOfPages);

    var self = this;
    //counter for number per page
    var j = 0;

    var interval = setInterval(function() {
        if(responses.length && j < self.perPage) {
            var i = responses.shift();
            context.client.getIRCClient().say(context.nick, i);
            j++;
        } else {
            clearInterval(interval);
        }
    }, 175);

    return true;
};

module.exports = Help;