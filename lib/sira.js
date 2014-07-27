"use strict";

var Application = require('./application');

var sira = module.exports = function () {
    return new Application();
};

sira.Application = Application;

sira.rekuest = require('./rekuest');

/**
 * Framework version.
 */
require('pkginfo')(module, 'version');

/**
 * Boot Phases
 */
sira.boot = {};
sira.boot.initializers = require('bootable').initializers;
sira.boot.database = require('./boot/database');
sira.boot.definitions = require('./boot/definitions');
sira.boot.module = require('./boot/module');