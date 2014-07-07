"use strict";

var delegate = require('delegates');

var proto = module.exports = {

    /**
     * Throw an error with `msg` and optional `status`
     * defaulting to 500. Note that these are user-level
     * errors, and the message may be exposed to the client.
     *
     *    this.throw(403)
     *    this.throw('name required', 400)
     *    this.throw(400, 'name required')
     *    this.throw('something exploded')
     *    this.throw(new Error('invalid'), 400);
     *    this.throw(400, new Error('invalid'));
     *
     * @param {String|Number|Error} msg err, msg or status
     * @param {String|Number|Error} status err, msg or status
     * @api public
     */

    throw: function(msg, status) {
        if ('number' == typeof msg) {
            var tmp = msg;
            msg = status;// || http.STATUS_CODES[tmp];
            status = tmp;
        }

        var err = msg instanceof Error ? msg : new Error(msg);
        err.status = status || err.status || 500;
        err.expose = err.status < 500;
        throw err;
    },

    arg: function (name) {
        var val = this.payload && this.payload[name];
        // coerce simple types in objects
        if(typeof val === 'object') {
            val = coerceAll(val);
        }

        return val;
    }
};

delegate(proto, 'request')
    .getter('uri')
    .getter('payload');




/**
 * Integer test regexp.
 */

var isint = /^[0-9]+$/;

/**
 * Float test regexp.
 */

var isfloat = /^([0-9]+)?\.[0-9]+$/;

function toFloat(str, defaultVal) {
    var val = parseFloat(str);
    return isNaN(val) ? defaultVal : val;
}

function toInt(str, defaultVal) {
    var val = parseInt(str);
    return isNaN(val) ? defaultVal : val;
}

function coerce(str) {
    if(typeof str != 'string') return str;
    if ('null' == str) return null;
    if ('true' == str) return true;
    if ('false' == str) return false;
    if (isfloat.test(str)) return toFloat(str, 10);
    if (isint.test(str)) return toInt(str, 10);
    return str;
}

// coerce every string in the given object / array
function coerceAll(obj) {
    var type = Array.isArray(obj) ? 'array' : typeof obj;

    switch(type) {
        case 'string':
            return coerce(obj);
            break;
        case 'object':
            if(obj) {
                Object.keys(obj).forEach(function (key) {
                    obj[key] = coerceAll(obj[key]);
                });
            }
            break;
        case 'array':
            obj.map(function (o) {
                return coerceAll(o);
            });
            break;
    }

    return obj;
}
