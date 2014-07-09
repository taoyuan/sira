"use strict";

var sira = require('../../../../');



module.exports = function (parent, app) {
    var dealerships = {};

    dealerships.echo = function (data, cb) {
        cb(null, data);
    };

    sira.share(dealerships.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    app.on('ready', function () {
        sira.expose.model(app.models.Dealership, dealerships);
    });

    return dealerships;
};

