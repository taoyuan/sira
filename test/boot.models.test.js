"use strict";

var s = require('./support');
var t = s.t;
var loadModels = require('../lib/boot/models');


describe('boot/models', function () {

    describe('simple', function () {
        var app;
        beforeEach(function () {
            app = s.mockApplication();
            loadModels('test/fixtures/sample-app/models').call(app);
        });

        it('should load models from dir', function () {
            var defCar = app.__definitions['Car'];
            t.ok(defCar);
            t.deepProperty(defCar, 'properties.createAt');
            t.isFunction(defCar.setup);
            t.isFunction(defCar.setup.super_);

        });

        it('should execute super setup', function () {
            var defCar = app.__definitions['Car'];
            var messages = [];
            app.log = function (msg) {
                messages.push(msg);
            };
            defCar.setup({}, app);
            t.deepEqual(messages, ['Base', 'Car']);
        });
    });


});