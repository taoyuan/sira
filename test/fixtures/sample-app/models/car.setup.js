"use strict";

var setup = module.exports = function (Car, sira) {
    setup.super_.apply(this, arguments);
    Car.setupCar = true;
};