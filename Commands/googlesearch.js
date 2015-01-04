var Google = require('../API/google');
var config = require('../config.json');

function GoogleSearch() {
    //the name of the command.
    this.name = "Google Search";

    //help text to show for this command.
    this.helpText = "Returns the first result of a Google search.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<query>";

    //ways to call this command.
    this.aliases = ['g', 'googlesearch', 'google', 'search', 'askjeeves', 'askgamingg'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //google API module for using Google APIs.
    this.googleAPI = new Google(config.google.apiKey);
}

GoogleSearch.prototype.execute = function(context) {
    if(!context.arguments.length) {return false;}
    this.googleAPI.search(context.arguments.join(" "), "web", function(msg) {
        context.client.say(context, msg);
    });
    return true;
};

module.exports = GoogleSearch;