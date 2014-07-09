"use strict";

var Registry = require('../../lib/registry');

module.exports = MockApplication;

function MockApplication() {
    this.registry = new Registry(this);
    this.models = this.registry.models;
}