"use strict";

var Remotes = require('strong-remoting');
var SharedClass = Remotes.SharedClass;

module.exports = function (/*registry*/) {

    return {
        define: function (Model, name, properties, settings) {
            Model.sharedClass = new SharedClass(name, Model, settings['remoting']);

            Model.expose = function(name, options) {
                options = options || {};
                if(options.isStatic === undefined) {
                    options.isStatic = true;
                }
                standartize(options);
                this.sharedClass.defineMethod(name, options);
            };

            Model.exposeCrud = function () {
                exposeCrud(Model);
            };

            // setup a remoting type converter for this model
            Remotes.convert(name, function(val) {
                return val ? new Model(val) : val;
            });

            if (settings['crud']) {
                Model.exposeCrud();
            }
        }
    }
};

function standartize(options) {
    var accepts = options.accepts;

    if (accepts) {
        // for explorer generating gui
        if (Array.isArray(accepts)) {
            accepts.forEach(function (accept) {
                httperize(accept);
            })
        } else {
            httperize(accepts);
        }
    }

    return options;

}

function httperize(accept) {
    if (!accept || !accept.source) return;
    accept.http = accept.http || {};
    accept.http.source = accept.source === 'payload' ? 'body' : accept.source;
}

function exposeCrud(Model) {

    var modelType = Model.modelName;

    function expose(scope, name, options) {
        var fn = scope[name];
        fn._delegate = true;
        options.isStatic = scope === Model;
        Model.expose(name, options);
    }

    /*!
     * Convert null callbacks to 404 error objects.
     * @param  {HttpContext} ctx
     * @param  {Function} cb
     */

    function convertNullToNotFoundError(ctx, cb) {
        if (ctx.result !== null) return cb();

        var modelName = ctx.method.sharedClass.name;
        var id = ctx.getArgByName('id');
        var msg = 'Unknown "' + modelName + '" id "' + id + '".';
        var error = new Error(msg);
        error.statusCode = error.status = 404;
        cb(error);
    }

    expose(Model, 'create', {
        description: 'Create a new instance of the model and persist it into the data source',
        accepts: {arg: 'data', type: 'object', source: 'body', description: 'Model instance data'},
        returns: {arg: 'data', type: modelType, root: true},
        http: {verb: 'post', path: '/'}
    });

    // update ~ remoting attributes
    expose(Model, 'updateById', {
        description: 'Update attributes for a model instance and persist it into the database',
        accepts: [
            {arg: 'id', type: 'any', required: true, description: 'Model id'},
            {arg: 'data', type: 'object', source: 'body', description: 'An object of model property name/value pairs'}
        ],
        returns: {arg: 'data', type: modelType, root: true},
        http: {verb: 'put', path: '/:id'}
    });

    // upsert ~ remoting attributes
    expose(Model, 'upsert', {
        description: 'Update an existing model instance or insert a new one into the data source',
        accepts: {arg: 'data', type: 'object', source: 'body', description: 'Model instance data'},
        returns: {arg: 'data', type: modelType, root: true},
        http: {verb: 'put', path: '/'}
    });

    // exists ~ remoting attributes
    expose(Model, 'exists', {
        description: 'Check whether a model instance exists in the data source',
        accepts: {arg: 'id', type: 'any', required: true, description: 'Model id'},
        returns: {arg: 'exists', type: 'boolean'},
        http: {verb: 'get', path: '/:id/exists'}
    });

    // find ~ remoting attributes
    expose(Model, 'findById', {
        description: 'Find a model instance by id from the data source',
        accepts: {arg: 'id', type: 'any', required: true, description: 'Model id'},
        returns: {arg: 'data', type: modelType, root: true},
        http: {verb: 'get', path: '/:id'},
        rest: {after: convertNullToNotFoundError}
    });

    // all ~ remoting attributes
    expose(Model, 'all', {
        description: 'Find all instances of the model matched by filter from the data source',
        accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
        returns: {arg: 'data', type: [modelType], root: true},
        http: {verb: 'get', path: '/'}
    });

    expose(Model, 'findOne', {
        description: 'Find first instance of the model matched by filter from the data source',
        accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'get', path: '/findOne'}
    });

    // deleteById ~ remoting attributes
    expose(Model, 'deleteById', {
        description: 'Delete a model instance by id from the data source',
        accepts: {arg: 'id', type: 'any', required: true, description: 'Model id'},
        http: {verb: 'del', path: '/:id'}
    });

    // count ~ remoting attributes
    expose(Model, 'count', {
        description: 'Count instances of the model matched by where from the data source',
        accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
        returns: {arg: 'count', type: 'number'},
        http: {verb: 'get', path: '/count'}
    });
}