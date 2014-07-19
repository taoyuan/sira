"use strict";

var assert = require('assert');
var resolve = require('resolve');
var path = require('path');
var fs = require('fs');

module.exports = function (mod) {
    assert(mod, '`module` must not be null');
    var dir = path.resolve(mod);
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
        dir = path.dirname(resolve.sync(mod, { basedir: path.resolve('./') }));
    }

    var p, phases = [];
    p = path.join(dir, 'models');
    if (fs.existsSync(p)) {
        phases.push(require('./definitions')(p));
    }

    return phases;
};