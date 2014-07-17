"use strict";

module.exports = expose;

function expose(fn, options) {
    fn.shared = true;
    if (typeof options === 'object') {
        Object.keys(options).forEach(function (key) {
            fn[key] = options[key];
        });
    }
    fn.http = fn.http || {verb: 'get'};

}

expose.model = require('./model');
