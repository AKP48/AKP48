var Client = require("./Client");
var Context = require("./Context");
var User = require("./User");

/**
 * Used to build various objects.
 */
function Builder() {

}

/**
 * Build a Client.
 * @param  {Object}     options     The options that will configure the client.
 * @return {Client}                 The Client.
 */
Builder.prototype.buildClient = function(options) {
    //Make ourselves a new Client...
    var client = new Client();

    //set the options, if we get them.
    if(options.nick) {
        client.setNick(options.nick);
    }
    if(options.server) {
        client.setServer(options.server);
    }
    if(options.password) {
        client.setPassword(options.password);
    }
    if(options.channels) {
        client.setChannels(options.channels);
    }
    //return it.
    return client;
};

/**
 * Builds a Context.
 * @param  {Message} message The IRC Message.
 * @param  {Client}  client  The Client.
 * @return {Context}         The Context, false if failed to create a Context.
 */
Builder.prototype.buildContext = function(message, client) {
    //Before we do anything else, check to see if we sent this message.
    //We can safely toss this out if we are the sender.
    if(message.nick == client.getNick()){return false;}

    //Make ourselves a new Context...
    var context = new Context();

    //set the client first, as it's the easiest.
    context.setClient(client);

    //temporary var for the channel.
    var channel = message.args[0];

    //if the channel name is the same as our nickname, it's a PRIVMSG.
    if(channel == client.getNick()) {
        channel = "global";

        //set isPm
        context.setIsPM();
    }

    //set channel to the channel we are trying to get.
    channel = client.getChannel(channel);

    //if the channel doesn't exist, return here.
    if(!channel) {return false;}

    //set the channel in the context.
    context.setChannel(channel);

    //temporary var for the user.
    var user = channel.getUser(message.prefix);

    //if there is no user with this hostmask
    if(!user) {
        //create a new one and add it.
        user = this.buildUser(message, client);
        channel.addUser(user);
        context.setUser(user);
    }

    //now we have a user.

    //set full message
    context.setFullMessage(message.args[1]);

    //set command processor
    context.setCommandProcessor(client.getCommandProcessor());

    //set commands
    context.setCommands(context.getCommandProcessor().aliasedCommands);

    var messageString = message.args[1];

    //process the command and arguments out of the message.

    //if the user is from a Minecraft bot
    if(!user.isRealIRCUser) {
        //cut off their name from the string.
        messageString = messageString.substring(messageString.indexOf(')')+1);
    }


};

/**
 * Builds a User.
 * @param  {Message} message The IRC message to use.
 * @param  {Client}  client  The client to use.
 * @return {User}            The User.
 */
Builder.prototype.buildUser = function(message, client) {
    //Make ourselves a new User...
    var user = new User();

    //if the user this came from is a Minecraft bot,
    if(client.getMcBots().indexOf(message.prefix)){
        //say so.
        user.setIsRealIRCUser(false);

        //find nick
        start = message.args[1].indexOf('(');
        end = message.args[1].indexOf(')');

        //set nick
        user.setNick(message.args[1].substring(start + 1, end));

        //set hostmask
        user.setHostmask(user.getNick()+"!"+message.user+"@"+message.host);
    } else {
        //the user is legit, so just use their nick and hostmask.
        user.setNick(message.nick);
        user.setHostmask(message.prefix);
    }

    return user;
};

module.exports = Builder;