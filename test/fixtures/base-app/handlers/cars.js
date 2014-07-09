"use strict";

var sira = require('../../../../');

module.exports = function (parent, app) {
    var cars = {};

    cars.echo = function (data, cb) {
        cb(null, data);
    };

    sira.expose(cars.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    app.on('ready', function () {
        sira.expose.model(app.models.Car, cars);
    });

    return cars;
};