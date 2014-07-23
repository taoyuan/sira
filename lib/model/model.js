"use strict";

var i8n = require('inflection');
var List = require('jugglingdb/lib/list');

module.exports = function (/*registry*/) {
    return {
        define: define
    }
};

function define(Model, name, properties, settings) {
    var pluralName = (Model.settings && Model.settings.plural) || i8n.pluralize(name);

    hiddenProperty(Model, 'pluralizeModelName', pluralName);
    hiddenProperty(Model, 'http', { path: '/' + patherize(name) });
    hiddenProperty(Model, 'definition', { name: name, properties: properties, settings: settings });

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
    };

    Model.prototype.toObject = function (onlySchema, excludeHidden) {
        var data = {};
        var self = this;

        this.constructor.forEachProperty(function (attr) {
            if (excludeHidden && self.isHiddenProperty(attr)) return;
            var val = self[attr] || self.__data[attr];
            assign(data, attr, val);
        });

        if (!onlySchema) {
            Object.keys(self).forEach(function (attr) {
                assign(data, attr, self[attr]);
            });

            if (this.__cachedRelations) {
                var relations = this.__cachedRelations;
                Object.keys(relations).forEach(function (attr) {
                    assign(data, attr, relations[attr]);
                });
            }
        }

        return data;

        function assign(data, attr, val) {
            if (excludeHidden && self.isHiddenProperty(attr)) return;
            if (data[attr] !== undefined) return;
            data[attr] = toObject(val);
        }

        function toObject(val) {
            if (val === undefined || val === null) return val;
            if (val instanceof List) {
                return val.toObject();
            }

            if (typeof val.toObject === 'function') {
                return val.toObject(onlySchema, excludeHidden);
            }

            if (Array.isArray(val)) {
                return val.map(function (item) {
                    return toObject(item);
                });
            }

            return val;
        }
    };

    Model.prototype.isHiddenProperty = function (propertyName) {
        var hiddenProperties = settings && (settings.hiddenProperties || settings.hidden);
        if (Array.isArray(hiddenProperties)) {
            // Cache the hidden properties as an object for quick lookup
            settings.hiddenProperties = {};
            for (var i = 0; i < hiddenProperties.length; i++) {
                settings.hiddenProperties[hiddenProperties[i]] = true;
            }
            hiddenProperties = settings.hiddenProperties;
        }
        if (hiddenProperties) {
            return hiddenProperties[propertyName];
        } else {
            return false;
        }
    };

    Model.prototype.toJSON = function () {
        return this.toObject(false, true);
    };
}

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
    return i8n.transform(str, [ 'underscore', 'dasherize' ]);
}

