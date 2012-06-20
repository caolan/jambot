#!/usr/bin/env node

process.title = 'jambot';


var path = require('path'),
    events = require('events'),
    config = require('../config'),
    logger = require('./logger'),
    irc = require('./irc');


logger.level = config.log_level || logger.level;


// event emitter instance global to all plugins
var ev = new events.EventEmitter();

// instance passed to plugin
function Bot(plugin) {
    this.plugin = plugin;
    this.config = config;
    this.ev = ev;
}
Bot.prototype.emit = function () {
    ev.emit.apply(ev, arguments);
};
Bot.prototype.on = function () {
    ev.on.apply(ev, arguments);
};
Bot.prototype.error = function (err) {
    logger.error(this.plugin, err);
    this.emit('error', this.plugin, err);
};
Bot.prototype.info = function (err) {
    logger.info(this.plugin, err);
    this.emit('info', this.plugin, err);
};
Bot.prototype.debug = function (err) {
    logger.debug(this.plugin, err);
    this.emit('debug', this.plugin, err);
};
Bot.prototype.warning = function (err) {
    logger.warning(this.plugin, err);
    this.emit('warning', this.plugin, err);
};
Bot.prototype.say = function (to, msg) {
    this.emit('say', to, msg);
};


// load basic services
irc.init(new Bot('irc'));

if (config.plugins) {
    // load plugins
    for (var name in config.plugins) {
        var module = require(
            path.resolve(__dirname, '..', config.plugins[name])
        );
        module.init(new Bot(name));
    }
}
else {
    logger.warning('No plugins loaded');
}
