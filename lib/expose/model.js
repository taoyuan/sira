"use strict";

var expose = require('./');

module.exports = function (Model, handler) {

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

    /**
     * Create new instance of Model class, saved in database.
     *
     * @param {Object} [data] Object containing model instance data.
     * @param {Function} callback Callback function (err, model)
     */

    handler.create = function (data, callback) {
        return Model.create(data, callback);
    };

    expose(handler.create, {
        description: 'Create a new instance of the model and persist it into the data source',
        accepts: {arg: 'data', type: 'object', description: 'Model instance data', http: {source: 'body'}},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'post', path: '/'}
    });

    /**
     * Update or insert a model instance
     * @param {Object} data The model instance data
     * @param {Function} [callback] The callback function
     */

    handler.upsert = function upsert(data, callback) {
        return Model.upsert(data, callback);
    };

    /**
     * Alias for upsert function.
     */
    handler.updateOrCreate = handler.upsert;

    // upsert ~ remoting attributes
    expose(handler.upsert, {
        description: 'Update an existing model instance or insert a new one into the data source',
        accepts: {arg: 'data', type: 'object', description: 'Model instance data', source: 'payload', http: {source: 'body'}},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'put', path: '/'}
    });

    /**
     * Find one record instance, same as `all`, limited by one and return object, not collection.
     * If not found, create the record using data provided as second argument.
     *
     * @param {Object} query - search conditions: {where: {test: 'me'}}.
     * @param {Object} data - object to create.
     * @param {Function} cb - callback called with (err, instance)
     */

    handler.findOrCreate = function findOrCreate(query, data, callback) {
        return Model.findOrCreate(query, data, callback);
    };

    /**
     * Check whether a model instance exists in database.
     *
     * @param {id} id - identifier of object (primary key value)
     * @param {Function} cb - callbacl called with (err, exists: Bool)
     */

    handler.exists = function exists(id, cb) {
        return Model.exists(id, cb);
    };

    // exists ~ remoting attributes
    expose(handler.exists, {
        description: 'Check whether a model instance exists in the data source',
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
        returns: {arg: 'exists', type: 'any'},
        http: {verb: 'get', path: '/:id/exists'}
    });

    /**
     * Find object by id
     *
     * @param {*} id - primary key value
     * @param {Function} cb - callback called with (err, instance)
     */

    handler.findById = function find(id, cb) {
        return Model.findById(id, cb);
    };

// find ~ remoting attributes
    expose(handler.findById, {
        description: 'Find a model instance by id from the data source',
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
        returns: {arg: 'data', type: 'any', root: true},
        http: {verb: 'get', path: '/:id'},
        rest: {after: convertNullToNotFoundError}
    });

    /**
     * Find all instances of Model, matched by query
     * make sure you have marked as `index: true` fields for filter or sort
     *
     * @param {Object} params (optional)
     *
     * - where: Object `{ key: val, key2: {gt: 'val2'}}`
     * - include: String, Object or Array. See handler.include documentation.
     * - order: String
     * - limit: Number
     * - skip: Number
     *
     * @param {Function} callback (required) called with arguments:
     *
     * - err (null or Error)
     * - Array of instances
     */

    handler.find = function find(params, cb) {
        return Model.find(params, cb);
    };

    // all ~ remoting attributes
    expose(handler.find, {
        description: 'Find all instances of the model matched by filter from the data source',
        accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
        returns: {arg: 'data', type: 'array', root: true},
        http: {verb: 'get', path: '/'}
    });

    /**
     * Find one record, same as `all`, limited by 1 and return object, not collection
     *
     * @param {Object} params - search conditions: {where: {test: 'me'}}
     * @param {Function} cb - callback called with (err, instance)
     */

    handler.findOne = function findOne(params, cb) {
        return Model.findOne(params, cb);
    };

    expose(handler.findOne, {
        description: 'Find first instance of the model matched by filter from the data source',
        accepts: {arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
        returns: {arg: 'data', type: 'object', root: true},
        http: {verb: 'get', path: '/findOne'}
    });

    /**
     * Destroy all matching records
     * @param {Object} [where] An object that defines the criteria
     * @param {Function} [cb] - callback called with (err)
     */

    handler.remove =
        handler.deleteAll =
            handler.destroyAll = function destroyAll(where, cb) {
                return Model.destroyAll(where, cb);
            };

    /**
     * Destroy a record by id
     * @param {*} id The id value
     * @param {Function} cb - callback called with (err)
     */

    handler.removeById =
        handler.deleteById =
            handler.destroyById = function deleteById(id, cb) {
                return Model.destroyById(id, cb);
            };

    // deleteById ~ remoting attributes
    expose(handler.deleteById, {
        description: 'Delete a model instance by id from the data source',
        accepts: {arg: 'id', type: 'any', description: 'Model id', required: true},
        http: {verb: 'del', path: '/:id'}
    });

    /**
     * Return count of matched records
     *
     * @param {Object} where - search conditions (optional)
     * @param {Function} cb - callback, called with (err, count)
     */

    handler.count = function (where, cb) {
        return Model.count(where, cb);
    };

    // count ~ remoting attributes
    expose(handler.count, {
        description: 'Count instances of the model matched by where from the data source',
        accepts: {arg: 'where', type: 'object', description: 'Criteria to match model instances'},
        returns: {arg: 'count', type: 'number'},
        http: {verb: 'get', path: '/count'}
    });

    return handler;

}
