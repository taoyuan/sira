"use strict";

module.exports = Deferred;

function Deferred() {
    var future = this.future = new Future();

    function done(fn) { return future.done(fn); }

    this.done = done;
}

Deferred.prototype.canceler = function (canceler) {
    var d = this, reason;
    this.future.cancel = function () {
        if (this.canceled) return;
        this.canceled = true;
        reason = canceler();
        d.resolve(reason !== undefined ? reason : 'canceled');
    };
    return this;
};

Deferred.prototype.resolve = function (err, result) {
    var future = this.future;
    if (future.resolved) return;
    future.resolved = true;
    future.result = result;
    if (future.pending && future.pending.length > 0) {
        var i, fn, pending = future.pending, len = future.pending.length;
        future.pending = undefined;
        for (i = 0; i < len; i++) {
            fn = pending[i];
            fn(err, result);
        }
    }
};

function Future() {

}

Future.prototype.done = function (fn) {
    if (!this.pending) this.pending = [];
    this.pending.push(fn);
};
