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

module.exports = function (settings) {

    return function database() {
        var app = this;
        var registry = this.registry;

        if (!settings) {
            settings = {default: {driver: 'memory'}};
        } else if (typeof settings === 'string') {
            settings = {default: {driver: 'settings'}};
        } else if (settings.driver) {
            settings = {default: settings};
        }

        var schema = [];
        _.forEach(settings, function (v, k) {
            var conf = settings[k];
            if (!conf) {
                console.log('No config found for ' + k + ' schema, using in-memory schema');
                conf = {driver: 'memory'};
            }
            schema[k] = registry.build(conf.driver, conf, conf.models);
            schema[k].name = k;
            schema.push(schema[k]);
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



