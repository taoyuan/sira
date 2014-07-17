"use strict";

module.exports = function (/*registry*/) {

    return {
        define: function (Model/*, name, properties, settings*/) {
            Model.findById = Model.find;

            Model.destroyById = function (id, cb) {
                Model.findById(id, function (err, model) {
                    if (err) return cb(err);
                    if (!model) return cb();
                    model.destroy(cb);
                });
            }
        }
    }
};