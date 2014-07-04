"use strict";

var noa = require('../');

exports = module.exports = function (cmd) {
    return noa().createContext(cmd);
};