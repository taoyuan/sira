"use strict";

module.exports = Dispatcher;

function Dispatcher(app) {
    var self = this;
    this.app = app;

    this.middleware = function dispatcher(ctx, next) {
        return self._dispatch(ctx, next);
    }
}

Dispatcher.prototype.matchHandler = function (ctx) {
    return this.app._handler(ctx.request.uri);
};

Dispatcher.prototype._dispatch = function (ctx, next) {
    var handler;
    try {
        handler = this.matchHandler(ctx);

        if (!handler) return next();

        if (handler.length < 1) {
            handler.call(ctx);
            next();
        } else {
            handler.call(ctx, next);
        }
    } catch (e) {
        next(e);
    }
};