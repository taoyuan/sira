"use strict";

var s = require('./support');
var t = s.t;
var path = require('path');
var sira = require('../');

describe('integration', function () {

    describe('boot.module', function () {
        it('should load local module resources', function (done) {
            var app = new sira.Application();
            app.phase(sira.boot.module('./test/fixtures/base-app'));
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
            app.phase(sira.boot.module('./test/fixtures/base-app'));
            app.phase(sira.boot.module('./test/fixtures/extended-app'));
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
                properties: {
                    name: String
                }
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
            app.phase(sira.boot.definitions(path.join(root, 'models')));
            app.phase(sira.boot.database(database, schemap));

            app.boot(function (err) {
                if (err) return done(err);
                t.deepEqual(Object.keys(app.models), ['Car', 'Dealership']);
                done();
            });
        });

        it('should handle a request with handler', function (done) {
            sira.rekuest('dealership.echo', {msg: 'hello'})
                .send(app, function (err, result) {
                    if (err) return done(err);
                    t.deepEqual(result, {msg: 'hello'});
                    done();
                });
        });

        it('should handle a request for model function', function (done) {
            var dealership = {
                name: 'Sira',
                zip: 101010,
                address: 'Guangzhou China'
            };
            sira.rekuest('dealership.upsert', dealership)
                .send(app, function (err, result) {
                    if (err) return done(err);
                    t.includeProperties(result, dealership);
                    done();
                });
        });

        it.only('should cancel using the future returned by handle', function (done) {
            var future = sira.rekuest('car.order')
                .send(app, function (err, result) {
                    t.notOk(err);
                    t.equal(future.canceled, true);
                    done();
                });
            future.cancel();
        });
    });
});