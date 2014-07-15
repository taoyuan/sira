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

    sira.expose.model(app.models.Car, cars);
};