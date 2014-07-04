"use strict";

var s = require('./support');
var t = s.t;
var bootModels = require('../lib/boot/models');
var bootDatabase = require('../lib/boot/database');


describe('boot/database', function () {

    var app;
    beforeEach(function () {
        app = s.mockApplication();
        bootModels('test/fixtures/sample-app/models').call(app);
    });

    it('should connect database and publish schemas', function () {
        bootDatabase({}, '*').call(app);
        t.lengthOf(app.schema, 1);
        t.lengthOf(Object.keys(app.models), 2);
        var Car = app.models['Car'];
        t.isTrue(Car.setupBase);
        t.isTrue(Car.setupCar);
    });

});