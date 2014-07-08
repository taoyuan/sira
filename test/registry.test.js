"use strict";

var s = require('./support');
var t = s.t;

var Registry = require('../lib/registry');

describe('registry', function () {

    var reg, definitions;
    beforeEach(function () {
        definitions = {};
        reg = Registry(definitions);
    });

    it('should define model', function () {
        var ModelDef = reg.define('Model');
        t.equal(ModelDef, definitions['Model'])
    });

    it('should apply to schema', function () {
        var schema = s.schema();
        reg.define('Model');
        var models = reg.apply(schema);
        t.ok(models['Model']);
        t.ok(schema.models['Model']);
        t.equal(models['Model'], schema.models['Model']);
    });
});