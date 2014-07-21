"use strict";

var i8n = require('inflection');

module.exports = function (/*registry*/) {

    return {
        define: function (Model/*, name, properties, settings*/) {
            var pluralName = (Model.settings && Model.settings.plural) || i8n.pluralize(Model.modelName);
            hiddenProperty(Model, 'pluralizeModelName', pluralName);
            hiddenProperty(Model, 'http', [{ path: '/' + pluralName }]);

            Model.findById = Model.find;

            Model.remove = Model.deleteAll = Model.destroyAll;

            Model.removeById = Model.destroyById = Model.deleteById = function deleteById(id, cb) {
                Model.findById(id, function (err, model) {
                    if (err) return cb(err);
                    if (!model) return cb();
                    model.destroy(cb);
                });
            };

            Model.updateById = function (id, data, cb) {
                Model.findById(id, function (err, model) {
                    if (err) return cb(err);
                    if (!model) return cb();
                    model.updateAttributes(data, cb);
                });
            }
        }
    }
};

function hiddenProperty(where, property, value) {
    Object.defineProperty(where, property, {
        writable: true,
        enumerable: false,
        configurable: true,
        value: value
    });
}