"use strict";

var _ = require('lodash');
var Schema = require('jugglingdb').Schema;

/**
 * Database initialization phase.
 *
 * @examples
 *
 * app.phase(app.boot.database({ driver: 'redis' });
 *
 * app.phase(app.boot.database({
 *      mysql: {
 *          driver: 'mysql'
 *      },
 *      redis: {
 *          driver: 'redis'
 *      }
 *  }, {
 *      mysql: ['User', 'Role'...],
 *      redis: ['Cache']
 *  });
 *
 * @param settings database connection settings.
 * @param schemap schema map to database
 * @returns {Function}
 */

module.exports = function (settings, schemap) {

    return function database() {
        var app = this;
        var registry = require('../registry')(this.__definitions);

        if (settings.driver || settings.provider) {
            settings = {
                default: settings
            }
        }

        if (!schemap || schemap === '*') {
            schemap = { default: '*' };
        } else if (typeof schemap === 'string') {
            schemap = { default: [schemap] }
        } else if (Array.isArray(schemap)) {
            schemap = { default: schemap };
        }

        var schema = [];
        _.forEach(schemap, function (v, k) {
            var conf = settings[k];
            if (!conf) {
                console.log('No config found for ' + k + ' schema, using in-memory schema');
                conf = {driver: 'memory'};
            }
            schema[k] = new Schema(conf.driver, conf);
            schema[k].on('define', function(m, name, prop, sett) {
                app.model(enhance(m));
                if (conf.backyard) {
                    schema[k].backyard.define(name, prop, sett);
                }
            });
            schema[k].name = k;
            schema.push(schema[k]);
            if (conf.backyard) {
                schema[k].backyard = new Schema(conf.backyard.driver, conf.backyard);
            }

            var models = registry.apply(schema[k], v);
//            if (conf.backyard) {
//                registry.apply(schema[k].backyard, v);
//            }

            _.forEach(models, function (model) {
                if (model.setup) model.setup(model, app);
            });

        });

        app.schema = schema;

        if (settings.autoupdate) {
            app.__postprocessors.add(function () {
                _.forEach(schema, function (s) {
                    s.autoupdate();
                    if (s.backyard) {
                        s.backyard.autoupdate();
                        s.backyard.log = s.log;
                    }
                });
            });
        }
    }
};

function enhance(Model) {
    middistModelHooks(Model);
    Model.findById = Model.find;
    return Model;
}

function middistModelHooks(Model) {
    var hooks = require('middist')();

    Model.hook = function (hook, fn) {
        if (!Model[hook]) Model[hook] = function (next, data) {
            hooks.handle(hook, data, next);
        };
        hooks.use(hook, fn);
    };

    return Model;
}




