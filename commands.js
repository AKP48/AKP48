var c = require('irc-colors');
var config = require('./config.json');
var chance = new require('chance')();
var Google = require('./google');
var Riot = require('./riot');
var fs = require('fs');
var YQL = require('yql');
var request = require('request-json');
var n = require('numeral');
var moment = require('moment');
var Sandbox = require("sandbox");
var s = new Sandbox();

function Commands() {
    this.google = new Google(config.google.apiKey);
    this.riot = new Riot(config.riot.apiKey);
    this.slogans = [];
    this.larts = [];
}

Commands.prototype.lmgtfy = function(nick, args, client, channel) {
    var query = args.join(' ');
    query = encodeURIComponent(query);
    this.google.shorten_url("http://lmgtfy.com/?q="+query, function(url) {
        client.getIRCClient().say(channel, nick + ": " + url);
    });
};

Commands.prototype.googl = function(nick, args, client, channel) {
    this.google.shorten_url(args[0], function(url) {
        client.getIRCClient().say(channel, nick + ": " + url);
    });
}

Commands.prototype.geocode = function(nick, args, client, channel) {
    if(args[0] === undefined || args[0].length === 0) {
        return;
    }

    var location = args.join(" ");
    var region = "";

    if(args[1]) {
        location = args.slice(0, args.length - 1).join(" ");
        if(args[args.length - 1].length === 2) {
            region = args[args.length - 1];
        } else {
            location += " "+args[args.length - 1];
        }
    }

    this.google.geocode(location, region, function(msg){
        client.getIRCClient().say(channel, msg);
    });
}

Commands.prototype.googlesearch = function(nick, args, client, channel) {
    this.google.search(args.join(" "), "web", function(msg) {
        client.getIRCClient().say(channel, nick + ": " + msg);
    });
};

Commands.prototype.googleimages = function(nick, args, client, channel) {
    this.google.search(args.join(" "), "images", function(msg){
        client.getIRCClient().say(channel, nick + ": " + msg);
    });
};

Commands.prototype.lolfreechamps = function(nick, args, client, channel) {
    this.riot.getFreeChamps(function(msg){
        client.getIRCClient().say(channel, nick + ": " + msg);
    });
};

Commands.prototype.lolserverstatus = function(nick, args, client, channel) {
    var region = "na";
    if(args[0]) {region = args[0];}
    this.riot.getServerStatus(region, function(msg) {
        client.getIRCClient().say(channel, nick + ": " + msg);
    });
};

Commands.prototype.dotafreeheroes = function(nick, args, client, channel) {
    client.getIRCClient().say(channel, nick + ": All of them.");
};

Commands.prototype.dice = function(nick, args, client, channel) {
    var numberOfRolls;
    var numberOfSides;

    if(args[0] === undefined) {
        numberOfRolls = 1;
    } else {
        numberOfRolls = parseInt(args[0]);

        if(isNaN(numberOfRolls)) {numberOfRolls = 1}
    }

    if(args[1] === undefined) {
        numberOfSides = 6;
    } else {
        numberOfSides = parseInt(args[1]);

        if(isNaN(numberOfSides)) {numberOfSides = 6}
    }

    if(numberOfSides > 500) {numberOfSides = 500;}
    if(numberOfRolls > 50) {numberOfRolls = 50;}

    var rolls = [];

    for (var i = 0; i < numberOfRolls; i++) {
        rolls.push(Math.floor(Math.random() * (numberOfSides)) + 1);
    };

    var outputString = nick + ": ";

    for (var i = 0; i < rolls.length; i++) {
        outputString += rolls[i] + " | ";
    };

    outputString = outputString.substring(0, outputString.length - 3);

    if(numberOfSides == 2) {
        outputString = outputString.replace(/1/g, 'H');
        outputString = outputString.replace(/2/g, 'T');
    }

    if(numberOfSides < 2) {
        outputString = nick + ": ಠ_ಠ";
    }

    client.getIRCClient().say(channel, outputString);
};

Commands.prototype.roll = function(nick, args, client, channel) {
    var diceRegEx = /^(?:roll(?= *[^+ ]))(?: *(?: |\+) *(?:\d*[1-9]\d*|(?=d))(?:d\d*[1-9]\d*(?:x\d*[1-9]\d*)?)?)+ *$/gi;
    var diceRollRegEx = /[ +](\d+|(?=d))(?:d(\d+)(?:x(\d+))?)?(?= *(\+| |$))/gi;

    //too lazy to change regex
    var msg = "roll "+args.join(" ");
    var result;
    var dice = [];

    var countLimited = false;

    //for each group
    while((di = diceRegEx.exec(msg)) !== null) {
        //for each dice
        while((result = diceRollRegEx.exec(di)) !== null) {
            //parse out each value
            var count = (parseInt(result[1]) != 0) ? parseInt(result[1]) : 1;
            if(isNaN(count)) {count = 1;}
            if(count > 1000000) {count = 1000000; countLimited = true;}

            var maxValue = (parseInt(result[2]) != 0) ? parseInt(result[2]) : 1;
            if(isNaN(maxValue)) {maxValue = 1;}

            var multiplier = (parseInt(result[3]) != 0) ? parseInt(result[3]) : 1;
            if(isNaN(multiplier)) {multiplier = 1;}

            var isFinalValue = !("+" === result[4]);

            //add to array
            dice.push({
                count: count,
                maxValue: maxValue,
                multiplier: multiplier,
                isFinalValue: isFinalValue
            });
        }
    }

    var rolls = [];
    var roll = 0;

    //for each di
    for (var i = 0; i < dice.length; i++) {
        //for count of di
        for(var j = 0; j < dice[i].count; j++) {
            //add dice result to roll.
            roll += chance.natural({min: 1, max: dice[i].maxValue}) * dice[i].multiplier;
        }

        //if this was the last di in this group
        if(dice[i].isFinalValue) {
            //push & reset the roll
            rolls.push(roll);
            roll = 0;
        }
    }

    var outputString = "";

    //format output
    for (var i = 0; i < rolls.length; i++) {
        outputString += n(rolls[i]).format("0,0") + " | ";
    };

    outputString = outputString.substring(0, outputString.length-3);

    if(countLimited) {outputString += " | (Dice counts limited to 1,000,000.)"}

    //output string to IRC
    client.getIRCClient().say(channel, nick + ": " + outputString);
};

Commands.prototype.convert = function(nick, args, client, channel) {
    var tempRegEx = /^(-?\d+(?:\.\d+)?)°?([cf])$/gi;
    var msg = args.join(" ");

    var temp = parseFloat(msg.replace(tempRegEx, "$1"));
    var tempTemp = msg.replace(tempRegEx, "$1");
    var unit = msg.replace(tempRegEx, "$2");
    var places = "0".repeat((tempTemp.indexOf(".") != -1) ? Math.min(Math.max(tempTemp.length - 1 - tempTemp.indexOf("."), 2), 20) : 2);

    if(unit === "c") {
        try {
            client.getIRCClient().say(channel, nick + ": " + temp+"°C is "+n((temp*9/5) + 32).format("0[.]"+places)+"°F.");
        } catch(e) {
            client.getIRCClient().say(channel, nick + ": " + "Could not convert "+temp+"°C to Fahrenheit!");
        }
        return;
    }

    if(unit === "f") {
        try {
            client.getIRCClient().say(channel, nick + ": " + temp+"°F is "+n((temp - 32)*5/9).format("0[.]"+places)+"°C.");
        } catch(e) {
            client.getIRCClient().say(channel, nick + ": " + "Could not convert "+temp+"°F to Fahrenheit!");
        }
        return;
    }

    if(unit === "k") {
        client.getIRCClient().say(channel, nick + ": " + "I'm a Korean Pop group, not a scientist.");
    }
};

Commands.prototype.daft = function(nick, args, client, channel) {
    if(args[0] !== undefined) {
        client.getIRCClient().say(channel, args.join(" ") + ", are you daft?");
    } else {
        client.getIRCClient().say(channel, nick + ", are you daft?");
    }
};

Commands.prototype.slogan = function(nick, args, client, channel) {
    var object = nick;

    if(args[0] !== undefined) {
        object = args.join(" ");
    }

    if(!this.slogans.length) {
        var self = this;
        fs.readFile('./data/slogans.txt', function(err, data) {
            if(err) {console.error(err);}
            self.slogans = data.toString().split("\n");
            var item = self.slogans[Math.floor(Math.random()*self.slogans.length)];
            client.getIRCClient().say(channel, item.replace(/<text>/g, object));
        });
    } else {
        var item = this.slogans[Math.floor(Math.random()*this.slogans.length)];
        client.getIRCClient().say(channel, item.replace(/<text>/g, object));
    }
};

Commands.prototype.lart = function(nick, args, client, channel) {
    var object = nick;

    if(args[0] !== undefined) {
        object = args.join(" ");
    }

    if(!this.larts.length) {
        var self = this;
        fs.readFile('./data/lart.txt', function(err, data) {
            if(err) {console.error(err);}
            self.larts = data.toString().split("\n");
            var item = self.larts[Math.floor(Math.random()*self.larts.length)];
            client.getIRCClient().say(channel, nick + " " + item.replace(/\{user\}/g, object));
        });
    } else {
        var item = this.larts[Math.floor(Math.random()*this.larts.length)];
        client.getIRCClient().say(channel, nick + " " + item.replace(/\{user\}/g, object));
    }
};

Commands.prototype.かわいい = function(nick, args, client, channel) {
    client.getIRCClient().say(channel, "ですですですですです。　：３");
};

Commands.prototype.bitcoin = function(nick, args, client, channel) {
    arguments = ['BTC', 'USD', '1'];

    if(args[0]) {
        arguments[1] = args[0];
    }

    if(args[1]) {
        arguments[2] = args[1];
    }

    //just piggy-back on the currency function a bit.
    this.currency(nick, arguments, client, channel);
};

Commands.prototype.currency = function(nick, args, client, channel) {
    var from = "USD";
    var to = "EUR";

    if(args[0]) {
        from = args[0].toUpperCase();
        to = "USD";
    }

    if(args[1]) {
        to = args[1].toUpperCase();
    }

    var query = new YQL('select * from yahoo.finance.xchange where pair in ("'+from+to+'")');

    var self = {};
    self.client = client;
    self.channel = channel;
    self.nick = nick;
    self.from = from;
    self.to = to;
    self.amount = 1;

    if(args[2]) {
        self.amount = parseFloat(args[2]);

        if(isNaN(self.amount)) {self.amount = 1;}
    }

    query.exec(function(err, data) {
        if(err) { self.client.getIRCClient().say(self.channel, self.nick + ": There was an error converting "+self.from+" to "+self.to); return;}
        var rate = data.query.results.rate.Rate;
        var name= data.query.results.rate.Name;
        if(name === self.from+self.to+"=X") {self.client.getIRCClient().say(self.channel, self.nick + ": Either "+self.from+" or "+self.to+" does not exist!"); return;}
        self.client.getIRCClient().say(self.channel, self.nick + ": "+self.amount+" "+name+": "+rate*self.amount);
    });
};

Commands.prototype.stock = function(nick, args, client, channel) {

    if(!args[0]) { return; }

    var symbol = args[0];

    var query = new YQL('select * from yahoo.finance.quote WHERE symbol=\''+symbol+'\' LIMIT 1');

    var self = {};
    self.client = client;
    self.channel = channel;
    self.nick = nick;
    self.symbol = symbol;

    query.exec(function(err, data) {
        if(err) { self.client.getIRCClient().say(self.channel, "There was an error getting information for "+self.symbol+"."); return;}
        if(data.query.results === null) {self.client.getIRCClient().say(self.channel, "There was an error getting information for "+self.symbol+"."); return;}

        var quote = data.query.results.quote;
        var change = parseFloat(quote.Change);
        var symbol = quote.Symbol;
        var price = parseFloat(quote.LastTradePriceOnly);

        if(isNaN(change) || isNaN(price)) {
            self.client.getIRCClient().say(self.channel, "There was an error getting information for "+self.symbol+".");
            return;
        }

        var percent = change / (price - change);

        percent = n(percent).format('0.00%');

        var outputString = symbol + " "+ price + " ";

        if(change < 0) {
            outputString += c.red(change+" ▼ "+"("+percent+" ▼)");
        }

        if(change > 0) {
            outputString += c.green(change+" ▲ "+"("+percent+" ▲)");
        }

        if(change === 0) {
            outputString += change+" "+"("+percent+" )";
        }

        self.client.getIRCClient().say(self.channel, outputString);
    });
};

Commands.prototype.minecraftserverstatus = function(nick, args, client, channel) {
    var apiClient = request.newClient("https://status.mojang.com/");

    var self = {};
    self.client = client;
    self.nick = nick;
    self.channel = channel;

    apiClient.get("/check", function(err, res, body) {
        if(err) {self.client.getIRCClient().say(self.channel, "There was an error retrieving the Minecraft server status!"); return;}
        var skins = body[4]['skins.minecraft.net'];
        var auth = body[3]["auth.mojang.com"];
        var session = body[1]["session.minecraft.net"];
        var website = body[0]["minecraft.net"];

        var outputString = "Minecraft Server Status: ";

        switch(website) {
            case "green":
                outputString += c.green("Website: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Website: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Website: Offline")+" | ";
        }

        switch(auth) {
            case "green":
                outputString += c.green("Auth Server: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Auth Server: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Auth Server: Offline")+" | ";
        }

        switch(session) {
            case "green":
                outputString += c.green("Session Server: Online")+" | ";
                break;
            case "yellow":
                outputString += c.yellow("Session Server: Having Trouble")+" | ";
                break;
            case "red":
                outputString += c.red("Session Server: Offline")+" | ";
        }

        switch(skins) {
            case "green":
                outputString += c.green("Skins: Online");
                break;
            case "yellow":
                outputString += c.yellow("Skins: Having Trouble");
                break;
            case "red":
                outputString += c.red("Skins: Offline");
        }

        self.client.getIRCClient().say(self.channel, outputString);
    });
};

Commands.prototype.mcnamehistory = function(nick, args, client, channel) {
    var apiClient = request.newClient("https://api.mojang.com/");

    if(!args[0]) {return;}

    var name = args[0];

    var self = {};
    self.client = client;
    self.nick = nick;
    self.channel = channel;
    self.name = name;
    self.apiClient = apiClient;

    apiClient.get("/users/profiles/minecraft/"+name, function(err, res, body) {
        if(err || body.error == "Not Found") {self.client.getIRCClient().say(self.channel, "There is no player with the name "+self.name+"!"); return;}

        self.apiClient.get("/user/profiles/"+body.id+"/names", function(error, response, bodyy) {
            if(error || body.error == "Not Found") {self.client.getIRCClient().say(self.channel, "There was an error finding previous names for "+self.name+"!"); return;}

            var outputString = "Previous names found for "+self.name+": ";
            for (var i = bodyy.length - 1; i >= 0; i--) {
                outputString += bodyy[i] + " | ";
            };

            outputString = outputString.substring(0, outputString.length - 3);
            self.client.getIRCClient().say(self.channel, outputString);
        });
    });
};

Commands.prototype.bin2hex = function(nick, args, client, channel) {
    if(!args[0]) {return;}

    var s = args.join();

    var i, k, part, accum, ret = '';
    for (i = s.length-1; i >= 3; i -= 4) {
        // extract out in substrings of 4 and convert to hex
        part = s.substr(i+1-4, 4);
        accum = 0;
        for (k = 0; k < 4; k += 1) {
            if (part[k] !== '0' && part[k] !== '1') {
                // invalid character
                client.getIRCClient().say(channel, "Cannot convert "+args.join(" ")+" to hex!");
                return;
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
                client.getIRCClient().say(channel, "Cannot convert "+args.join(" ")+" to hex!");
                return;
            }
            accum = accum * 2 + parseInt(s[k], 10);
        }
        // 3 bits, value cannot exceed 2^3 - 1 = 7, just convert
        ret = String(accum) + ret;
    }
    client.getIRCClient().say(channel, args.join(" ")+" to hex: "+ret);
};

Commands.prototype.hex2bin = function(nick, args, client, channel) {
    if(!args[0]) {return;}

    var s = args.join();

    var i, k, part, ret = '';
    // lookup table for easier conversion. '0' characters are padded for '1' to '7'
    var lookupTable = {
        '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
        '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
        'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
        'e': '1110', 'f': '1111',
        'A': '1010', 'B': '1011', 'C': '1100', 'D': '1101',
        'E': '1110', 'F': '1111'
    };
    for (i = 0; i < s.length; i += 1) {
        if (lookupTable.hasOwnProperty(s[i])) {
            ret += lookupTable[s[i]];
        } else {
            client.getIRCClient().say(channel, "Cannot convert "+args.join(" ")+" to binary!");
            return;
        }
    }
    client.getIRCClient().say(channel, args.join(" ")+" to binary: "+ret);
};

Commands.prototype.uptime = function(nick, args, client, channel) {
    client.getIRCClient().say(channel, "I've been up for "+moment.duration(process.uptime(), "seconds").humanize());
};

Commands.prototype.rainbow = function(nick, args, client, channel) {
    var msg = args.join(' ');
    client.getIRCClient().say(channel, c.rainbow(msg));
}

Commands.prototype.g = function(nick, args, client, channel) {
    this.googlesearch(nick, args, client, channel);
};

Commands.prototype.search = function(nick, args, client, channel) {
    this.googlesearch(nick, args, client, channel);
};

Commands.prototype.b2h = function(nick, args, client, channel) {
    this.bin2hex(nick, args, client, channel);
};

Commands.prototype.h2b = function(nick, args, client, channel) {
    this.hex2bin(nick, args, client, channel);
};

Commands.prototype.gi = function(nick, args, client, channel) {
    this.googleimages(nick, args, client, channel);
};

Commands.prototype.image = function(nick, args, client, channel) {
    this.googleimages(nick, args, client, channel);
};

Commands.prototype.r = function(nick, args, client, channel) {
    this.rainbow(nick, args, client, channel);
};

Commands.prototype.help = function(nick, args, client, channel) {
    client.getIRCClient().say(channel, "For help, visit http://akpwebdesign.com/PwnedBot/help.html");
};

Commands.prototype.halp = function(nick, args, client, channel) {
    this.help(nick, args, client, channel);
};

Commands.prototype.btc = function(nick, args, client, channel) {
    this.bitcoin(nick, args, client, channel);
};

Commands.prototype.$ = function(nick, args, client, channel) {
    this.currency(nick, args, client, channel);
};

Commands.prototype.mcserverstatus = function(nick, args, client, channel) {
    this.minecraftserverstatus(nick, args, client, channel);
};

Commands.prototype.mcstatus = function(nick, args, client, channel) {
    this.mcserverstatus(nick, args, client, channel);
};

Commands.prototype.js = function(nick, args, client, channel) {
    var self = {};
    self.client = client;
    self.nick = nick;
    self.channel = channel;

    s.run( args.join(" "), function(output) {
        var outputString = nick+": ";
        if(output.result) {
            outputString += output.result + "; ";
        }
        if(output.console) {
            outputString += "Console: " + JSON.stringify(output.console);
        }

        if(outputString.length > 430) {
            outputString = outputString.substring(0, 420) + "...";
        }
        self.client.getIRCClient().say(channel, outputString);
    });
};

Commands.prototype.op = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.setOp(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Opped "+args.join(", "));
    }
}

Commands.prototype.ban = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.setBanned(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Banned "+args.join(", "));
    }
};

Commands.prototype.deop = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.deop(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Deopped "+args.join(", "));
    }
}

Commands.prototype.unban = function(nick, args, client, channel, op) {
    if(op) {
        for (var i = 0; i < args.length; i++) {
            client.unban(args[i]);
        };
        client.clientManager.saveConfig();
        client.getIRCClient().say(channel, "Unbanned "+args.join(", "));
    }
}

Commands.prototype.nick = function(nick, args, client, channel, op, pm) {
    if(op && pm && args[0]) {
        client.getIRCClient().send("NICK", args[0]);
        client.nick = args[0];
    }
}

Commands.prototype.reload = function(nick, args, client, channel, op, pm) {
    if(op && pm) {
        delete require.cache[__dirname+'/commandprocessor.js'];
        delete require.cache[__dirname+'/autoresponse.js'];
        delete require.cache[__dirname+'/commands.js'];
        delete require.cache[__dirname+'/chatter.js'];
        delete require.cache[__dirname+'/google.js'];
        delete require.cache[__dirname+'/riot.js'];

        client.getIRCClient().say(nick, "All channels reloading!");
        client.clientManager.reloadAll();
    }
}

Commands.prototype.addserver = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 6) {
        client.getIRCClient().say(nick, "Usage: addServer <name> <serverAddress> <nick> <channel> <mcBotName> <commandDelimiter>");
        return;
    }

    var created = client.clientManager.createClient({
                    name: args[0],
                    server: args[1],
                    nick: args[2],
                    ops: [nick],
                    banned: [],
                    channels: [args[3]],
                    mcBot: args[4],
                    delimiter: args[5],
                });

    client.clientManager.saveConfig();

    if(!created) {
        client.getIRCClient().say(nick, "There was a problem creating the client!");
    } else {
        client.getIRCClient().say(nick, "Client created!");
    }

};

Commands.prototype.addchannel = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 1) {
        client.getIRCClient().say(nick, "Usage: addChannel <channelName>");
        return;
    }

    client.addChannel(args[0]);
};

Commands.prototype.removechannel = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    if(args.length !== 1) {
        client.getIRCClient().say(nick, "Usage: removeChannel <channelName>");
        return;
    }

    client.removeChannel(args[0]);
};

Commands.prototype.disconnect = function(nick, args, client, channel, op, pm) {
    if(!pm || !op) {
        return;
    }

    var msg = "Goodbye.";

    if(args[0]) {
        msg = args.join(" ");
    }

    client.getIRCClient().say(nick, "Disconnecting! ("+msg+")");

    client.clientManager.removeClient(client, msg);
};

Commands.prototype.sendmessage = function(nick, args, client, channel, op, pm) {
    if(args[0] !== undefined) {
        for (var i = 0; i < client.clientManager.clients.length; i++) {
            for (var k = client.clientManager.clients[i].channels.length - 1; k >= 0; k--) {
                client.clientManager.clients[i].getIRCClient().say(client.clientManager.clients[i].channels[k], args.join(" "));
            };
        };
    }
};

Commands.prototype.changeDelimiter = function(nick, args, client, channel, op, pm) {
    if(args[0]) {
        console.log(args[0]);
        client.delimiter = args[0];
        client.clientManager.saveConfig();
        client.getIRCClient().say(nick, "Delimiter changed!");
        console.log("Delimiter changed! -> "+args[0]);
    } else {
        client.getIRCClient().say(nick, "Usage: changeDelimiter <newDelimiter>");
    }
};

Commands.prototype.restart = function(nick, args, client, channel, op, pm) {
    if(!op || !pm) {
        return;
    }

    var msg = "Goodbye.";

    if(args[0]) {
        msg = args.join(" ");
    }

    client.clientManager.shutdown(msg);
};

//export the module
module.exports = Commands;