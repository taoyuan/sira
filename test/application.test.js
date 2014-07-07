"use strict";

var s = require('./support');
var t = s.t;

var sira = require('../');
var request = require('./request');

describe('app', function () {
    describe('when an error occurs', function() {


        it('should handle middleware errors', function (done) {
            var app = sira();

            app.use(function (c) {
                // triggers this.socket.writable == false
                c.throw('boom');
            });

            request(app)
                .end(function (err) {
                    t.equal(err.message, 'boom');
                    done();
                });
        });

        it('should emit "error" on the app for ctx.throw()', function (done) {
            var app = sira();

            app.use(function (c) {
                // triggers this.socket.writable == false
                c.throw('boom');
            });

            app.on('error', function (err) {
                t.equal(err.message, 'boom');
                done();
            });

            request(app)
                .end();
        });

        it('should emit "error" on the app for new Error() ', function (done) {
            var app = sira();

            app.use(function () {
                throw new Error('boom');
            });

            app.on('error', function (err) {
                t.equal(err.message, 'boom');
                done();
            });

            request(app)
                .end();
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

            request(app)
                .expect('Got error', done);
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

        request(app)
            .end(function (err) {
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

            request(app)
                .expect('Hello', done);
        });
    });

    describe('when .result is an Object', function(){
        it('should respond with json', function(done){
            var result = { hello: 'world' };
            var app = sira();

            app.use(function (c){
                c.result = result;
            });

            request(app)
                .expect(result, done);
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

        request(app1)
            .expect('tao', done);
    });

    it('should not affect the original prototype', function(done){
        app2.use(function (c){
            t.equal(c.message, undefined);
            c.result = 'tao';
        });

        request(app2)
            .expect('tao', done);
    });
});

