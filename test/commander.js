"use strict";

var t = require('chai').assert;

module.exports = function (app, res) {
    return new Commander(app, res);
};

function Commander(app, res) {
    if (!(this instanceof Commander)) return new Commander(app);
    this.app = app;
    this.res = res || 'res';
}

Commander.prototype.command = function (command) {
    this._command = command;
    return this;
};

Commander.prototype.payload = function (payload) {
    this._payload = payload;
    return this;
};

Commander.prototype.end = function (cb) {
    this.app.handle({command: this._command || '', payload: this._payload || {}}, cb);
};

Commander.prototype.expect = function (res, cb) {
    var self = this;
    this.end(function (err, c) {
        if (err) return cb(err);
        t.deepEqual(c[self.res], res);
        cb();
    });
};