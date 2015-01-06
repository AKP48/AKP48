var config = require('../config.json');
var Riot = require('../API/riot');

function LoLServerStatus() {
    //the name of the command.
    this.name = "LoL Server Status";

    //help text to show for this command.
    this.helpText = "Gets the current server status for League of Legends servers.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[region]";

    //ways to call this command.
    this.aliases = ['lolserverstatus', 'lolstatus', 'lolsvrstatus'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //Riot API.
    this.riotAPI = new Riot(config.riot.apiKey);
}

LoLServerStatus.prototype.execute = function(context) {
    var region = "na";
    if(context.arguments[0]) {region = context.arguments[0];}
    this.riotAPI.getServerStatus(region, function(msg) {
        context.client.say(context, msg);
    });
    return true;
};

module.exports = LoLServerStatus;