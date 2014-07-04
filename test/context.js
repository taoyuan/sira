"use strict";

var sira = require('../');

exports = module.exports = function (cmd) {
    return sira().createContext(cmd);
};