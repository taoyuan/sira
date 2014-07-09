"use strict";

module.exports = function (/*registry*/) {

    return {
        define: function (Model/*, name, properties, settings*/) {
            Model.findById = Model.find;
        }
    }
};