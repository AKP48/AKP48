function Slogan() {
    //the name of the command.
    this.name = "Sloganizer";

    //help text to show for this command.
    this.helpText = "Creates a slogan for an object.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[noun]";

    //ways to call this command.
    this.aliases = ['slogan'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //slogans.
    this.slogans = [];
}

Slogan.prototype.execute = function(context) {
    var object = context.nick;

    if(context.arguments[0] !== undefined) {
        object = context.arguments.join(" ");
    }

    if(!this.slogans.length) {
        var self = this;
        fs.readFile('./data/slogans.txt', function(err, data) {
            if(err) {console.error(err);}
            self.slogans = data.toString().split("\n");
            var item = self.slogans[Math.floor(Math.random()*self.slogans.length)];
            context.client.say(context, item.replace(/<text>/g, object));
        });
    } else {
        var item = this.slogans[Math.floor(Math.random()*this.slogans.length)];
        context.client.say(context, item.replace(/<text>/g, object));
    }
    return true;
};

module.exports = Slogan;