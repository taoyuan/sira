"use strict";

var sira = require('../../../../');

var setup = module.exports = function (Dealership, app) {
    setup.super_.apply(this, arguments);

    Dealership.echo = function (data, cb) {
        cb(null, data);
    };

    sira.remoteMethod(Dealership.echo, {
        accepts: [
            {name: 'data', source: 'payload'}
        ],
        returns: {
            arg: 'data', root: true
        }
    });
};