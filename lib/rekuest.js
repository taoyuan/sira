"use strict";

var _ = require('lodash');
var Request = require('./request');

var proto = {};

exports = module.exports = function (uri, params, payload) {
    var builder = Object.create(proto);
    builder.req = Request.create(uri, params, payload);
    return builder;
};

proto.forContext = function () {
    this._forContext = true;
    return this;
};

proto.props = function (source) {
    var self = this;
    _.forEach(source, function (value, key) {
        if (typeof value === 'function' || key[0] === '_') return;
        self.req[key] = value;
    });

    return this;
};

proto.prop = function (name, value) {
    this.req[name] = value;
    return this;
};

proto.params = function (params) {
    this.req.params = params;
    return this;
};

proto.payload = function (payload) {
    this.req.payload = payload;
    return this;
};

proto.request = function (fn) {
    if (typeof fn === "function") fn(this.req);
    return this;
};

proto.send = function (app, done) {
    if (this._forContext) {
        return app.handle(this.req, done);
    } else {
        return app.handle(this.req, function (err, ctx) {
            if (err && !done) throw err;
            done && done(err, ctx && ctx.result);
        });
    }
};
