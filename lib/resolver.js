/**
 * Creates an instance of `Resolver`.
 *
 * A resolver is responsible for resolving a module ID to its corresponding
 * path on the filesystem.
 *
 * Noa uses a resolver to locate controller modules, which are loaded
 * and instantiated in order to handle requests.
 *
 * @constructor
 * @api protected
 */
function Resolver() {
    if (!(this instanceof Resolver)) return new Resolver();
    this.stack = [];
}

/**
 * Resolve `id`.
 *
 * @param {String} id
 * @return {String}
 * @api protected
 */
Resolver.prototype.resolve = function (id) {
    var stack = this.stack
        , layer, prefix, mid, rid;
    for (var i = 0, len = stack.length; i < len; ++i) {
        layer = stack[i];
        prefix = layer.prefix;
        if (id.indexOf(prefix) !== 0) {
            continue;
        }
        mid = id.slice(prefix.length);
        rid = layer.fn(mid);
        if (rid) {
            return rid;
        }
    }
    throw new Error("Unable to resolve '" + id + "'");
};

/**
 * Utilize new mechanism `fn`, optionally scoped to `prefix`.
 *
 * @param {String|Function} prefix
 * @param {Function} fn
 * @api protected
 */
Resolver.prototype.use = function (prefix, fn) {
    if (typeof prefix == 'function') {
        fn = prefix;
        prefix = '';
    }
    if (prefix.length && prefix[prefix.length - 1] != '/') {
        prefix += '/';
    }
    this.stack.push({ prefix: prefix, fn: fn });
};


/**
 * Expose `Resolver`.
 */
module.exports = Resolver;
