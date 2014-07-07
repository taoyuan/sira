"use strict";

var Router = require('routes');
var Dynamic = require('./dynamic');

module.exports = function (remotes) {
    var router;
    return function (ctx, next) {
        if (!router) router = buildRouter(remotes);
        var match = router.match(ctx.request.uri);
        if (!match) return next();
        match.fn(ctx, function (err, result) {
            if (err) return ctx.throw(err);
            ctx.result = result;
            ctx.end();
        });
    }

};

function buildRouter(remotes) {
    var router = new Router();
    var classes = remotes.classes();

    classes.forEach(function (sc) {
        var methods = sc.methods();
        methods.forEach(function (method) {
            // Wrap the method so that it will keep its own receiver - the shared class
            var fn = function (ctx, cb) {
                var args = buildArgs(method, ctx);
                if (method.isStatic) {
                    method.invoke(method.ctor, args, cb);
                } else {
                    method.sharedCtor.invoke(method, function (err, instance) {
                        method.invoke(instance, args, cb);
                    });
                }
            };
            router.addRoute(method.stringName, fn);
        });
    });

    return router;
}

function buildArgs(method, ctx) {
    var accepts = method.accepts;

    var args = {};
    for (var i = 0; i < accepts.length; i++) {
        var accept = accepts[i];
        var name = accept.name || accept.arg;
        var val;

        if (accept.source) {
            switch (accept.source) {
                case 'payload':
                    val = ctx.payload;
                    break;
            }
        } else {
            val = ctx.arg(name);
        }


        // cast booleans and numbers
        var dynamic;
        var type = accept.type && accept.type.toLowerCase();

        if(Dynamic.canConvert(type)) {
            dynamic = new Dynamic(val, ctx);
            val = dynamic.to(type);
        }

        // set the argument value
        args[name] = val;
    }

    return args;
}