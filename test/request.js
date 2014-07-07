"use strict";

var t = require('chai').assert;

module.exports = function (app, result) {
    return new Request(app, result);
};

function Request(app, result) {
    if (!(this instanceof Request)) return new Request(app);
    this.app = app;
    this.result = result || 'result';
}

Request.prototype.uri = function (uri) {
    this._uri = uri;
    return this;
};

Request.prototype.payload = function (payload) {
    this._payload = payload;
    return this;
};

Request.prototype.end = function (cb) {
    this.app.handle({uri: this._uri || '', payload: this._payload || {}}, cb);
};

Request.prototype.expect = function (result, cb) {
    var self = this;
    this.end(function (err, c) {
        if (err) return cb(err);
        t.deepEqual(c[self.result], result);
        cb();
    });
};