var Google = require('../API/google');
var config = require('../config.json');

function LMGTFY() {
    //the name of the command.
    this.name = "LMGTFY";

    //help text to show for this command.
    this.helpText = "Returns a LMGTFY link.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<query>";

    //ways to call this command.
    this.aliases = ['lmgtfy'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey);
}

LMGTFY.prototype.execute = function(context) {
    var query = context.arguments.join(' ');
    query = encodeURIComponent(query);
    this.googleAPI.shorten_url("http://lmgtfy.com/?q="+query, function(url) {
        context.client.say(context, url);
    });
};

module.exports = LMGTFY;