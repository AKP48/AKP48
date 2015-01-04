function Lart() {
    //the name of the command.
    this.name = "LART";

    //help text to show for this command.
    this.helpText = "Luser Attitude Readjustment Tool";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[luser]";

    //ways to call this command.
    this.aliases = ['lart'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;

    //larts.
    this.larts = [];
}

Lart.prototype.execute = function(context) {
    var object = context.nick;

    if(args[0] !== undefined) {
        object = args.join(" ");
    }

    if(!this.larts.length) {
        var self = this;
        fs.readFile('./data/lart.txt', function(err, data) {
            if(err) {console.error(err);}
            self.larts = data.toString().split("\n");
            var item = self.larts[Math.floor(Math.random()*self.larts.length)];
            context.client.getIRCClient().say(context.channel, context.nick + " " + item.replace(/\{user\}/g, object));
        });
    } else {
        var item = this.larts[Math.floor(Math.random()*this.larts.length)];
        context.client.getIRCClient().say(context.channel, context.nick + " " + item.replace(/\{user\}/g, object));
    }
    return true;
};

module.exports = Lart;