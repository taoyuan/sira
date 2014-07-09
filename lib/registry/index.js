"use strict";

var _ = require('lodash');
var i8n = require('inflection');
var resolve =require('resolve');
var Schema = require('./schema');

module.exports = Registry;

function Registry(app) {
    if (!this instanceof Registry) return new Registry(app);

    this.app = app;
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

Registry.prototype.define = function (name, desc, setup) {
    if (typeof name === 'object') {
        setup = desc;
        desc = name;
        name = desc.name;
    }
    if (typeof desc === 'function') {
        setup = desc;
        desc = null;
    }
    desc = desc || {};
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

Registry.prototype.build = function (driver, settings, models) {
    var schema;
    if (typeof driver === 'object') {
        models = settings;
        if (driver.define) {
            schema = driver;
        } else {
            settings = driver;
            driver = settings.driver || settings.adapter;
        }
    } else if (typeof settings !== 'object') {
        models = settings;
        settings = null;
    }
    if (!driver) {
        console.log('No driver provided for schema, using in-memory schema');
        driver = 'memory';
    }
    if (!schema) schema = createSchema(driver, settings);

    if (models == '*') models = null;
    if (typeof models === 'string') models = [models];
    if (models && !Array.isArray(models)) {
        throw new Error('`names` must be a string or string array');
    }

    var app = this.app;
    var plugins = this.plugins;
    var defs = models ? _.pick(this.definitions, models) : this.definitions;

    schema.on('beforeDefine', function(name, properties, settings) {
        for (var i = 0; i < plugins.length; i++) {
            if (typeof plugins[i].beforeDefine === "function") {
                plugins[i].beforeDefine(name, properties, settings);
            }
        }
    });

    schema.on('define', function(model, name, properties, settings) {
        if (schema.backyard) {
            schema.backyard.define(name, properties, settings);
        }
        for (var i = 0; i < plugins.length; i++) {
            if (typeof plugins[i].define === "function") {
                plugins[i].define(model, name, properties, settings);
            }
        }
    });


    models = this.models;
    _.forEach(defs, function (def, name) {
        models[name] = schema.define(name, def.properties || def.fields, def.settings);
    });

    _.forEach(defs, function (def) {
        buildRelations(schema, def);
    });

    _.forEach(defs, function (def) {
        if (!def.setups) return;
        for(var i = 0; i < def.setups.length; i++) {
            def.setups[i](models[def.name], app);
        }
    });
    return schema;
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
