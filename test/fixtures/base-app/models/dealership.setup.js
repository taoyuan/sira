"use strict";

var sira = require('../../../../');

module.exports = function (Dealership) {

    Dealership.baseMethod = function () {};

    Dealership.echo = function (data, cb) {
        cb(null, data);
    };

    sira.share(Dealership.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    sira.expose.model(Dealership);
};