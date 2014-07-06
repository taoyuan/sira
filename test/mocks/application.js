"use strict";

module.exports = MockApplication;

function MockApplication() {
    this.__models = {};
    this.__definitions = {};
    this.__handlers = {};
}

MockApplication.prototype.__defineGetter__('models', function () {
    return this.__models;
});

MockApplication.prototype._handler = function(id) {
    var handler = this.__handlers[id];
    if (!handler) {
        throw new Error("Unable to create handler '" + id + "'");
    }
    return handler;
};

MockApplication.prototype.model = function(Model) {
    this.__models[Model.modelName] = Model;
};
