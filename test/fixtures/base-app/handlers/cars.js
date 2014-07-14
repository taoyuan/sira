"use strict";

var sira = require('../../../../');

module.exports = function (app) {
    var cars = this;

    cars.echo = function (data, cb) {
        cb(null, data);
    };

    sira.expose(cars.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    app.on('models', function (models) {
        sira.expose.model(models.Car, cars);
    });
};