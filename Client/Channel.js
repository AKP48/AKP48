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
 * @param  {String} nick The user's nickname.
 * @return {User}        The user, false if no user.
 */
Channel.prototype.getUser = function(nick) {
    //get index of user, -1 if non-existent
    var index = this.users.indexOf(user);
    if(index > -1) {
        return this.users[index];
    }
    return false;
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

module.exports = Channel;