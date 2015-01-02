var config = require('../config.json');
var Riot = require('../API/riot');

function LoLFreeChamps() {
    //the name of the command.
    this.name = "LoL Free Champion Rotation";

    //help text to show for this command.
    this.helpText = "Shows the current free champion rotation for League of Legends.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['lolfreechamps', 'lolfree'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //Riot API.
    this.riotAPI = new Riot(config.riot.apiKey);
}

LoLFreeChamps.prototype.execute = function(context) {
    this.riotAPI.getFreeChamps(function(msg){
        context.client.say(context, msg);
    });
};

module.exports = LoLFreeChamps;