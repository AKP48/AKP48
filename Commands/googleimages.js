var Google = require('../API/google');
var config = require('../config.json');

function GoogleImages() {
    //the name of the command.
    this.name = "Google Images Search";

    //help text to show for this command.
    this.helpText = "Returns the first result of a Google Image search.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<query>";

    //ways to call this command.
    this.aliases = ['gi', 'images', 'googleimages', 'askgaminggforapicture'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey);
}

GoogleImages.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}
    this.googleAPI.search(context.arguments.join(" "), "images", function(msg) {
        context.getClient().say(context, msg);
    });
    return true;
};

module.exports = GoogleImages;