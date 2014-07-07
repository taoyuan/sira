"use strict";

var sira = require('../');

exports = module.exports = function (req) {
    return sira().createContext(req);
};