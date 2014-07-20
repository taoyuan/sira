"use strict";

var _ = require('lodash');

module.exports = Request;

function Request(uri, payload) {
    if (!(this instanceof Request)) return new Request(uri, payload);

    this.uri = uri;
    this.payload = payload || {};
}

Request.create = function (uri) {
    if (typeof uri === 'object') {
        return new Request(uri.uri, uri.payload);
    }

    var args, payload;
    if (arguments.length > 1) {
        args = [{}].concat([].slice.call(arguments, 1));
        payload = _.assign.apply(_, args);
    }
    return new Request(uri, payload);
};

Request.prototype.param = function (name, defaultValue) {
    var payload = this.payload || {};
    return payload[name] != undefined ? payload[name] : defaultValue;
};
