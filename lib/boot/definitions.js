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
        var registry = require('../registry')(this.__definitions);

        var defs = needs(path.resolve(dir), { patterns: '**/*.js', excludes: '**/*.setup.js' });
        var setups = needs(path.resolve(dir), { patterns: '**/*.setup.js' });


        _.forEach(defs, function (def, name) {
            var modelName = def.name || i8n.camelize(name);
            registry.define(modelName, typeof def === 'function' ? def() : def, findSetup(name));
        });

        function findSetup(name) {
            name = name.toLowerCase() + '.setup';
            var possibles = [name, name.toLowerCase(), i8n.underscore(name), i8n.camelize(name)];
            for (var i = 0; i < possibles.length; i++) {
                if (setups[possibles[i]]) return setups[possibles[i]];
            }
        }
    }
};