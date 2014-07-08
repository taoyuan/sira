"use strict";

var setup = module.exports = function (Car, app) {
    setup.parent.apply(this, arguments);
    Car.setupCar = true;
};