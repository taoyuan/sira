"use strict";

var sira = require('../../../../');

module.exports = function (Car) {
    Car.setupCar = true;

    Car.echo = function (data, cb) {
        cb(null, data);
    };

    sira.expose(Car.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    sira.expose.model(Car);
};