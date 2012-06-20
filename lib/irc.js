var irc = require('irc');


exports.init = function (bot) {
    var server = bot.config.irc.server;
    var nick = bot.config.irc.nick;
    var client = new irc.Client(server, nick, bot.config.irc);

    bot.on('say', function (to, message) {
        if (message === undefined) {
            message = to;
            to = bot.config.irc.channels;
        }
        if (Array.isArray(to)) {
            to.forEach(function (t) {
                bot.debug('saying to ' + t + ': ' + message);
                client.say(t, message);
                bot.emit('irc::say', nick, t, message);
            });
        }
        else {
            bot.debug('saying to ' + to + ': ' + message);
            client.say(to, message);
            bot.emit('irc::say', nick, to, message);
        }
    });

    client.on('message', function (from, to, message) {
        bot.debug(from + ' => ' + to + ': ' + message);
        bot.emit('irc::message', from, to, message);
        // TODO: if starts with nick: then bot.emit('msg', ...)
        // and add bot.respond(regex, callback) method
    });
    client.on('topic', function (channel, topic, by) {
        bot.debug('topic changed in ' + channel + ' by ' + by + ': ' + topic);
        bot.emit('irc::topic', channel, topic, by);
    });
    client.on('join', function (channel, who) {
        if (who === nick) {
            bot.info('joined ' + channel);
        }
        else {
            bot.debug(who + ' joined ' + channel);
        }
        bot.emit('irc::join', channel, who);
    });
    client.on('part', function (channel, who, reason) {
        bot.debug(who + ' left ' + channel);
        bot.emit('irc::part', channel, who, reason);
    });
    client.on('kick', function (channel, who, by, reason) {
        bot.debug(by + ' kicked ' + who + ' from ' + channel + ': ' + reason);
        bot.emit('irc::kick', channel, who, by, reason);
    });
    client.on('quit', function (who, reason, channels) {
        bot.debug(who + ' quit');
        bot.emit('irc::quit', who, reason, channels);
    });
    client.on('pm', function (from, message) {
        bot.info('pm from: ' + from + ': ' + message);
        bot.emit('irc::pm', from, message);
    });
    client.on('connect', function () {
        bot.info('connected to ' + server + ' as ' + nick);
        bot.emit('irc::connect', server, nick);
    });
    client.on('error', function (message) {
        bot.error(message);
    });
    client.on('registered', function (message) {
        bot.info('registered');
    });
};
