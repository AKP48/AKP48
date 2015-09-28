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

var YQL = require('yql');

function Currency() {
    //the name of the command.
    this.name = "Currency";

    //help text to show for this command.
    this.helpText = "Converts currency to other currency.";

    //usage message. only include the parameters. the command name will be automatically added.
    this.usageText = "[from currency] [to currency] [quantity]";

    //ways to call this command.
    this.aliases = ['currency', '$'];
}

Currency.prototype.execute = function(context) {
    var from = "USD";
    var to = "EUR";

    if(context.arguments[0]) {
        from = context.arguments[0].toUpperCase();
        to = "USD";
    }

    if(context.arguments[1]) {
        to = context.arguments[1].toUpperCase();
    }

    var query = new YQL('select * from yahoo.finance.xchange where pair in ("'+from+to+'")');

    var self = {};
    self.from = from;
    self.to = to;
    self.amount = 1;

    if(context.arguments[2]) {
        self.amount = parseFloat(context.arguments[2]);

        if(isNaN(self.amount)) {self.amount = 1;}
    }

    query.exec(function(err, data) {
        if(err) { context.AKP48.client.say(context.channel, "There was an error converting "+self.from+" to "+self.to); return;}
        var rate = data.query.results.rate.Rate;
        var name= data.query.results.rate.Name;
        if(name === self.from+self.to+"=X") {context.AKP48.client.say(context.channel, "Either "+self.from+" or "+self.to+" does not exist!"); return;}
        context.AKP48.client.say(context.channel, self.amount+" "+name+": "+rate*self.amount);
    });
    return true;
};

module.exports = Currency;
