"use strict";

var assert = require('assert');
var resolve = require('resolve');
var path = require('path');
var fs = require('fs');

module.exports = function (component) {
    assert(component, '`component` must not be null');
    var mpath = resolve.sync(component, { basedir: path.resolve('./') });
    var mdir = path.dirname(mpath);
//    var mod = require(mpath);
    var p, phases = [];

    p = path.join(mdir, 'models');
    if (fs.existsSync(p)) {
        phases.push(require('./definitions')(p));
    }

    return phases;
};