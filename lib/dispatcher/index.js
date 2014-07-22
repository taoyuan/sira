"use strict";

var middist = require('middist');
var Router = require('routes');
var RemotesContext = require('./remotes-context');

module.exports = Dispatcher;

function Dispatcher(remotes) {
    this.remotes = remotes;
}

Dispatcher.prototype.middleware = function() {
    var self = this;

    var root = middist();

    root.use(function dispatcher(ctx, next) {
        return self._dispatch(ctx, next);
    });

    root.use(uriNotFoundHandler);

    return root;
};

Dispatcher.prototype._dispatch = function (ctx, next) {
    var uri = ctx.request.uri;
    if (!uri) return next();

    if (typeof uri === 'string') {
        if (!this.router) this.router = buildRouter(this.remotes);
        var match = this.router.match(ctx.request.uri);
        if (!match) return next();
        match.fn(ctx, done);
    } else if (uri.sharedClass) {
        invokeMethod(this.remotes, ctx, ctx.request.uri, done);
    } else {
        next(new Error('Invalid request for ' + uri));
    }

    function done(err) {
        if (err) return next(err);
        ctx.end();
    }
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
        invokeMethod(remotes, ctx, method, cb);
    }
}

function createPrototypeMethodHandler(remotes, method) {
    return function (ctx, cb) {
        cb(new Error('Prototype method is unsupported yet!'));
    }
}

function invokeMethod(remotes, ctx, method, cb) {
    if (!(ctx instanceof RemotesContext)) {
        ctx = new RemotesContext(ctx);
    }
    remotes.invokeMethodInContext(ctx, method, cb);
}

function buildPaths(method) {
    var paths = [], sc = method.sharedClass;
    var names = [method.name].concat(method.aliases);
    for (var i = 0; i < names.length; i++) {
        paths.push((sc ? sc.name : '') + (method.isStatic ? '.' : '.prototype.') + names[i]);
        if (sc.ctor.pluralizeModelName) {
            paths.push(sc.ctor.pluralizeModelName + (method.isStatic ? '.' : '.prototype.') + names[i]);
        }

    }
    return paths;
}


function remoteMethodNotFoundHandler(className) {
    className = className || '(unknown)';
    return function restRemoteMethodNotFound(ctx, next) {
        var message = 'Shared class "' + className + '"' +
            ' has no method handling ' + ctx.request.uri;
        var error = new Error(message);
        error.status = error.statusCode = 404;
        next(error);
    };
}

function uriNotFoundHandler() {
    return function restUrlNotFound(ctx, next) {
        var message = 'There is no method to handle ' + ctx.request.uri;
        var error = new Error(message);
        error.status = error.statusCode = 404;
        next(error);
    };
}

//function errorHandler() {
//    return function restErrorHandler(err, ctx, next) {
//        if(typeof err === 'string') {
//            err = new Error(err);
//            err.status = err.statusCode = 500;
//        }
//
//       var statusCode = err.statusCode || err.status || 500;
//
//        debug('Error in %s: %s', ctx.request.uri, err.stack);
//        var data = {
//            name: err.name,
//            status: statusCode,
//            message: err.message || 'An unknown error occurred'
//        };
//
//        for (var prop in err)
//            data[prop] = err[prop];
//
//        // TODO(bajtos) Remove stack info when running in production
//        data.stack = err.stack;
//
//        res.send({ error: data });
//    };
//}