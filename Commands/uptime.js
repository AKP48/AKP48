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

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
}

Uptime.prototype.execute = function(context) {
    context.getClient().say(context, "I've been up for "+moment.duration(process.uptime(), "seconds").humanize());
    return true;
};

module.exports = Uptime;