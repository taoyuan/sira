"use strict";

var debug = require('debug')('sira:application');
var assert =require('assert');
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

Application.prototype.init = function(options) {
    options = options || {};

    this.__remotes = new Remotes(options['remoting']);
};

Application.prototype.__defineGetter__('models', function () {
    return this.registry.models;
});

Application.prototype.__defineGetter__('dispatcher', function(){
    if (!this.__dispatcher) {
        this.__dispatcher = new Dispatcher(this.__remotes);
    }
    return this.__dispatcher.middleware;
});

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
Application.prototype.phase = function(fns) {
    if (!Array.isArray(fns)) fns = [fns];
    for (var i = 0; i < fns.length; i++) {
        this.__initializer.phase(fns[i]);
    }
    return this;
};

Application.prototype.model = function(model, caseSensitive) {
    if (typeof model === 'function') {
//        return this.addModel(model);
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

//Application.prototype.addModel = function(name, model) {
//    if (typeof name === 'function') {
//        model = name;
//        name = model.modelName || model.name;
//    }
//
//    if (!name) {
//        throw new Error('Named function or model required');
//    }
//    this.__models[name] = model;
//    return model;
//};

Application.prototype.exports = function(name, handler) {
    var _handler = this.__remotes.exports[name];
    if (!handler) return _handler;

    if (typeof handler === "function") {
        handler = handler(_handler, this);
    }
    if (!handler.app) handler.app = this;
    return this.__remotes.exports[name] = handler;
};

/**
 * Use the given middleware `fn`.
 *
 * @param {Function} fn
 * @return {Application} self
 * @api public
 */

Application.prototype.use = function(fn){
    assert(typeof fn === 'function', 'app.use() requires a function');
    debug('use %s', fn._name || fn.name || '-');
    this.__middist.use(fn);
    return this;
};

Application.prototype.handle = function(req, cb) {
    var ctx = this.createContext(req, context);
    this.__middist.handle(ctx, cb);
};

/**
 * Initialize a new context.
 *
 * @api private
 */

Application.prototype.createContext = function(req, ctx) {
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
Application.prototype.boot = function(options, cb) {
    if (typeof options === "function") {
        cb = options;
        options = null;
    }
    options = options || {};
    cb = cb || function () {};

    var self = this;
    this.init(options);
    this.__initializer.run(function (err) {
        if (err) return cb(err);
        self.__postprocessors.process(self);
        cb();
    }, this);
};