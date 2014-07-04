"use strict";

var s = require('./support');
var t = s.t;
var path = require('path');
var noa = require('../');

describe.only('integration', function () {

    var app;
    var root = 'test/fixtures/sample-app';
    var database = {
        main: {
            driver: 'memory'
        }
    };
    var schemap = {
        main: '*'
    };

    before(function (done) {
        app = new noa.Application();
        // initialization phases
        app.phase(noa.boot.handlers(path.join(root, 'handlers')));
        app.phase(configure);
        app.phase(noa.boot.models(path.join(root, 'models')));
        app.phase(noa.boot.database(database, schemap));

        // configure
        function configure() {
            // use some middlewares

            // end use dispatcher
            this.use(this.dispatcher);
        }

        app.boot(function (err) {
            t.notOk(err);
            t.isFunction(app._handler('UpsertDealership'));
            t.deepEqual(Object.keys(app.models), ['Car', 'Dealership']);
            done();
        });
    });

    it('should execute a command', function (done) {
        var dealership = {
            name: 'Sira',
            zip: 101010,
            address: 'Guangzhou China'
        };

        app.handle('UpsertDealership', dealership, function (err, c) {
            if (err) return done(err);
            t.includeProperties(c.res, dealership);
            done();
        });
    });

});