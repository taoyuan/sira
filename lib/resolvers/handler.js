"use strict";

/**
 * Module dependencies.
 */
var path = require('path');
var i8n = require('inflection');
var needs = require('needs');

/**
 * Resolve a controller ID to its path on the file system.
 *
 * Given a controller ID of "profile", and the default controller directory of
 * "app/controllers", this algorithm will attempt to locate the file containing
 * the controller by checking for the existence of, in the following order, a
 * file named:
 *
 *   1. handlers/profile.js
 *   2. handlers/profileCmd.js
 *   3. handlers/profile_cmd.js
 *
 * This allows for developers to choose their preferred file naming conventions,
 * each of which is in popular use.
 *
 * This is the default resolution algorithm used to locate controllers within
 * Locomotive applications.
 */
module.exports = function (options) {
    if ('string' == typeof options) {
        options = { dirname: options };
    }
    options = options || {};
    var dirname = options.dirname || 'handlers';
    var dir = path.resolve(dirname);
    var handlers;

    return function (id) {
        if (!handlers) handlers = needs(dir) || {};
        var longId = id + 'Handler';
        var possibles = [ id, longId, id.toLowerCase(), longId.toLowerCase(), i8n.underscore(id), i8n.underscore(longId) ];
        for (var i = 0; i < possibles.length; i++) {
            if (handlers[possibles[i]]) return handlers[possibles[i]];
        }
    };
};
