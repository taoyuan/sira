"use strict";

var Router = require('routes');
var RemotesContext = require('./remotes-context');

module.exports = Dispatcher;

function Dispatcher(remotes) {
    var self = this;
    this.remotes = remotes;

    this.middleware = function dispatcher(ctx, next) {
        return self._dispatch(ctx, next);
    }
}

Dispatcher.prototype._dispatch = function (ctx, next) {
    if (!this.router) this.router = buildRouter(this.remotes);
    var match = this.router.match(ctx.request.uri);
    if (!match) return next();
    match.fn(ctx, function (err) {
        if (err) return next(err);
        ctx.end();
    });
};

function buildRouter(remotes) {
    var router = new Router();
    var classes = remotes.classes();
    var paths, handler, i;

    classes.forEach(function (sc) {
        var methods = sc.methods();
        methods.forEach(function (method) {
            paths = buildPaths(method);
            handler = method.isStatic ? createStaticMethodHandler(remotes, method) : createPrototypeMethodHandler(remotes, method);
            for (i = 0; i < paths.length; i++) {
                router.addRoute(paths[i], handler);
            }
        });
    });

    return router;
}

function createStaticMethodHandler(remotes, method) {
    return function (ctx, cb) {
        var context = new RemotesContext(ctx);
        invokeMethod(remotes, context, method, cb);
    }
}

function createPrototypeMethodHandler(remotes, method) {
    return function (ctx, cb) {
        cb(new Error('Prototype method is unsupported yet!'));
    }
}

function invokeMethod(remotes, ctx, method, cb) {
    remotes.invokeMethodInContext(ctx, method, cb);
}

function buildPaths(method) {
    var paths = [], sc = method.sharedClass;
    var names = [method.name].concat(method.aliases);
    for (var i = 0; i < names.length; i++) {
        paths.push((sc ? sc.name : '') + (method.isStatic ? '.' : '.prototype.') + names[i]);
    }
    return paths;
}