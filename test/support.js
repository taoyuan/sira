"use strict";

var _ = require('lodash');
var chai = require('chai');
chai.config.includeStack = true;
var Schema = require('jugglingdb').Schema;
var MockApplication = require('./mocks/application');

var t = exports.t = chai.assert;

t.includeProperties = function (obj, properties, msg) {
    if (!obj) return t.notOk(properties, msg);
    if (!properties) return t.notOk(obj, msg);
    for (var prop in properties) {
        t.deepPropertyVal(obj, prop, properties[prop], msg);
    }
};

exports.mockApplication = function (props) {
    return _.assign(new MockApplication(), props);
};

exports.schema = function () {
    return new Schema('memory');
};

exports.command = function (name, payload) {
    return { command: name, payload: payload };
};
