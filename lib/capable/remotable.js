"use strict";

var _ = require('lodash');

module.exports = function () {

    return function () {
        var remotes = this.remotes;

        _.forEach(this.models, function (Model) {
            var isPublic = true;
            if (Model.settings.hasOwnProperty('public')) {
                isPublic = Model.settings.public;
            }
            if (isPublic && Model.sharedClass) {
                remotes.addClass(Model.sharedClass);
//                if (Model.settings.trackChanges && Model.Change) {
//                    remotes.addClass(Model.Change.sharedClass);
//                }
            }
        });
    }
};