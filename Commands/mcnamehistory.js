var request = require('request-json');

function MCNameHistory() {
    //the name of the command.
    this.name = "MCNameHistory";

    //help text to show for this command.
    this.helpText = "Gets the name history of a player on Minecraft.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['mcnamehistory'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

MCNameHistory.prototype.execute = function(context) {
    context.apiClient = request.newClient("https://api.mojang.com/");

    if(!context.arguments[0]) {return;}

    context.name = context.arguments[0];

    //TODO: make this follow redirects.
    //TODO: make this just generally work better. (show previous times and things of that nature.)
    //Example names to use: PlasmaPod, ezfe.

    context.apiClient.get("/users/profiles/minecraft/"+context.name, function(err, res, body) {
        if(err || body.error == "Not Found") {context.client.say(context, "There is no player with the name "+context.name+"!"); return;}

        context.apiClient.get("/user/profiles/"+body.id+"/names", function(error, response, bodyy) {
            if(error || body.error == "Not Found" || body.length < 4) {context.client.say(context, "There was an error finding previous names for "+context.name+"!"); return;}

            var outputString = "Previous names found for "+context.name+": ";
            for (var i = bodyy.length - 1; i >= 0; i--) {
                outputString += bodyy[i].name + " | ";
            };

            outputString = outputString.substring(0, outputString.length - 3);
            context.client.say(context, outputString);
        });
    });
};

module.exports = MCNameHistory;