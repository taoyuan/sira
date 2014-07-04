"use strict";

var s = require('./support');
var t = s.t;

var sira = require('../');
var commander = require('./commander');

describe('app', function () {
    describe('when an error occurs', function() {


        it('should handle middleware errors', function (done) {
            var app = sira();

            app.use(function (c) {
                // triggers this.socket.writable == false
                c.throw('boom');
            });

            commander(app)
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

            commander(app)
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

            commander(app)
                .end();
        });

        it('should be catchable', function(done){
            var app = sira();

            app.use(function (c, next){
                next(function (err, c) {
                    c.res = err ? 'Got error' : 'Hello'
                });
            });

            app.use(function (c){
                c.res = 'Oh no';
                throw new Error('boom!');
            });

            commander(app)
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

        commander(app)
            .end(function (err) {
                if (err) return done(err);
                t.deepEqual(calls, [1, 2, 3, 4, 5, 6]);
                done();
            });
    });
});

describe('app.respond', function () {

    describe('when .res is an String', function() {
        it('should respond', function (done) {
            var app = sira();

            app.use(function (c) {
                c.res = 'Hello';
            });

            commander(app)
                .expect('Hello', done);
        });
    });

    describe('when .res is an Object', function(){
        it('should respond with json', function(done){
            var res = { hello: 'world' };
            var app = sira();

            app.use(function (c){
                c.res = res;
            });

            commander(app)
                .expect(res, done);
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
            c.res = 'tao'
        });

        commander(app1)
            .expect('tao', done);
    });

    it('should not affect the original prototype', function(done){
        app2.use(function (c){
            t.equal(c.message, undefined);
            c.res = 'tao';
        });

        commander(app2)
            .expect('tao', done);
    });
});

