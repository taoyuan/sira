"use strict";

var setup = module.exports = function (Car, noa) {
    setup.super_.apply(this, arguments);
    noa.log && noa.log('Car');
};