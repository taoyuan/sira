"use strict";

var sira = require('../../../../');

module.exports = function (Car) {
    Car.setupCar = true;

    Car.echo = function (data, cb) {
        cb(null, data);
    };

    Car.order = function (context, cb) {
        var d = context.defer(cancel);
        d.done(cb);

        var h = setTimeout(function () {
            d.resolve(null, true);
        }, 10000);

        function cancel() {
            clearTimeout(h);
        }
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