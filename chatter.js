/**
 * Copyright (C) 2015  Austin Peterson
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function Chatter(context, real) {
    this.nick = context.nick;
    this.client = context.client;
    this.channel = context.channel;
    this.lastUsed = process.uptime();
    this.real = real;
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
            if(!this.real) {
                this.client.getIRCClient().say(this.channel, this.nick+": You have been temporarily banned from using my commands for spamming too many commands in a short time. Please refrain from sending commands in this channel for 1 minute, or I will make your ban longer.");
            } else {
                this.client.getIRCClient().say(this.nick, "You have been temporarily banned from using my commands for spamming too many commands in a short time. Please refrain from sending commands in this channel for 1 minute, or I will make your ban longer. Feel free to continue sending commands to me as private messages.");
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