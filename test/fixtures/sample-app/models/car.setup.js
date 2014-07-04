"use strict";

var setup = module.exports = function (Car, noa) {
    setup.super_.apply(this, arguments);
    Car.setupCar = true;
};