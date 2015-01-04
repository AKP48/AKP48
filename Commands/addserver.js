function AddServer() {
    //the name of the command.
    this.name = "Add Server";

    //help text to show for this command.
    this.helpText = "Connect to a new server.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<name> <serverAddress> <nick> <opNick> <channel> <mcBotName> <commandDelimiter>";

    //ways to call this command.
    this.aliases = ['addserver'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = true;

    //whether this command requires operator privileges.
    this.requireOp = true;
}

AddServer.prototype.execute = function(context) {
    if(context.arguments.length !== 6) {return false;}

    var created = context.client.clientManager.createClient({
                    name: context.arguments[0],
                    server: context.arguments[1],
                    nick: context.arguments[2],
                    ops: [context.arguments[3]],
                    banned: [],
                    channels: [context.arguments[4]],
                    mcBot: context.arguments[5],
                    delimiter: context.arguments[6],
                });

    context.client.clientManager.saveConfig();

    if(!created) {
        context.client.getIRCClient().say(context.nick, "There was a problem creating the client!");
    } else {
        context.client.getIRCClient().say(context.nick, "Client created!");
    }
    return true;
};

module.exports = AddServer;