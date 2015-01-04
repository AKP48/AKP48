var c = require('irc-colors');
var request = require('request-json');

function MinecraftServerStatus() {
    //the name of the command.
    this.name = "Minecraft Server Status";

    //help text to show for this command.
    this.helpText = "Shows the status of Minecraft's login and session servers.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['minecraftserverstatus', 'mcserverstatus', 'mcstatus'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

MinecraftServerStatus.prototype.execute = function(context) {
    var apiClient = request.newClient("https://status.mojang.com/");

    var self = context;

    apiClient.get("/check", function(err, res, body) {
        if(err) {self.client.getIRCClient().say(self.channel, "There was an error retrieving the Minecraft server status!"); return true;}
        var skins = body[4]['skins.minecraft.net'];
        var auth = body[3]["auth.mojang.com"];
        var session = body[1]["session.minecraft.net"];
        var website = body[0]["minecraft.net"];

        var outputString = "Minecraft Server Status: ";

        switch(website) {
            case "green":
                outputString += c.green("Website: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Website: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Website: Offline")+" | ";
        }

        switch(auth) {
            case "green":
                outputString += c.green("Auth Server: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Auth Server: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Auth Server: Offline")+" | ";
        }

        switch(session) {
            case "green":
                outputString += c.green("Session Server: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Session Server: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Session Server: Offline")+" | ";
        }

        switch(skins) {
            case "green":
                outputString += c.green("Skins: Online");
                break;
            case "yellow":
                outputString += c.yellow("Skins: Having Trouble");
                break;
            case "red":
                outputString += c.red("Skins: Offline");
        }

        self.client.say(self, outputString);
    });
    return true;
};

module.exports = MinecraftServerStatus;