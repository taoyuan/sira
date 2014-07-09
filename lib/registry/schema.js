"use strict";

var util = require('util');
var JdbSchema = require('jugglingdb').Schema;
var proto = JdbSchema.prototype;

module.exports = Schema;

function Schema(name, settings) {
    JdbSchema.apply(this, arguments);
}

util.inherits(Schema, JdbSchema);

Schema.prototype.define = function (className, properties, settings) {
    this.emit('beforeDefine', className, properties, settings);
    return proto.define.call(this, className, properties, settings);
};