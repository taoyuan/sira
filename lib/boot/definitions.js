"use strict";

var path = require('path');
var needs = require('needs');
var _ = require('lodash');
var i8n = require('inflection');


/**
 * Models initialization phase.
 *
 * @examples
 *
 * sira.phase(sira.boot.models('models');
 *
 * @param dir models directory.
 * @returns {Function}
 */

module.exports = function (dir) {
    dir = dir || 'models';

    return function definitions() {
        var registry = this.registry;

        var defs = needs(path.resolve(dir), { patterns: '**/*.js', excludes: '**/*.setup.js' });
        _.forEach(defs, function (def, name) {
            var modelName = def.name || i8n.camelize(name);
            registry.define(modelName, typeof def === 'function' ? def() : def);
        });

        var setups = needs(path.resolve(dir), { patterns: '**/*.setup.js' });
        _.forEach(setups, function (setup, name) {
            registry.setup(name.substr(0, name.length - 6), setup);
        });
    }
};