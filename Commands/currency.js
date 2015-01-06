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

    //Name of the permission needed to use this command. All users have 'user.command.use' by default. Banned users have 'user.command.banned' by default.
    this.permissionName = 'user.command.use';

    //whether or not to allow this command in a private message.
    this.allowPm = true;

    //whether or not to only allow this command if it's in a private message.
    this.isPmOnly = false;
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
        if(err) { context.client.say(context, "There was an error converting "+self.from+" to "+self.to); return;}
        var rate = data.query.results.rate.Rate;
        var name= data.query.results.rate.Name;
        if(name === self.from+self.to+"=X") {context.client.say(context, "Either "+self.from+" or "+self.to+" does not exist!"); return;}
        context.client.say(context, self.amount+" "+name+": "+rate*self.amount);
    });
    return true;
};

module.exports = Currency;