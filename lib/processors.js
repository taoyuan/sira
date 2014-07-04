"use strict";

module.exports = Processors;

function Processors() {
    if (!(this instanceof Processors)) return new Processors();
    this.handlers = [];
}

Processors.prototype.add = function (fn) {
    this.handlers.push(fn);
};

Processors.prototype.process = function (thisArg) {
    for (var i = 0; i < this.handlers.length; i++) {
        this.handlers[i].call(thisArg);
    }
    this.handlers = [];
};