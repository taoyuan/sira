"use strict";

var async = require('async');

module.exports = function (next) {
    var c = this;
    var data = this.request.payload;

    async.waterfall([
        function (cb) {
            c.Dealership.findOne({where: {name: data.name}}, cb);
        },
        function (dealership, cb) {
            if (dealership) data.id = dealership.id;
            c.Dealership.upsert(data, cb);
        }

    ],function (err, dealership) {
        if (err) return next(err);
        c.result = dealership;
        next();
    });
};