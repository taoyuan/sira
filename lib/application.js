"use strict";

var debug = require('debug')('noa:application');
var assert =require('assert');
var util = require('util');
var Emitter = require('events').EventEmitter;
var bootable = require('bootable');

var middist = require('./middist');
var context = require('./context');
var Processors = require('./processors');
var Resolver = require('./resolver');
var Dispatcher = require('./dispatcher');
var DispatchError = require('./errors/dispatch-error');

module.exports = Application;

function Application() {
    if (!(this instanceof Application)) return new Application();

    Emitter.call(this);

    this.__initializer = new bootable.Initializer();
    this.__middist = middist();
    this.__postprocessors = new Processors();
    this.__definitions = {};

    this.__handlerResolver = new Resolver();
    this.__handlers = {};

    this.__dispatcher = new Dispatcher(this);

    this.models = {};
    this.context = Object.create(context);

}

util.inherits(Application, Emitter);

Application.prototype.init = function() {

    this.__defineGetter__('dispatcher', function(){
        this.__usedDispatcher = true;
        return this.__dispatcher.middleware;
    });
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
 * @param {Function} fn
 * @api public
 */
Application.prototype.phase = function(fn) {
    this.__initializer.phase(fn);
    return this;
};

Application.prototype.model = function(model, caseSensitive) {
    if (typeof model === 'function') {
        var name = model.modelName || model.name;
        if (!name) {
            throw new Error('Named function or model required');
        }
        this.models[name] = model;
        return model;
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

Application.prototype.handle = function(name, payload, cb) {
    var cmd;
    if (typeof name === 'string') {
        if (typeof payload === "function") {
            cb = payload;
            payload = null;
        }
        cmd = { command: name, payload: payload || {} };
    } else if (typeof name === 'function') {
        cb = name;
        cmd = { command: '', payload: {} };
    } else {
        cmd = name;
        cb = payload;
    }
    var ctx = this.createContext(cmd);
    this.__middist.handle.call(this, ctx, cb);
};

/**
 * Instantiate handler with given `id`.
 *
 * @param {String|*} name
 * @api protected
 */
Application.prototype._handler = function(name) {
    var handler = this.__handlers[name];

    if (!handler) {
        // No handler module was found in the cache.  Attempt auto-load.
        debug('autoload handler ' + name);
        try {
            handler = this.__handlerResolver.resolve(name);
        } catch (e) {
            throw new DispatchError("Unable to resolve handler '" + name + "'");
        }

        // cache the handler module
        this.__handlers[name] = handler;
    }

    return handler;
};

/**
 * Initialize a new context.
 *
 * @api private
 */

Application.prototype.createContext = function(cmd) {
    var context = Object.create(this.context);
    context.cmd = Object.create(cmd);
    context.app = this;
    for (var m in this.models) context[m] = this.models[m];
    return context;
};

/**
 * Boot `Noa` application.
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
 * @param {Function|?} cb
 * @api public
 */
Application.prototype.boot = function(cb) {
    var self = this;
    this.init();
    this.__initializer.run(function (err) {
        if (!err) self.__postprocessors.process(self);
        if (cb) cb(err);
    }, this);
};