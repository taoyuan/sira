"use strict";

exports = module.exports = Deferred;

function Deferred() {
    var future = new Future();

    function resolve(err, arg1, arg2, arg3, arg4) { return future._handler.resolve(err, arg1, arg2, arg3, arg4); }
    function canceler(canceler) { return future._handler.canceler(canceler); }
    function done(fn) { return future.done(fn); }

    this.future = future;
    this.resolve = resolve;
    this.canceler = canceler;
    this.done = done;
}


function Handler(future) {
    this.future = future
}

Handler.prototype.canceler = function (canceler) {
    canclify(this, canceler);
    return this;
};

Handler.prototype.resolve = function (err, arg1, arg2, arg3, arg4) {
    var future = this.future;
    if (future.resolved) return false;
    future.resolved = true;
    if (future.pending && future.pending.length > 0) {
        var i, fn, pending = future.pending, len = future.pending.length;
        future.pending = undefined;
        for (i = 0; i < len; i++) {
            fn = pending[i];
            fn(err, arg1, arg2, arg3, arg4); // not use apply for performance
        }
    }
    return true;
};

function Future() {
    this._handler = new Handler(this);
}

Future.prototype.done = function (fn) {
    if (!this.pending) this.pending = [];
    this.pending.push(fn);
};

function canclify(d, canceler) {
    var reason, future = d.future;
    future.cancel = function () {
        if (future.canceled || future.resolved) return false;
        future.canceled = true;
        reason = canceler();
        return d.resolve(reason !== undefined ? reason : 'canceled');
    };
}
