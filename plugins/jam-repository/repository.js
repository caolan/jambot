var follow = require('follow');


exports.init = function (bot) {
    var cfg = bot.config['jam-repository'];
    if (!cfg) {
        return bot.error('Missing repository property in config');
    }
    if (!cfg.db) {
        return bot.error('Missing repository.db property in config');
    }

    var opts = {
        db: cfg.db,
        include_docs: true,
        since: 'now'
    };

    bot.info('starting follow');
    follow(opts, function (err, change) {
        if (err) {
            return bot.error(err);
        }
        var doc = change.doc;
        if (doc && doc.type === 'package') {
            var msg = '[repository] ';
            var a = doc.activity[doc.activity.length - 1];
            msg += [
                a.user, a.action, doc.name, '(' + a.version + ')'
            ].join(' ');
            bot.say(msg);
        }
    });
};
