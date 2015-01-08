function Help() {
    //the name of the command.
    this.name = "Help";

    //help text to show for this command.
    this.helpText = "Shows documentation for the bot.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[page]";

    //ways to call this command.
    this.aliases = ['help', 'halp'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //commands per page
    this.perPage = 8;
}

Help.prototype.execute = function(context) {

    if(!context.getUser().isRealIRCUser) {
        context.getClient().say(context, "Getting help from the Minecraft server is not yet possible! To get help, please join the IRC channel.");
        return true;
    }

    var page = 0;

    if(context.getArguments().length) {
        //check if argument 0 is a number
        if(!isNaN(+context.getArguments()[0])) {
            page += (+context.getArguments()[0] - 1);
            if(page == 0) {page = 1;}
            if(page > 99) {page = 99;}
        } else {
            //not a number. Check for a command here, I guess.
        }
    }

    //array for output
    var responses = [];

    //get the current commands
    var commands = context.getCommandProcessor().commands;

    //for each command
    for (var property in commands) {
        if (commands.hasOwnProperty(property)) {
            //if command is really there
            if(commands[property] !== undefined) {
                if(context.getUser().hasPermission(commands[property].permissionName) || context.getClient().getChannel("global").getUser(context.getUser().getNick()).hasPermission(commands[property].permissionName)) {
                    responses.push(commands[property].name + ": " + commands[property].helpText + " | Usage: " + context.getChannel().getCommandDelimiter() + commands[property].aliases[0] + " " + commands[property].usageText);
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

    context.getClient().getIRCClient().say(context.getUser().getNick(), "Help: Page "+(page+ 1)+" of "+numberOfPages);

    var self = this;
    //counter for number per page
    var j = 0;

    var interval = setInterval(function() {
        if(responses.length && j < self.perPage) {
            var i = responses.shift();
            context.client.getIRCClient().say(context.getUser().getNick(), i);
            j++;
        } else {
            clearInterval(interval);
        }
    }, 175);

    return true;
};

module.exports = Help;