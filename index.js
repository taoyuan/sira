"use strict";

var Application = require('./lib/application');

exports = module.exports = Application;

exports.Application = Application;

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

exports.boot = {};
exports.boot.handlers = require('./lib/boot/handlers');
exports.boot.database = require('./lib/boot/database');
exports.boot.models = require('./lib/boot/models');