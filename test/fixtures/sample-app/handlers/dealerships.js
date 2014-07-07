"use strict";

var sira = require('../../../../');

var Dealerships = {};

module.exports = Dealerships;

Dealerships.upsert = function (data, cb) {
    var Dealership = this.app.model('Dealership');
    Dealership.upsert(data, cb);
};

Dealerships.echo = function (data, cb) {
    cb(null, data);
};

sira.remoteMethod(Dealerships.upsert, {
    accepts: { name: 'data', root: true },
    returns: { root: true }
});

sira.remoteMethod(Dealerships.echo, {
    accepts: { name: 'data', root: true },
    returns: { root: true }
});