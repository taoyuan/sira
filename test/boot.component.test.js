"use strict";

var s = require('./support');
var t = s.t;
var bootComponent = require('../lib/boot/component');


describe('boot/component', function () {

    var app;
    beforeEach(function () {
        app = s.mockApplication();
    });

    it('should return 2 phases', function () {
        var phases = bootComponent('./test/fixtures/sample-app');
        t.lengthOf(phases, 2);
    });

});