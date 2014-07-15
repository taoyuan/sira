"use strict";

var delegate = require('delegates');
var Dynamic = require('./dynamic');

module.exports = RemotesContext;

function RemotesContext(context) {
    if (!(this instanceof RemotesContext)) return new RemotesContext(context);
    this.context = context;
}

RemotesContext.prototype.invoke = function (scope, method, cb) {
    var args = this.buildArgs(method);
    method.invoke(scope, args, cb);
};

RemotesContext.prototype.buildArgs = function (method, ctx) {
    ctx = ctx || this.context;
    var accepts = method.accepts;

    var args = {};
    for (var i = 0; i < accepts.length; i++) {
        var accept = accepts[i];
        var source = accept.source;
        var name = accept.name || accept.arg;
        var val;

        if (source) {
            switch (typeof source) {
                case 'function':
                    val = source(ctx);
                    break;
                case 'string':
                    switch (source) {
                        case 'payload':
                            val = ctx.payload;
                            break;
                        case 'req':
                        case 'request':
                            val = ctx.request;
                            break;
                        case 'context':
                        case 'ctx':
                            val = ctx;
                            break;

                    }
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
};

delegate(RemotesContext.prototype, 'context')
    .access('result');