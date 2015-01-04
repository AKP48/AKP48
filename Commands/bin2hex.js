function Bin2Hex() {
    //the name of the command.
    this.name = "Bin to Hex";

    //help text to show for this command.
    this.helpText = "Converts binary to hexadecimal.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<binary>";

    //ways to call this command.
    this.aliases = ['bin2hex', 'b2h'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
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
                context.client.say(context, "Cannot convert "+context.arguments.join(" ")+" to hex!");
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
                context.client.say(context, "Cannot convert "+context.arguments.join(" ")+" to hex!");
                return true;
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    context.client.say(context, context.arguments.join(" ")+" to hex: "+ret);
    return true;
};

module.exports = Bin2Hex;