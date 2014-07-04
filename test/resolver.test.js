/* global describe, it, expect */

var s = require('./support');
var t = s.t;
var Resolver = require('../lib/resolver');

describe('Resolver', function () {

    describe('without mechanisms', function () {
        var resolver = new Resolver();

        it('should throw when resolving', function () {
            t.throws(function () {
                resolver.resolve('foo');
            }, "Unable to resolve 'foo'");
        });
    });

    describe('with one mechanism that resolves', function () {
        var resolver = new Resolver();
        resolver.use(function (id) {
            return 'ok-' + id;
        });

        it('should resolve using mechanism', function () {
            t.equal(resolver.resolve('foo'), 'ok-foo');
        });
    });

    describe('with two mechanisms, the first of which resolves', function () {
        var resolver = new Resolver();
        resolver.use(function (id) {
            return 'ok1-' + id;
        });
        resolver.use(function (id) {
            return 'ok2-' + id;
        });

        it('should resolve using mechanism', function () {
            t.equal(resolver.resolve('foo'), 'ok1-foo');
        });
    });

    describe('with two mechanisms, the second of which resolves', function () {
        var resolver = new Resolver();
        resolver.use(function (id) {
        });
        resolver.use(function (id) {
            return 'ok2-' + id;
        });

        it('should resolve using mechanism', function () {
            t.equal(resolver.resolve('foo'), 'ok2-foo');
        });
    });

    describe('with two mechanisms, each scoped to prefix', function () {
        var resolver = new Resolver();
        resolver.use('foo', function (id) {
            return 'ok-foo-' + id;
        });
        resolver.use('bar', function (id) {
            return 'ok-bar-' + id;
        });

        it('should resolve in foo prefix', function () {
            t.equal(resolver.resolve('foo/baz'), 'ok-foo-baz');
        });
        it('should resolve in bar prefix', function () {
            t.equal(resolver.resolve('bar/baz'), 'ok-bar-baz');
        });
    });

});
