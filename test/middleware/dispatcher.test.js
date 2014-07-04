"use strict";

var s = require('../support');
var t = s.t;
var Dispatcher = require('../../lib/dispatcher');
var context = require('../context');

function dispatcher(app) {
    return new Dispatcher(app).middleware;
}

function commandHandler(done) {
    done(null, 'command:' + this.cmd.command);
}

function nextHandler(done) {
    done();
}

describe('middleware/dispatch', function() {

    it('should be named dispatch', function () {
        t.equal(dispatcher().name, 'dispatcher');
    });

    describe('dispatching to handler that uses command', function() {
        var error, result;

        var app = s.mockApplication();
        app.__handlers['robots'] = commandHandler;

        before(function(done) {
            dispatcher(app)(context(s.command('robots')), function (err, data) {
                error = err;
                result = data;
                done();
            });
        });

        it('should respond', function() {
            t.notOk(error);
            t.equal(result, 'command:robots');
        });
    });

    describe('dispatching to controller that uses next', function() {
        var error, result;

        var app = s.mockApplication();
        app.__handlers['robots'] = nextHandler;

        before(function(done) {
            dispatcher(app)(context(s.command('robots')), function (err, data) {
                error = err;
                result = data;
                done();
            });
        });

        it('should call next without error', function() {
            t.notOk(error);
            t.notOk(result);
        });
    });

    describe('dispatching to non-existant handler', function() {
        var error;

        var app = s.mockApplication();

        before(function(done) {
            dispatcher(app)(context(s.command('invalid')), function (err) {
                error = err;
                done();
            });
        });

        it('should error', function() {
            t.instanceOf(error, Error);
            t.equal(error.constructor.name, 'Error');
            t.equal(error.message, "Unable to create handler 'invalid'");
        });
    });
});