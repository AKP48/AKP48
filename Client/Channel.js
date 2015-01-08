/**
 * A channel.
 */
function Channel() {
    // The name of this channel.
    this.name = "";

    // The channel's users.
    this.users = [];

    // The channel's Minecraft bots.
    this.mcBots = [];

    // The channel's command delimiter.
    this.commandDelimiter = ".";
}

/**
 * Set the channel's name
 * @param {String} name The new name.
 */
Channel.prototype.setName = function(name) {
    this.name = name;
};

/**
 * Get the channel's name.
 * @return {String} The name.
 */
Channel.prototype.getName = function() {
    return this.name;
};

/**
 * Add a user.
 * @param {User} user The user.
 */
Channel.prototype.addUser = function(user) {
    //just return if this user is already in the array.
    if(this.users.indexOf(user) !== -1) {return;}
    this.users.push(user);
};

/**
 * Remove a user.
 * @param  {User}    user The user.
 * @return {Boolean}      Whether or not the remove was successful.
 */
Channel.prototype.removeUser = function(user) {
    //get index of user, -1 if non-existent
    var index = this.users.indexOf(user);
    if(index > -1) {
        this.users.splice(index, 1);
        return true;
    }
    return false;
};

/**
 * Get a user.
 * @param  {String} nickOrHost The user's nick or hostmask.
 * @return {User}              The user, null if no user.
 */
Channel.prototype.getUser = function(nickOrHost) {
    for (var i = 0; i < this.users.length; i++) {
        if(this.users[i].getHostmask() === nickOrHost || this.users[i].getNick() === nickOrHost) {
            return this.users[i];
        }
    };
    return null;
};

/**
 * Set the users
 * @param {Array} users The users.
 */
Channel.prototype.setUsers = function(users) {
    this.users = users;
};

/**
 * Get the users.
 * @return {Array} The users.
 */
Channel.prototype.getUsers = function() {
    return this.users;
};

/**
 * Add a Minecraft bot.
 * @param {String} nick The Minecraft bot's nickname.
 */
Channel.prototype.addMcBot = function(nick) {
    //just return if this Minecraft bot is already in the array.
    if(this.mcBots.indexOf(nick) !== -1) {return;}
    this.mcBots.push(nick);
};

/**
 * Remove a Minecraft bot.
 * @param  {String} nick The Minecraft bot to remove.
 * @return {Boolean}     Whether or not the remove was successful.
 */
Channel.prototype.removeMcBot = function(nick) {
    //get index of mcBot, -1 if non-existent
    var index = this.mcBots.indexOf(nick);
    if(index > -1) {
        this.mcBots.splice(index, 1);
        return true;
    }

    return false;
};

/**
 * Set the array of Minecraft bots.
 * @param {Array} mcBots The new Minecraft bots.
 */
Channel.prototype.setMcBots = function(mcBots) {
    this.mcBots = mcBots;
};

/**
 * Get the array of Minecraft bots.
 * @return {Array} The Minecraft bots.
 */
Channel.prototype.getMcBots = function() {
    return this.mcBots;
};

/**
 * Set the command delimiter.
 * @param {String} commandDelimiter The new command delimiter.
 */
Channel.prototype.setCommandDelimiter = function(commandDelimiter) {
    this.commandDelimiter = commandDelimiter;
};

/**
 * Get the command delimiter.
 * @return {String} The command delimiter.
 */
Channel.prototype.getCommandDelimiter = function() {
    return this.commandDelimiter;
};

/**
 * Ban a user.
 * @param  {User} user The user to ban.
 */
Channel.prototype.banUser = function(user) {
    //get user for sure.
    var banUser = this.getUser(user.getHostmask());
    banUser.addPermission("user.command.banned");
};

/**
 * Unban a user.
 * @param  {User} user The user to unban.
 */
Channel.prototype.unbanUser = function(user) {
    //get user for sure.
    var unbanUser = this.getUser(user.getHostmask());
    unbanUser.removePermission("user.command.banned");
};

/**
 * Check if a user has been banned.
 * @param  {User} user The user to check.
 * @return {Boolean}   Whether or not the user has been banned.
 */
Channel.prototype.isBanned = function(user) {
    //get user for sure.
    var checkUser = this.getUser(user.getHostmask());
    return checkUser.hasPermission("user.command.banned");
};

/**
 * Op a user.
 * @param  {User} user The user to op.
 */
Channel.prototype.opUser = function(user) {
    //get user for sure.
    var opUser = this.getUser(user.getHostmask());
    opUser.addPermission("chanop.command.use");
};

/**
 * Deop a user.
 * @param  {User} user The user to deop.
 */
Channel.prototype.deopUser = function(user) {
    //get user for sure.
    var deopUser = this.getUser(user.getHostmask());
    deopUser.removePermission("chanop.command.use");
};

module.exports = Channel;