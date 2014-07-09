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
 *          driver: 'mysql',
 *          models: ['User', 'Role'...]
 *      },
 *      redis: {
 *          driver: 'redis',
 *          models: ['User', 'Role'...]
 *      }
 *  });
 *
 * @param settings database connection settings.
 * @returns {Function}
 */

module.exports = function (settings) {

    return function database() {
        var schemas = this.registry.build(settings);

        if (settings && settings.autoupdate) {
            app.__postprocessors.add(function () {
                _.forEach(schemas, function (s) {
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



