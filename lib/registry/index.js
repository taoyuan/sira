"use strict";

var _ = require('lodash');
var i8n = require('inflection');
var resolve =require('resolve');
var Schema = require('./schema');

module.exports = Registry;

function Registry(context) {
    if (!this instanceof Registry) return new Registry(context);

    this.context = context || this;
    this.schemas = [];
    this.definitions = {};
    this.models = {};
    this.plugins = [];

    this.use('./plugins/sugar');
    this.use('./plugins/hookable');
}

Registry.prototype.use = function (plugin, opts) {
    if (typeof plugin === "string") {
        try {
            plugin = require(resolve.sync(plugin));
        } catch (e) {
            throw e;
        }
    }

    plugin = new plugin(this, opts || {});

    if (typeof plugin.define === "function") {
        for (var k in this.models) {
            plugin.define(this.models[k]);
        }
    }

    this.plugins.push(plugin);

    return this;
};

Registry.prototype.define = function (/*name, desc, setup*/) {
    var i, arg, type, name, desc, setup;
    for (i = 0; i < arguments.length; i++) {
        arg = arguments[i];
        type = typeof arg;
        if (!name && type === 'string') {
            name = arg;
        } else if (!desc && (type === 'object' || type === 'function')) {
            desc = arg;
        } else if (!setup && type === 'function') {
            setup = arg;
        } else {
            throw new Error('Unsupported argument ' + arg);
        }
    }

    desc = desc || {};
    if (typeof desc === 'function') {
        desc = desc(Schema);
    }

    var def = this.definitions[name];
    if (def) {
        desc = _.merge(_.cloneDeep(def), desc);
    } else {
        desc.name = name;
    }
    this.definitions[name] = desc;
    this.setup(desc, setup);
    return desc;
};

Registry.prototype.setup = function (name, setup) {
    if (typeof setup !== 'function') return;
    var def = findDefinition(this.definitions, name);

    if (!def) throw new Error('Unknown model ' + name + ' for setup');

    def.setups = def.setups || [];
    if (Array.isArray(setup)) {
        def.setups = def.setups.concat(setup);
    } else {
        def.setups.push(setup);
    }
};

Registry.prototype.build = function (options) {
    if (!options) {
        options = {db: {driver: 'memory'}};
    } else if (typeof options === 'string') {
        options = {db: {driver: options}};
    } else if (options.driver) {
        options = {db: options};
    }

    var self = this;
    var schemas = this.schemas = [];
    this.models = {};

    _.forEach(options, function (conf, name) {
        if (!conf || !conf.driver) {
            console.log('No config found for ' + name + ' schema, using in-memory schema');
            conf = {driver: 'memory'};
        }
        var schema = createSchema(conf.driver, conf);
        self._build(schema, conf.models);
        schema.name = name;
        schemas[name] = schema;
        schemas.push(schema);
    });

    return schemas;
};

Registry.prototype._build = function (schema, names) {
    if (names == '*') names = null;
    if (typeof names === 'string') names = [names];
    if (names && !Array.isArray(names)) {
        throw new Error('`names` must be a string or string array');
    }

    var context = this.context;
    var plugins = this.plugins;
    var models = this.models;
    var defs = names ? _.pick(this.definitions, names) : this.definitions;

    schema.on('beforeDefine', function(name, properties, settings) {
        for (var i = 0; i < plugins.length; i++) {
            if (typeof plugins[i].beforeDefine === "function") {
                plugins[i].beforeDefine(name, properties, settings);
            }
        }
    });

    schema.on('define', function(model, name, properties, settings) {
        models[name] = model;
        if (schema.backyard) {
            schema.backyard.define(name, properties, settings);
        }
        for (var i = 0; i < plugins.length; i++) {
            if (typeof plugins[i].define === "function") {
                plugins[i].define(model, name, properties, settings);
            }
        }
    });

    _.forEach(defs, function (def, name) {
        schema.define(name, def.properties || def.fields, def.settings);
    });

    _.forEach(defs, function (def) {
        buildRelations(schema, def);
    });

    _.forEach(defs, function (def) {
        if (!def.setups) return;
        for(var i = 0; i < def.setups.length; i++) {
            def.setups[i](models[def.name], context);
        }
    });
};

function findDefinition(definitions, name) {
    if (typeof name === 'object') return name;
    var possibles = [name, name.toLowerCase(), i8n.underscore(name), i8n.camelize(name)],
        i;
    for (i = 0; i < possibles.length; i++) {
        if (definitions[possibles[i]]) return definitions[possibles[i]];
    }
}

function createSchema(name, settings) {
    var schema = new Schema(name, settings);
    if (settings && settings.backyard) {
        schema.backyard = new Schema(settings.backyard.driver, settings.backyard);
    }
    return schema;
}

function buildRelations(schema, def) {
    if (!def.relations) return;
    var model = schema.models[def.name];
    var relations = def.relations;
    for (var name in relations) {
        var rel = relations[name];
        var target = rel.model,
            targetName,
            targetModel;

        if (!target) {
            target = i8n.singularize(name);
        }
        targetName = findKey(schema.models, target);
        if (targetName) {
            targetModel = schema.models[targetName];
        }

        if (!targetModel) {
            throw new Error(util.format('Unknown target model `%s` to build relationship %s.%s -> %s -> %s',
                target, model.modelName, name, rel.type, target));
        }

        var options = _.omit(rel, ['target', 'model']);
        options.as = options.as || name;
        model[rel.type](targetModel, options);
    }
}

function findKey(models, target) {
    var targetName = target.toLowerCase();
    return _.findKey(models, function (model, name) {
        return name.toLowerCase() === targetName;
    });
}
