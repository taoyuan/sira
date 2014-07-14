"use strict";

var s = require('./support');
var t = s.t;

var sira = require('../');

describe('app', function () {
    describe('when an error occurs', function() {


        it('should handle middleware errors', function (done) {
            var app = sira();

            app.use(function (c) {
                // triggers this.socket.writable == false
                c.throw('boom');
            });

            sira.rekuest().send(app, function (err) {
                t.equal(err.message, 'boom');
                done();
            });
        });

        it('should throw error for ctx.throw()', function () {
            var app = sira();

            app.use(function (c) {
                c.throw('boom');
            });

            t.throws(function () { sira.rekuest().send(app); });

        });

        it('should throw error for new Error() ', function () {
            var app = sira();

            app.use(function () {
                throw new Error('boom');
            });

            t.throws(function () { sira.rekuest().send(app); });
        });

        it('should be catchable', function(done){
            var app = sira();

            app.use(function (c, next){
                next(function (err, c) {
                    c.result = err ? 'Got error' : 'Hello'
                });
            });

            app.use(function (c){
                c.result = 'Oh no';
                throw new Error('boom!');
            });

            sira.rekuest().send(app, function (err, result) {
                t.equal(result, 'Got error');
                done();
            });
        })
    });

});

describe('app.use(fn)', function () {
    it('should compose middleware', function (done) {
        var app = sira();
        var calls = [];

        app.use(function (c, next) {
            calls.push(1);
            next(function () {
                calls.push(6);
            });
        });

        app.use(function (c, next) {
            calls.push(2);
            next(function () {
                calls.push(5);
            });
        });

        app.use(function (c, next) {
            calls.push(3);
            next(function () {
                calls.push(4);
            });
        });

        sira.rekuest().send(app, function (err) {
            if (err) return done(err);
            t.deepEqual(calls, [1, 2, 3, 4, 5, 6]);
            done();
        });
    });
});

describe('app.respond', function () {

    describe('when .result is an String', function() {
        it('should respond', function (done) {
            var app = sira();

            app.use(function (c) {
                c.result = 'Hello';
            });

            sira.rekuest().send(app, function (err, result) {
                t.equal(result, 'Hello');
                done();
            });
        });
    });

    describe('when .result is an Object', function(){
        it('should respond with json', function(done){
            var result = { hello: 'world' };
            var app = sira();

            app.use(function (c){
                c.result = result;
            });

            sira.rekuest().send(app, function (err, result) {
                t.equal(result, result);
                done();
            });
        })
    })
});


describe('app.context', function(){
    var app1 = sira();
    app1.context.message = 'hello';
    var app2 = sira();

    it('should merge properties', function(done){
        app1.use(function (c){
            t.equal(c.message, 'hello');
            c.result = 'tao'
        });

        sira.rekuest().send(app1, function (err, result) {
            t.equal(result, 'tao');
            done();
        });
    });

    it('should not affect the original prototype', function(done){
        app2.use(function (c){
            t.equal(c.message, undefined);
            c.result = 'tao';
        });

        sira.rekuest().send(app2, function (err, result) {
            t.equal(result, 'tao');
            done();
        });
    });
});

