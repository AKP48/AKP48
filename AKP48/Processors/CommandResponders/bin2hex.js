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

function Bin2Hex() {
    //the name of the command.
    this.name = "Bin to Hex";

    //help text to show for this command.
    this.helpText = "Converts binary to hexadecimal.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<binary>";

    //ways to call this command.
    this.aliases = ['bin2hex', 'b2h'];
}

Bin2Hex.prototype.execute = function(context) {
    if(!context.arguments[0]) {return;}

    var s = context.arguments.join();

    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                context.AKP48.say(context.channel, "Cannot convert "+context.arguments.join(" ")+" to hex!");
                return true;
            }
            // compute the length 4 substring
            accum = accum * 2 + parseInt(part[k], 10);
        }
        if (accum >= 10) {
            // 'A' to 'F'
            ret = String.fromCharCode(accum - 10 + 'A'.charCodeAt(0)) + ret;
        } else {
            // '0' to '9'
            ret = String(accum) + ret;
        }
    }
    // remaining characters, i = 0, 1, or 2
    if (i >= 0) {
        accum = 0;
        // convert from front
        for (k = 0; k <= i; k += 1) {
            if (s[k] !== '0' && s[k] !== '1') {
                context.AKP48.say(context.channel, "Cannot convert "+context.arguments.join(" ")+" to hex!");
                return true;
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    context.AKP48.say(context.channel, context.arguments.join(" ")+" to hex: "+ret);
    return true;
};

module.exports = Bin2Hex;
