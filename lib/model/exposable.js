"use strict";

var SharedClass = require('strong-remoting').SharedClass;

module.exports = function (/*registry*/) {

    return {
        define: function (Model, name, properties, settings) {
//            if (!settings.public) return;
            Model.sharedClass = new SharedClass(name, Model, settings['remoting']);

            Model.expose = function(name, options) {
                if(options.isStatic === undefined) {
                    options.isStatic = true;
                }
                this.sharedClass.defineMethod(name, options);
            };

            exposePersisted(Model);
        }
    }
};


function exposePersisted(Model) {

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
        accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'post', path: '/'}
    });

    // update ~ remoting attributes
    expose(Model, 'updateById', {
        description: 'Update attributes for a model instance and persist it into the database',
        accepts: [
            {arg: 'id', type: 'any', description: 'Model id', required: true},
            {arg: 'data', type: 'object', source: 'payload', http: {source: 'body'}, description: 'An object of model property name/value pairs'}
        ],
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'put', path: '/:id'}
    });

    /**
     * Alias for upsert function.
     */
    Model.updateOrCreate = Model.upsert;

    // upsert ~ remoting attributes
    expose(Model, 'upsert', {
        description: 'Update an existing model instance or insert a new one into the data source',
        accepts: {arg: 'data', type: 'object', description: 'Model instance data', source: 'payload', http: {source: 'body'}},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'put', path: '/'}
    });

    // exists ~ remoting attributes
    expose(Model, 'exists', {
        description: 'Check whether a model instance exists in the data source',
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
        returns: {arg: 'exists', type: 'any'},
        http: {verb: 'get', path: '/:id/exists'}
    });

    // find ~ remoting attributes
    expose(Model, 'findById', {
        description: 'Find a model instance by id from the data source',
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
        returns: {arg: 'data', type: 'any', root: true},
        http: {verb: 'get', path: '/:id'},
        rest: {after: convertNullToNotFoundError}
    });

    // all ~ remoting attributes
    expose(Model, 'all', {
        description: 'Find all instances of the model matched by filter from the data source',
        accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
        returns: {arg: 'data', type: 'array', root: true},
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
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
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