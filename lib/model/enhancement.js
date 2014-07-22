"use strict";

var _ = require('lodash');
var i8n = require('inflection');

module.exports = function (/*registry*/) {

    return {
        define: function (Model, name/*, properties, settings*/) {
            var pluralName = (Model.settings && Model.settings.plural) || i8n.pluralize(name);
//            var http = [
//                { path: '/' + patherize(name) },
//                { path: '/' + patherize(pluralName) }
//            ];
//            _.assign(http, http[0]); // default http settings for explorer
            hiddenProperty(Model, 'pluralizeModelName', pluralName);
            hiddenProperty(Model, 'http', { path: '/' + patherize(name) });


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

function patherize(str) {
    if (str == str.toUpperCase()) {
        return str.toLowerCase();
    }
    return i8n.transform( str, [ 'underscore', 'dasherize' ]);
}