var Google = require('../API/google');
var config = require('../config.json');

function Googl() {
    //the name of the command.
    this.name = "Goo.gl Link Shortener";

    //help text to show for this command.
    this.helpText = "Shortens a link using the Goo.gl API.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<link>";

    //ways to call this command.
    this.aliases = ['googl'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey);
}

Googl.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}
    this.googleAPI.shorten_url(context.arguments[0], function(url) {
        context.getClient().say(context, url);
    });
    return true;
};

module.exports = Googl;