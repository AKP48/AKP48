function Lart() {
    //the name of the command.
    this.name = "LART";

    //help text to show for this command.
    this.helpText = "Luser Attitude Readjustment Tool";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[luser]";

    //ways to call this command.
    this.aliases = ['lart'];

    //disable this command.
    this.dependencies = ['moduleThatWillNeverBeHereSoThatThisCommandWillNeverLoad'];

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //larts.
    this.larts = [];
}

Lart.prototype.execute = function(context) {
    var object = context.nick;

    if(context.arguments[0] !== undefined) {
        object = context.arguments.join(" ");
    }

    if(!this.larts.length) {
        var self = this;
        fs.readFile('./data/lart.txt', function(err, data) {
            if(err) {console.error(err);}
            self.larts = data.toString().split("\n");
            var item = self.larts[Math.floor(Math.random()*self.larts.length)];
            context.getClient().getIRCClient().say(context.getChannel().getName(), context.nick + " " + item.replace(/\{user\}/g, object));
        });
    } else {
        var item = this.larts[Math.floor(Math.random()*this.larts.length)];
        context.getClient().getIRCClient().say(context.getChannel().getName(), context.nick + " " + item.replace(/\{user\}/g, object));
    }
    return true;
};

module.exports = Lart;