"use strict";

var sira = require('../../../../');

module.exports = function (Car) {
    Car.setupCar = true;

    Car.echo = function (data, cb) {
        cb(null, data);
    };

    Car.order = function (context, cb) {
        var h;
        context.possible.canceled(function cancel() {
            h && clearTimeout(h);
        });

        h = setTimeout(function () {
            cb(null, true);
        }, 500);
    };

    Car.expose('echo', {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    Car.expose('order', {
        accepts: { name: 'context', source: 'context' },
        returns: { root: true }
    });
};