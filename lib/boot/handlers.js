/**
 * Commands initialization phase.
 *
 * This phase configures a Locomotive application with the required mechanisms
 * to resolve and instantiate controllers.
 *
 * It is recommended that this phase be the first phase in the boot sequence.
 * Earlier phases in the sequence can register alternative mechanisms, in order
 * to override this resolution and instantiation process.  This is considered
 * advanced usage, however, and is generally not recommended.
 *
 * @param {String|Object} options
 * @return {Function}
 * @api public
 */

"use strict";

var needs = require('needs');
var path = require('path');
var _ = require('lodash');

module.exports = function(options) {
    if ('string' == typeof options) {
        options = { dirname: options };
    }
    options = options || {};
    var dirname = options.dirname || 'handlers';

    return function handlers() {
        var app = this;
        var remotes = this.remotes;
        var handlers = needs(path.resolve(dirname));
        _.forEach(handlers, function (handler, name) {
            handler.app = app;
            remotes.exports[name] = handler;
        });
    };
};
