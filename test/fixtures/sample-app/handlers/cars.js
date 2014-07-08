"use strict";

var sira = require('../../../../');

module.exports = function (parent, app) {
    var users = {};

    users.echo = function (data, cb) {
        cb(null, data);
    };

    sira.share(users.echo, {
        accepts: { name: 'data', source: 'payload' },
        returns: { root: true }
    });

    return users;
};