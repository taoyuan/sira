"use strict";

var setup = module.exports = function (Car, app) {
    setup.super_.apply(this, arguments);
    Car.setupCar = true;
};