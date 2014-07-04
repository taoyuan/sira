"use strict";

var s = require('./support');
var t = s.t;
var bootModels = require('../lib/boot/models');
var bootDatabase = require('../lib/boot/database');


describe('boot/database', function () {

    var app, messages = [];
    beforeEach(function () {
        app = s.mockApplication();
        app.log = function (msg) {
            messages.push(msg);
        };
        bootModels('test/fixtures/sample-app/models').call(app);
    });

    it('should connect database and publish schemas', function () {
        bootDatabase({}, '*').call(app);
        t.lengthOf(app.schema, 1);
        t.lengthOf(Object.keys(app.models), 2);
        t.deepEqual(messages, ['Base', 'Car']);
    });


});