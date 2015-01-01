require('fs').readdirSync(__dirname + '/').forEach(function(file) {
    if (file.match(/.+\.js/g) !== null && file !== 'index.js') {
        var name = file.replace('.js', '');
        var loadModule = require('./' + file);
        var tempModule = new loadModule();

        exports[name] = tempModule;
    }
});