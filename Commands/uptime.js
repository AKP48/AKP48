var moment = require('moment');

function Uptime() {
    //the name of the command.
    this.name = "Uptime";

    //help text to show for this command.
    this.helpText = "Shows the bot's uptime.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "";

    //ways to call this command.
    this.aliases = ['uptime'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Uptime.prototype.execute = function(context) {
    context.client.say(context, "I've been up for "+moment.duration(process.uptime(), "seconds").humanize());
};

module.exports = Uptime;