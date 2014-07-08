"use strict";

var sira = require('../../../../');

var dealerships = {};

module.exports = dealerships;

dealerships.upsert = function (data, cb) {
    var Dealership = this.app.model('Dealership');
    Dealership.upsert(data, cb);
};

dealerships.echo = function (data, cb) {
    cb(null, data);
};

sira.share(dealerships.upsert, {
    accepts: { name: 'data', source: 'payload' },
    returns: { root: true }
});

sira.share(dealerships.echo, {
    accepts: { name: 'data', source: 'payload' },
    returns: { root: true }
});