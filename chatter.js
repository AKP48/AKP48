function Chatter(nick, client, channel) {
    this.nick = nick;
    this.client = client;
    this.channel = channel;
    this.lastUsed = process.uptime();
    this.timer = 30;
    this.violations = 0;
    this.maxViolations = 5;
    this.isBanned = false;
    this.banMsgSent = false;

    //timer to remove violations every 30 seconds.
    setInterval(this.removeViolations, 30000);
}

Chatter.prototype.getTimer = function() {
    return this.timer;
};

Chatter.prototype.getViolations = function() {
    return this.violations;
};

Chatter.prototype.getLastUsed = function() {
    return this.lastUsed;
};

Chatter.prototype.shouldViolate = function() {
    return ((this.lastUsed + this.timer) > process.uptime());
};

Chatter.prototype.checkViolate = function() {
    if(this.shouldViolate) {
        this.violate();
    }
};

Chatter.prototype.shouldBeBanned = function() {
    return (this.violations > this.maxViolations);
};

Chatter.prototype.violate = function() {
    this.violations++;
};

Chatter.prototype.setLastUsed = function() {
    this.lastUsed = process.uptime();
};

Chatter.prototype.checkBan = function() {
    return this.isBanned;
};

Chatter.prototype.floodProtect = function() {
    this.checkViolate();
    if(this.shouldBeBanned()) {
        if(!this.banMsgSent) {
            this.isBanned = true;
            if(this.nick === client.mcBot) {
                this.client.getIRCClient().say(this.channel, this.nick+": You have been temporarily banned from using my commands for spamming too many commands in a short time. Feel free to continue sending commands to me as private messages.");
            } else {
                this.client.getIRCClient().say(this.nick, "You have been temporarily banned from using my commands for spamming too many commands in a short time. Feel free to continue sending commands to me as private messages.");
            }
            this.banMsgSent = true;
        } else {
            this.violations = this.violations * 1.25;
        }
    }
    this.setLastUsed();
};

Chatter.prototype.removeViolations = function() {
    this.violations -= 5;
    if(this.violations < 0) {
        this.violations = 0;
    }
};

module.exports = Chatter;