"use strict";

module.exports = MockApplication;

function MockApplication() {
    this.models = {};
    this.__definitions = {};
    this.__handlers = {};
}

MockApplication.prototype._handler = function(id) {
    var handler = this.__handlers[id];
    if (!handler) {
        throw new Error("Unable to create handler '" + id + "'");
    }
    return handler;
};
