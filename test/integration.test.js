"use strict";

var s = require('./support');
var t = s.t;
var path = require('path');
var sira = require('../');

describe('integration', function () {

    describe('boot.component', function () {
        it('should load local component resources', function (done) {
            var app = new sira.Application();
            app.phase(sira.boot.component('./test/fixtures/base-app'));
            app.phase(sira.boot.database());
            app.boot(function (err) {
                if (err) return done(err);
                var Dealership = app.model('Dealership');
                t(Dealership);
                t.isFunction(Dealership.baseMethod);
                done();
            })
        });

        it('should extend app', function (done) {
            var app = new sira.Application();
            app.phase(sira.boot.component('./test/fixtures/base-app'));
            app.phase(sira.boot.component('./test/fixtures/extended-app'));
            app.phase(sira.boot.database());
            app.boot(function (err) {
                if (err) return done(err);
                var Dealership = app.model('Dealership');
                t(Dealership);
                t(Dealership.properties['phone']);
                t.isFunction(Dealership.baseMethod);
                t.isFunction(Dealership.extendedMethod);
                done();
            })
        });
    });

    describe('programmatic', function () {
        it('should boot programmatically', function (done) {
            var app = sira();

            app.registry.define('Color', {
                name: String
            });

            app.phase(sira.boot.database());
            app.boot(function () {
                var Color = app.models.Color;
                Color.create({name: 'red'});
                Color.create({name: 'green'});
                Color.create({name: 'blue'});

                Color.all(function () {
                    console.log(arguments);
                });

                done();
            });

        });
    });

    describe('classic', function () {

        var app;
        var root = './test/fixtures/base-app';
        var database = {
            main: {
                driver: 'memory'
            }
        };
        var schemap = {
            main: '*'
        };

        beforeEach(function (done) {
            app = new sira.Application();
            // initialization phases
            app.phase(sira.boot.handlers(path.join(root, 'handlers')));
            app.phase(sira.boot.definitions(path.join(root, 'models')));
            app.phase(configure);
            app.phase(sira.boot.database(database, schemap));

            // configure
            function configure() {
                // use some middlewares

                // end use dispatcher
                this.use(this.dispatcher);
            }

            app.boot(function (err) {
                if (err) return done(err);
                t.deepEqual(Object.keys(app.models), ['Car', 'Dealership']);
                done();
            });
        });

        it('should handle a request with handler', function (done) {
            sira.rekuest('dealerships.echo', {msg: 'hello'})
                .send(app, function (err, c) {
                    if (err) return done(err);
                    t.deepEqual(c.result, {msg: 'hello'});
                    done();
                });
        });


        it('should handle a request for model function', function (done) {
            var dealership = {
                name: 'Sira',
                zip: 101010,
                address: 'Guangzhou China'
            };
            sira.rekuest('dealerships.upsert', dealership)
                .send(app, function (err, c) {
                    if (err) return done(err);
                    t.includeProperties(c.result, dealership);
                    done();
                });
        });

    });


});