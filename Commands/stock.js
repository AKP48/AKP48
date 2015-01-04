var c = require('irc-colors');
var n = require('numeral');
var YQL = require('yql');

function Stock() {
    //the name of the command.
    this.name = "Stock";

    //help text to show for this command.
    this.helpText = "Shows stock information.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "<symbol>";

    //ways to call this command.
    this.aliases = ['stock'];

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;

    //whether this command requires operator privileges.
    this.requireOp = false;
}

Stock.prototype.execute = function(context) {
    if(!context.arguments[0]) { return false; }

    var symbol = context.arguments[0];

    var query = new YQL('select * from yahoo.finance.quote WHERE symbol=\''+symbol+'\' LIMIT 1');

    var self = {};
    self.symbol = symbol;

    query.exec(function(err, data) {
        if(err) { context.client.say(context.channel, "There was an error getting information for "+self.symbol+"."); return true;}
        if(data.query.results === null) {context.client.say(context.channel, "There was an error getting information for "+self.symbol+"."); return true;}

        var quote = data.query.results.quote;
        var change = parseFloat(quote.Change);
        var symbol = quote.Symbol;
        var price = parseFloat(quote.LastTradePriceOnly);

        if(isNaN(change) || isNaN(price)) {
            context.client.say(context.channel, "There was an error getting information for "+self.symbol+".");
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
            outputString += change+" "+"("+percent+")";
        }

        context.client.say(context, outputString);
    });
    return true;
};

module.exports = Stock;