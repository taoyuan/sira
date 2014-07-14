"use strict";

var proto = {};

module.exports = function (uri, payload) {
    var builder = Object.create(proto);

    if (typeof uri === 'object') {
        builder.req = uri
    } else {
        builder.req = {
            uri: uri,
            payload: payload
        };
    }
    return builder;
};

proto.forContext = function () {
    this._forContext = true;
    return this;
};

proto.prop = function (name, value) {
    this.req[name] = value;
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
        app.handle(this.req, done);
    } else {
        app.handle(this.req, function (err, ctx) {
            if (err && !done) throw err;
            done && done(err, ctx && ctx.result);
        });
    }
};
