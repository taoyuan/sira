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

proto.prop = function (name, value) {
    this.req[name] = value;
    return this;
};

proto.payload = function (payload) {
    this.req.payload = payload;
    return this;
};

proto.send = function (app, done) {
    app.handle(this.req, done);
};

proto.end = function (fn) {
    if (typeof fn === "function") fn(this.req);
    return this.req;
};