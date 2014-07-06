"use strict";

var Application = require('./application');

var sira = module.exports = Application;

sira.Application = Application;

sira.remoteMethod = function (fn, options) {
    fn.shared = true;
    if (typeof options === 'object') {
        Object.keys(options).forEach(function (key) {
            fn[key] = options[key];
        });
    }
    fn.http = fn.http || {verb: 'get'};
};

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

sira.boot = {};
sira.boot.handlers = require('./boot/handlers');
sira.boot.database = require('./boot/database');
sira.boot.definitions = require('./boot/definitions');
sira.boot.component = require('./boot/component');