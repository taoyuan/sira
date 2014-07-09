"use strict";

var s = require('./support');
var t = s.t;

var Registry = require('../lib/registry');

describe('registry', function () {

    var reg, definitions, models;
    beforeEach(function () {
        reg = new Registry();
        definitions = reg.definitions;
    });

    it('should define model', function () {
        var ModelDef = reg.define('Model');
        t.equal(ModelDef, definitions['Model'])
    });

    it('should apply to schema', function () {
        reg.define('Model');
        var schema = reg.build()[0];
        models = reg.models;
        t.ok(models['Model']);
        t.ok(schema.models['Model']);
        t.equal(models['Model'], schema.models['Model']);
    });
});