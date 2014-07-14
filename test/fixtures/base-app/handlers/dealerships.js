"use strict";

var sira = require('../../../../');

module.exports = function (app) {
    var dealerships = this;

    dealerships.echo = function (data, cb) {
        cb(null, data);
    };

    sira.share(dealerships.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    app.on('models', function (models) {
        sira.expose.model(models.Dealership, dealerships);
    });

};

