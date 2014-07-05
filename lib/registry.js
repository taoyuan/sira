"use strict";

var debug = require('debug')('sira:registry');
var assert = require('assert');
var _ = require('lodash');
var util = require('util');
var i8n = require('inflection');

var PRIVATE_PROPS = ['virtual', 'abstract', 'extend'];

module.exports = function (definitions) {

    var registry = {};

    registry.define = function (name, config, setup) {
        if (typeof name === 'object') {
            setup = config;
            config = name;
            name = config.name;
        }
        if (typeof config === 'function') {
            setup = config;
            config = null;
        }
        assert(typeof name === 'string', '`name` must be a string');
        if (definitions[name]) {
            debug(util.format('`%s` has been defined, override it.', name));
        }

        var extend = config && (config.extend || config.extends),
            parent, parentDefinition;
        if (extend) {
            if (typeof extend === 'string') {
                parent = extend;
            } else {
                parent = name;
            }
            assert(definitions[parent], util.format('Can not find parent definition `%s` when defining `%s`', parent, name));
            parentDefinition = _.omit(_.cloneDeep(definitions[parent]), PRIVATE_PROPS);
        }
        if (setup && parentDefinition && parentDefinition.setup) {
            setup.super_ = parentDefinition.setup;
        }
        var definition = createDefinition(name, config, setup);
        return definitions[name] = parentDefinition ? _.merge(parentDefinition, definition): definition;
    };

    registry.publish = function (db, defs) {
        if (defs === '*') defs = null;
        if (typeof defs === 'string') defs = [defs];
        if (defs && !Array.isArray(defs)) {
            throw new Error('`definitions` must be a string or string array');
        }
        if (defs) {
            defs = _.pick(definitions, defs);
        } else {
            defs = definitions;
        }

        var models = {};
        _.forEach(defs, function (definition) {
            if (!models[definition.name]) publish(definition);
        });
        return models;

        function publish(definition) {
            if (definition.virtual || definition.abstract) return;
            if (db.models[definition.name]) return;
            var model = models[definition.name] = db.define(definition.name, definition.properties || definition.fields, definition.settings);
            publishRelations(model, definition.relations);
            if (definition.setup) model.setup = definition.setup;
            return model;
        }

        function publishRelations(model, relations) {
            if (!relations) return;
            _.forEach(relations, function (relation, name) {
                var target = relation.model,
                    targetName,
                    targetModel;

                if (!target) {
                    target = i8n.singularize(name);
                }
                targetName = findKey(db.models, target);
                if (targetName) {
                    targetModel = db.models[targetName];
                } else {
                    targetName = findKey(defs, target);
                    if (targetName) {
                        targetModel = publish(defs[targetName]);
                    }
                }

                if (!targetModel) {
                    throw new Error(util.format('Unknown target model `%s` to build relationship %s.%s -> %s -> %s',
                        target, model.modelName, name, relation.type, target));
                }

                var options = _.omit(relation, ['target', 'model']);
                options.as = options.as || name;
                model[relation.type](targetModel, options);
            });
        }

        function findKey(models, target) {
            var targetName = target.toLowerCase();
            return _.findKey(models, function (model, name) {
                return name.toLowerCase() === targetName;
            });
        }
    };

    return registry;
};

function createDefinition(name, config, setup) {
    var definition = _.clone(config || {});
    definition.name = name;
    if (setup) definition.setup = setup;
    return definition;
}
