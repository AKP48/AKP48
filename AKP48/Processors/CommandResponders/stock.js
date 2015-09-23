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
}

Stock.prototype.execute = function(context) {
    if(!context.arguments[0]) { return false; }

    var symbol = context.arguments[0];

    var query = new YQL('select * from yahoo.finance.quote WHERE symbol=\''+symbol+'\' LIMIT 1');

    var self = {};
    self.symbol = symbol;

    query.exec(function(err, data) {
        if(err) { context.getClient().say(context, "There was an error getting information for "+self.symbol+"."); return true;}
        if(data.query.results === null) {context.getClient().say(context, "There was an error getting information for "+self.symbol+"."); return true;}

        var quote = data.query.results.quote;
        var change = parseFloat(quote.Change);
        var symbol = quote.Symbol;
        var price = parseFloat(quote.LastTradePriceOnly);

        if(isNaN(change) || isNaN(price)) {
            context.getClient().say(context, "There was an error getting information for "+self.symbol+".");
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

        context.getClient().say(context, outputString);
    });
    return true;
};

module.exports = Stock;