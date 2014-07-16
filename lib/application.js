"use strict";

var debug = require('debug')('sira:app');
var assert = require('assert');
var util = require('util');
var Emitter = require('events').EventEmitter;
var bootable = require('bootable');
var Middist = require('middist');
var Remotes = require('strong-remoting');
var _ = require('lodash');

var Registry = require('./registry');
var context = require('./context');
var Processors = require('./processors');
var Dispatcher = require('./dispatcher');

module.exports = Application;

function Application() {
    if (!(this instanceof Application)) return new Application();

    Emitter.call(this);

    this.__initializer = new bootable.Initializer();
    this.__middist = new Middist(this);
    this.__postprocessors = new Processors();
    this.__remotes = undefined;

    this.registry = new Registry(this);
    this.context = Object.create(context);

}

util.inherits(Application, Emitter);

Application.prototype.__defineGetter__('schemas', function () {
    return this.registry.schemas;
});

Application.prototype.__defineGetter__('models', function () {
    return this.registry.models;
});

Application.prototype.__defineGetter__('dispatcher', function () {
    if (!this.__dispatcher) {
        this.__dispatcher = new Dispatcher(this.__remotes);
    }
    return this.__dispatcher.middleware;
});


Application.prototype.init = function (options) {
    options = options || {};

    this.__remotes = new Remotes(options['remoting']);
};

Application.prototype.postprocess = function () {
    this.__postprocessors.process(this);

    this._initExports();
};

Application.prototype._initExports = function () {
    if (!this.__exports) return;
    var name, handlers, handler, i;
    for (name in this.__exports) {
        handler = { name: name, app: this };
        handlers = this.__exports[name];
        for (i = 0; i < handlers.length; i++) {
            if (typeof handlers[i] === 'function') {
                handlers[i].call(handler, this);
            } else {
                _.assign(handler, handlers[i]);
            }
        }
        this.__remotes.exports[name] = handler;
    }
};

/**
 * Register a boot phase.
 *
 * When an application boots, it proceeds through a series of phases, ultimately
 * resulting in a listening server ready to handle requests.
 *
 * A phase can be either synchronous or asynchronous.  Synchronous phases have
 * following function signature
 *
 *     function myPhase() {
 *       // perform initialization
 *     }
 *
 * Asynchronous phases have the following function signature.
 *
 *     function myAsyncPhase(done) {
 *       // perform initialization
 *       done();  // or done(err);
 *     }
 *
 * @param {Function|Function[]} fns
 * @api public
 */
Application.prototype.phase = function (fns) {
    if (!Array.isArray(fns)) fns = [fns];
    for (var i = 0; i < fns.length; i++) {
        this.__initializer.phase(fns[i]);
    }
    return this;
};

Application.prototype.model = function (model, caseSensitive) {
    if (typeof model === 'function') {
        throw new Error('`model` must not be string');
    }
    if (!caseSensitive) {
        model = model.toLowerCase();
    }
    var foundModel;
    for (var i in this.models) {
        if (model === i || !caseSensitive && model === i.toLowerCase()) {
            foundModel = this.models[i];
        }
    }
    return foundModel;
};

Application.prototype.exports = function (name, handler) {
    if (!this.__exports) this.__exports = {};
    var handlers = this.__exports[name];
    if (!handlers) handlers = this.__exports[name] = [handler];
    handlers.push(handler);
};


/**
 * Use the given middleware `fn`.
 *
 * @param {Function} fn
 * @return {Application} self
 * @api public
 */

Application.prototype.use = function (fn) {
    assert(typeof fn === 'function', 'app.use() requires a function');
    debug('use %s', fn._name || fn.name || '-');
    this.__middist.use(fn);
    return this;
};

Application.prototype.handle = function (req, cb) {
    var ctx = this.createContext(req, context);
    this.__middist.handle(ctx, cb);
};

/**
 * Initialize a new context.
 *
 * @api private
 */

Application.prototype.createContext = function (req, ctx) {
    var context = Object.create(this.context);
    if (!ctx) _.assign(context, ctx);
    var request = context.request = Object.create(req);
    context.app = request.app = this;
    request.ctx = context;
    for (var m in this.models) context[m] = this.models[m];
    return context;
};

/**
 * Boot `Sira` application.
 *
 * Locomotive builds on Express, providing a set of conventions for how to
 * organize code and resources on the file system as well as an MVC architecture
 * for structuring code.
 *
 * When booting a Locomotive application, the file system conventions are used
 * to initialize modules, configure the environment, register controllers, and
 * draw routes.  When complete, `callback` is invoked with an initialized
 * `express` instance that can listen for requests or be mounted in a larger
 * application.
 *
 * @param {Object|Function} [options]
 * @param {Function} [cb]
 * @api public
 */
Application.prototype.boot = function (options, cb) {
    if (typeof options === "function") {
        cb = options;
        options = null;
    }
    options = options || {};
    cb = cb || function () {
    };

    var self = this;
    this.init(options);
    this.__initializer.run(function (err) {
        if (err) return cb(err);
        self.postprocess();
        self.emit('ready', self);
        cb();
    }, this);
};